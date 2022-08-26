import  mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  personalId: Number,
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  country: String,
  phone: String,
  email: String,
  wallet: String,
  createdAt: String,
  balance: Number,
  verified: Boolean,
  ordersCounter: Number,
  userRole: String,
  orders: [
    {
      orderId: Number,
      createDate: String,
      symbol: String,
      type: String,
      volume: Number,
      openPrice: Number,
      sl: Number,
      tp: Number,
      leverage: Number
    },
  ],
  tradeHistory: [
    {
      orderId: Number,
      createDate: String,
      symbol: String,
      type: String,
      volume: Number,
      openPrice: Number,
      closedPrice: Number,
      closedDate: String,
      sl: Number,
      tp: Number,
      profit: String,
    },
  ],
},{ typeKey: '$type' });

export default mongoose.model("User", userSchema);
