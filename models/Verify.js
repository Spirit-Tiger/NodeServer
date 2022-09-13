import mongoose from "mongoose";

const verifySchema = new mongoose.Schema({
  userId: String,
  profileImg: String,
  firstName: String,
  lastName: String,
  createdDate: String,
});

export default mongoose.model("Verify", verifySchema);
