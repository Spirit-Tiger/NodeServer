import { UserInputError } from "apollo-server";
import LimitOrders from "../../models/LimitOrders.js";

import User from "../../models/User.js";
import Verify from "../../models/Verify.js";
import checkAuth from "../../utils/check-auth.js";

const adminsResolvers = {
  Query: {
    async getLimitOrders() {
      try {
        const orders = await LimitOrders.find();
        return orders;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getVerifyRequests() {
      try {
        const requests = await Verify.find();
        return requests;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async changeBalance(_, { userId, balance }) {
      const user = await User.findById(userId);
      if (user) {
        user.balance = balance;
        await user.save();
        return user;
      } else throw new UserInputError("User not found");
    },
    async verifyUser(_, { userId }) {
      try {
        const user = await User.findById(userId);
        if (user) {
          user.verified = true;
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
    async clearOrders(_, { userId }) {
      const user = await User.findById(userId);
      if (user) {
        user.orders = [];
        await user.save();
        return user;
      } else throw new UserInputError("User not found");
    },
    async addLimitOrders(
      _,
      {
        limitOrderInput: {
          user_id,
          order_id,
          symbol,
          orderType,
          openPrice,
          volume,
          sl,
          tp,
        },
      }
    ) {
      try {
        const order = await LimitOrders.findOne({ order_id: order_id });
        if (!order) {
          const newOrder = new LimitOrders({
            user_id,
            order_id,
            symbol,
            orderType,
            openPrice,
            volume,
            sl,
            tp,
          });
          await newOrder.save();
          return newOrder;
        }
        if (order) {
          order.sl = sl;
          order.tp = tp;
          await order.save();
          return order;
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async deleteLimitOrder(_, { order_id }) {
      try {
        const order = await LimitOrders.findOne({
          order_id: order_id,
        });
        if (order) {
          await order.delete();
          return order;
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async updateVerifyRequest(_, { isAccepted, requestId, userId }) {
      try {
        const user = await User.findById(userId);
        if (isAccepted) {
          user.verified = true;
          await Verify.findByIdAndDelete(requestId);
          await user.save();
          return user.verified;
        }
        if (!isAccepted) {
          await Verify.findByIdAndDelete(requestId);
          return user.verified;
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

export default adminsResolvers;
