import { ApolloServer, gql } from "apollo-server-express";
import express from "express";
import mongoose from "mongoose";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import cors from "cors";
import WebSocket from "ws";
import { createServer } from "http";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions/subscriptions.cjs";

import { createClient } from "graphql-ws";

import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from "apollo-server-core";

import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";

import typeDefs from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers/index.js";
import pkg from "@apollo/client/core/core.cjs";
const { ApolloClient, HttpLink, InMemoryCache, split } = pkg;
import fetch from "cross-fetch";
import { getMainDefinition } from "@apollo/client/utilities/utilities.cjs";
import { cryptoArr } from "./data.js";
import { getDate, getProfit } from "./utils/getDate.js";

mongoose
  .connect(
    "mongodb+srv://Admin:Admin@graphqlstudycluster.ll0xk0o.mongodb.net/gqllearn?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )
  .then(async () => {
    console.log("MongoDB Connected");

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    const app = express();
    app.use(graphqlUploadExpress());
    app.use(cors());
    const httpServer = createServer(app);

    const wsServer = new WebSocketServer({
      server: httpServer,
      path: "/graphql",
    });

    const serverCleanup = useServer(
      {
        schema,
      },
      wsServer
    );

    const server = new ApolloServer({
      schema,
      introspection: true,
      playground: true,
      csrfPrevention: true,
      cache: "bounded",
      context: ({ req }) => ({ req }),
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
          async serverWillStatr() {
            return {
              async drainServer() {
                serverCleanup.dispose();
              },
            };
          },
        },
        ApolloServerPluginLandingPageLocalDefault({ embed: true }),
      ],
    });

    await server.start();

    server.applyMiddleware({ app });

    await new Promise((resolve) =>
      httpServer.listen({ port: process.env.PORT || 4000 }, resolve)
    );
    console.log(
      `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
    );
  })
  .then(async () => {
    const httpLink = new HttpLink({
      uri: "https://young-everglades-11726.herokuapp.com/graphql",
      //uri: "http://localhost:4000/graphql",
      fetch,
    });

    const wsLink = new GraphQLWsLink(
      createClient({
        url: "ws://young-everglades-11726.herokuapp.com/graphql",
        //url: "ws://localhost:4000/graphql",
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
      product_ids: cryptoArr,
      channels: ["ticker_batch"],
    };

    const GetCrypto = gql`
      query GetPair($productId: String!) {
        getCryptoInfo(product_id: $productId) {
          product_id
          price
        }
      }
    `;

    const UpdateMutation = gql`
      mutation UpdatePair($product_id: String!, $price: String!) {
        updateCryptoInfo(product_id: $product_id, price: $price) {
          product_id
          price
        }
      }
    `;

    const SubscribeCrypto = gql`
      subscription CryptoUpdated {
        cryptoUpdated {
          price
          product_id
        }
      }
    `;

    const SubscribeOrders = gql`
      subscription LimitsCheck {
        limitsCheck {
          user_id
          order_id
          symbol
          orderType
          openPrice
          volume
          sl
          tp
        }
      }
    `;

    const connectTranfer = async () => {
      await new Promise((resolve, reject) => {
        client
          .subscribe({
            query: SubscribeCrypto,
          })
          .subscribe({
            next(data) {},
            error(err) {
              console.log(`Finished with error: ${err}`),
                setTimeout(() => {
                  connectTranfer();
                }, 15000);
            },
            complete() {
              console.log("Finished");
            },
          });
      });
    };
    connectTranfer();

    const ADD_LIMIT_ORDERS = gql`
      mutation AddLimitOrders($limitOrderInput: LimitOrderInput!) {
        addLimitOrders(limitOrderInput: $limitOrderInput) {
          user_id
          order_id
          symbol
          orderType
          openPrice
          volume
          sl
          tp
        }
      }
    `;

    const DELETE_LIMIT_ORDER = gql`
      mutation DeleteLimitOrder($order_id: String!) {
        deleteLimitOrder(order_id: $order_id) {
          order_id
        }
      }
    `;

    const CLOSE_ORDER = gql`
      mutation CloseOrder(
        $orderId: ID!
        $closedPrice: Float!
        $profit: String!
        $userId: ID!
        $closedDate: String!
      ) {
        closeOrder(
          orderId: $orderId
          closedPrice: $closedPrice
          profit: $profit
          userId: $userId
          closedDate: $closedDate
        ) {
          ordersCounter
          balance
          orders {
            id
            symbol
            createDate
            leverage
            openPrice
            orderId
            sl
            tp
            orderType
            volume
          }
          tradeHistory {
            orderId
            closedDate
            closedPrice
            createDate
            id
            openPrice
            profit
            sl
            symbol
            tp
            volume
            orderType
          }
        }
      }
    `;

    const ordersCheck = async () => {
      let newArr = [];
      client
        .query({
          query: gql`
            query TestQuery {
              getLimitOrders {
                user_id
                order_id
                symbol
                orderType
                openPrice
                volume
                sl
                tp
              }
            }
          `,
        })
        .then((result) => {
          console.log("!!!!!!!!!!!!!!!", result.data.getLimitOrders);
          newArr = [...result.data.getLimitOrders];
        });
      ws.on("open", function () {
        ws.send(JSON.stringify(inputData));
        ws.onmessage = function (res) {
          let pair = JSON.parse(res.data);
          if (pair.product_id) {
            client.mutate({
              mutation: UpdateMutation,
              variables: { product_id: pair.product_id, price: pair.price },
            });
          }
          if (pair.product_id && newArr !== []) {
            newArr.map((item, index) => {
              const profit = getProfit(
                item.orderType,
                item.openPrice,
                pair.price,
                item.volume
              );
              const data = getDate();
              if (item.symbol === pair.product_id) {
                if (
                  item.sl !== 0 &&
                  item.orderType === "Sell" &&
                  item.sl <= Number(pair.price)
                ) {
                  console.log("1", item, pair.price);
                  client.mutate({
                    mutation: CLOSE_ORDER,
                    variables: {
                      orderId: item.order_id,
                      closedPrice: Number(Number(pair.price).toFixed(2)),
                      profit: `${profit}`,
                      userId: item.user_id,
                      closedDate: data,
                    },
                  });
                  client.mutate({
                    mutation: DELETE_LIMIT_ORDER,
                    variables: {
                      order_id: item.order_id,
                    },
                  });
                  console.log(profit, index);
                  newArr.splice(index, 1);
                }
                if (
                  item.sl !== 0 &&
                  item.orderType === "Buy" &&
                  item.sl >= Number(pair.price)
                ) {
                  console.log("2", item, pair.price);
                  newArr.splice(index, 1);
                  client.mutate({
                    mutation: CLOSE_ORDER,
                    variables: {
                      orderId: item.order_id,
                      closedPrice: Number(Number(pair.price).toFixed(2)),
                      profit: `${profit}`,
                      userId: item.user_id,
                      closedDate: data,
                    },
                  });
                  client.mutate({
                    mutation: DELETE_LIMIT_ORDER,
                    variables: {
                      order_id: item.order_id,
                    },
                  });
                  console.log(profit);
                }
                if (
                  item.tp !== 0 &&
                  item.orderType === "Sell" &&
                  item.tp >= Number(pair.price)
                ) {
                  console.log("3", item, pair.price);
                  newArr.splice(index, 1);
                  client.mutate({
                    mutation: CLOSE_ORDER,
                    variables: {
                      orderId: item.order_id,
                      closedPrice: Number(Number(pair.price).toFixed(2)),
                      profit: `${profit}`,
                      userId: item.user_id,
                      closedDate: data,
                    },
                  });
                  client.mutate({
                    mutation: DELETE_LIMIT_ORDER,
                    variables: {
                      order_id: item.order_id,
                    },
                  });
                  console.log(profit);
                }
                if (
                  item.tp !== 0 &&
                  item.orderType === "Buy" &&
                  item.tp <= Number(pair.price)
                ) {
                  console.log("4", item, pair.price);
                  newArr.splice(index, 1);
                  client.mutate({
                    mutation: CLOSE_ORDER,
                    variables: {
                      orderId: item.order_id,
                      closedPrice: Number(Number(pair.price).toFixed(2)),
                      profit: `${profit}`,
                      userId: item.user_id,
                      closedDate: data,
                    },
                  });
                  client.mutate({
                    mutation: DELETE_LIMIT_ORDER,
                    variables: {
                      order_id: item.order_id,
                    },
                  });
                  console.log(profit);
                }
              }
            });
          }
          // console.log("pair", newpairdId);
          // console.log("Получены данные " + pair.price + pair.product_id);
        };
      });
      await new Promise((resolve, reject) => {
        client
          .subscribe({
            query: SubscribeOrders,
          })
          .subscribe({
            next(data) {},
            error(err) {
              console.log(`Finished with error: ${err}`),
                setTimeout(() => {
                  ordersCheck();
                }, 10000);
            },
            complete() {
              console.log("Finished");
            },
          });
      });
    };
    ordersCheck();
  });
