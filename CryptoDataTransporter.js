export const RedirectDataFromApi = () => {
  const httpLink = new HttpLink({
    uri: "http://localhost:4000/graphql",
    fetch,
  });

  const wsLink = new GraphQLWsLink(
    createClient({
      url: "ws://localhost:4000/graphql",
      webSocketImpl: WebSocket,
      options: { reconnect: true },
    })
  );

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink
  );

  const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  });

  const serverAddress = "wss://ws-feed.exchange.coinbase.com";
  const ws = new WebSocket(serverAddress);
  const inputData = {
    type: "subscribe",
    product_ids: ["ETH-USD"],
    channels: ["ticker_batch"],
  };
};
