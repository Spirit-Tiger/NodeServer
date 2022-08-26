import { ApolloServer } from "apollo-server-express";
import express from "express";
import mongoose from "mongoose";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import cors from "cors";

import typeDefs from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers/index.js";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  context: ({ req }) => ({ req }),
});

mongoose
  .connect(
    "mongodb+srv://Admin:Admin@graphqlstudycluster.ll0xk0o.mongodb.net/gqllearn?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )
  .then(async () => {
    console.log("MongoDB Connected");
    await server.start();

    const app = express();

    app.use(graphqlUploadExpress());
    app.use(cors());

    server.applyMiddleware({ app });
    await new Promise((r) => app.listen({ port: process.env.PORT || 4000 }, r));
    console.log(
      `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
    );
  });
