import { ApolloServer } from "apollo-server-express";
import express from "express";
import mongoose from "mongoose";
import  graphqlUploadExpress  from "graphql-upload/graphqlUploadExpress.mjs";

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
    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", '*');
      res.header("Access-Control-Allow-Credentials", true);
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
      next();
  });

    server.applyMiddleware({ app });
    await new Promise((r) => app.listen({ port: process.env.PORT || 4000 }, r));
    console.log(
      `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
    );
  });
