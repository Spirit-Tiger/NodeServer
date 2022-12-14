import usersResolvers from "./users.js";
import ordersResolvers from "./orders.js";
import adminsResolvers from "./admins.js";

const resolvers = {
  Query: {
    ...usersResolvers.Query,
    ...adminsResolvers.Query,
  },
  Mutation: {
    ...usersResolvers.Mutation,
    ...ordersResolvers.Mutation,
    ...adminsResolvers.Mutation,
  },
  Subscription: {
    ...usersResolvers.Subscription,
    ...ordersResolvers.Subscription,
  },
};

export default resolvers;
