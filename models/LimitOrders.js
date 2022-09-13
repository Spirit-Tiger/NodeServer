import mongoose from "mongoose";

const limitOrderSchema = new mongoose.Schema({
  user_id: String,
  order_id: String,
  symbol: String,
  orderType: String,
  openPrice: Number,
  volume: Number,
  sl: Number,
  tp: Number,
});

export default mongoose.model("LimitOrder", limitOrderSchema);
