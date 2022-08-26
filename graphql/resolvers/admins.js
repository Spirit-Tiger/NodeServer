import { UserInputError } from "apollo-server";

import User from "../../models/User.js";
import checkAuth from "../../utils/check-auth.js";

const adminsResolvers = {
  Mutation: {
    async changeBalance(_, { userId, balance }) {
      const user = await User.findById(userId);
      if (user) {
        user.balance = balance;
        await user.save();
        return user;
      } else throw new UserInputError("User not found");
    },
    async verifyUser(_, { userId, verified }) {
      try {
        const user = await User.findById(userId);
        if (user) {
          user.verified = verified;
          console.log(user.verified);
          await user.save();
          return user;
        }
        throw new Error("User not found");
      } catch (err) {
        throw new Error(err);
      }
    },
    async changeOpenPrice(_, { userId, orderId, changedPrice }) {
      const user = await User.findById(userId);
      if (user) {
        const orderIndex = user.orders.findIndex(
          (order) => order.id === orderId
        );
        if (user.orders[orderIndex]) {
          user.orders[orderIndex].openPrice = changedPrice;
          await user.save();
          return user;
        } else throw new UserInputError("Order is aleary closed");
      } else throw new UserInputError("User not found");
    },
    async changeWallet(_, { userId, wallet }) {
      const user = await User.findById(userId);
      if (user) {
        user.wallet = wallet;

        await user.save();
        return user;
      } else throw new UserInputError("User not found");
    },
  },
};

export default adminsResolvers;
