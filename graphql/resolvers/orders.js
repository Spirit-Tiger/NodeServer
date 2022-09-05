import { UserInputError, AuthenticationError } from "apollo-server";

import User from "../../models/User.js";
import checkAuth from "../../utils/check-auth.js";
import { getDate } from "../../utils/getDate.js";

const ordersResolvers = {
  Mutation: {
    async createOrder(
      _,
      {
        userId,
        orderInput: {
          orderId,
          createDate,
          symbol,
          orderType,
          volume,
          openPrice,
          sl,
          tp,
          leverage,
        },
      },
      context
    ) {
      // const { id: userId } = checkAuth(context);
      if (volume === 0) {
        throw new UserInputError("Empty volume");
      }
      const user = await User.findById(userId);
      if (user) {
        user.ordersCounter += 1;
        user.balance -= volume;
        user.orders.push({
          orderId,
          createDate,
          symbol,
          orderType,
          volume,
          openPrice,
          sl,
          tp,
          leverage,
        });
        await user.save();
        return user;
      } else throw new AuthenticationError("User authentication error");
    },
    async closeOrder(_, { orderId, closedPrice, profit, userId, closedDate }, context) {
      // const { id: userId } = checkAuth(context);
      const user = await User.findById(userId);
      if (user) {
        const orderIndex = user.orders.findIndex(
          (order) => order.id === orderId
        );

        if (user.orders[orderIndex]) {
          const closedOrder = user.orders.splice(orderIndex, 1);
          const {
            createDate,
            symbol,
            orderType,
            volume,
            openPrice,
            sl,
            tp,
            orderId,
          } = closedOrder[0];
          user.tradeHistory.push({
            orderId,
            closedPrice,
            createDate,
            profit,
            symbol,
            orderType,
            volume,
            openPrice,
            sl,
            tp,
            closedDate,
          });
          user.balance += Number((volume + parseFloat(profit)).toFixed(2));
          user.balance = Number(user.balance.toFixed(2));
          await user.save();
          return user;
        } else throw new UserInputError("Order is aleary closed");
      } else throw new AuthenticationError("User authentication error");
    },
    async cleanHistory(_, { userId }) {
      const user = await User.findById(userId);
      if (user) {
        user.tradeHistory = [];
        await user.save();
        return user;
      } else throw new AuthenticationError("User authentication error");
    },
    async deleteOrderFromHistory(_, { userId, orderId }) {
      const user = await User.findById(userId);
      if (user) {
        const orderIndex = user.tradeHistory.findIndex(
          (order) => order.id === orderId
        );
        if (user.tradeHistory[orderIndex]) {
          const closedOrder = user.tradeHistory.splice(orderIndex, 1);
          console.log(closedOrder);
          await user.save();
          return user;
        } else throw new AuthenticationError("User authentication error");
      }
    },
  },
};

export default ordersResolvers;
