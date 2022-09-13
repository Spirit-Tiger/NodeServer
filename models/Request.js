import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    requsetType: {
        type: String, 
        enum: ['Invest', 'Withdrow', 'Need Help'],
        default: 'Pending'
      },
});

export default mongoose.model("Request", requestSchema);
