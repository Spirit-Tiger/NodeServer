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
      product_ids: cryptoArr,
      channels: ["ticker"],
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
        // console.log("Получены данные " + pair.price + pair.product_id);
      };
    });

    // await client
    //   .subscribe({
    //     query: SubscribeCrypto,
    //   }).subscribe({next(res){console.log("res",res)},
    // error(err){console.log(err)}})

    const connectTranfer = async () => {
      await new Promise((resolve, reject) => {
        client
          .subscribe({
            query: SubscribeCrypto,
          })
          .subscribe({
            next(data) {
              
            },
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
    // setInterval(() => {
    //   client
    //     .query({
    //       query: gql`
    //         query TestQuery {
    //           getUsers {
    //             id
    //             username
    //           }
    //         }
    //       `,
    //     })
    //     .then((result) => console.log(result.data.getUsers[1]));
    // }, 10000);
  });

// const wss = new WebSocket.Server()

// ws.on("message", function (res) {

//   console.log("server responce", res);
// });
