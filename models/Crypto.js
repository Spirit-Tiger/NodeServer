import mongoose from "mongoose";

const cryptoSchema = new mongoose.Schema({
  product_id: String,
  price: String,
});

export default mongoose.model("Crypto", cryptoSchema);
