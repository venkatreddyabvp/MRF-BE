import mongoose from "mongoose";

const salesSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  quantity: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
  customerName: String,
  phoneNumber: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Worker" },
});

const Sales = mongoose.model("Sales", salesSchema);

export default Sales;
