import { UserInputError, AuthenticationError } from "apollo-server";

import User from "../../models/User.js";
import { PubSub, withFilter } from "graphql-subscriptions";
import checkAuth from "../../utils/check-auth.js";
const pubsub = new PubSub();

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
      try {
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
          console.log("orders", user.orders[user.orders.length - 1]._id);
          const trackOrder = {
            user_id: userId,
            order_id: user.orders[user.orders.length - 1]._id,
            symbol,
            orderType,
            openPrice,
            volume,
            sl,
            tp,
          };
          pubsub.publish("LIMITS_CHECK", {
            limitsCheck: trackOrder,
          });
          return user;
        } else throw new AuthenticationError("User authentication error");
      } catch (err) {
        throw new Error(err);
      }
    },
    async closeOrder(
      _,
      { orderId, closedPrice, profit, userId, closedDate },
      context
    ) {
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
          pubsub.publish("ORDER_CLOSED", {
            orderClosed: user,
          });
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
    async setStopLoss(_, { orderId, sl }, context) {
      const { id: userId } = checkAuth(context);
      try {
        const user = await User.findById(userId);
        if (user) {
          const orderIndex = user.orders.findIndex(
            (order) => order.id === orderId
          );
          if (user.orders[orderIndex]) {
            user.orders[orderIndex].sl = sl;
            await user.save();
            const trackOrder = {
              user_id: userId,
              order_id: orderId,
              symbol: user.orders[orderIndex].symbol,
              orderType: user.orders[orderIndex].orderType,
              openPrice: user.orders[orderIndex].openPrice,
              volume: user.orders[orderIndex].volume,
              sl: user.orders[orderIndex].sl,
              tp: user.orders[orderIndex].tp,
            };
            pubsub.publish("LIMITS_CHECK", {
              limitsCheck: trackOrder,
            });
            return user;
          } else throw new UserInputError("Order is aleary closed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async setTakeProfit(_, { orderId, tp }, context) {
      const { id: userId } = checkAuth(context);
      try {
        const user = await User.findById(userId);
        if (user) {
          const orderIndex = user.orders.findIndex(
            (order) => order.id === orderId
          );
          if (user.orders[orderIndex]) {
            user.orders[orderIndex].tp = tp;
            await user.save();
            const trackOrder = {
              user_id: userId,
              order_id: orderId,
              symbol: user.orders[orderIndex].symbol,
              orderType: user.orders[orderIndex].orderType,
              openPrice: user.orders[orderIndex].openPrice,
              volume: user.orders[orderIndex].volume,
              sl: user.orders[orderIndex].sl,
              tp: user.orders[orderIndex].tp,
            };
            pubsub.publish("LIMITS_CHECK", {
              limitsCheck: trackOrder,
            });
            return user;
          } else throw new UserInputError("Order is aleary closed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Subscription: {
    limitsCheck: {
      subscribe: () => pubsub.asyncIterator(["LIMITS_CHECK"]),
    },
    orderClosed: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(["ORDER_CLOSED"]),
        (payload, variables) => {
          const payload_user_id = payload.orderClosed._id.toString();
          console.log("!!!!!", payload_user_id, variables.userId);
          return payload_user_id == variables.userId;
        }
      ),
    },
  },
};

export default ordersResolvers;
