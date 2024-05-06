import mongoose from "mongoose";

const { Schema } = mongoose;

const stockItemSchema = new Schema({
  date: {
    type: Date,
    default: new Date().toISOString().split("T")[0],
  },
  comment: {
    type: String,
    default: "",
  },
  tyreSize: {
    type: String,
    default: "",
  },
  quantity: {
    type: Number,
    default: 0,
  },
  SSP: {
    type: String,
    default: 0,
  },
  location: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const stockReportSchema = new Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  openStock: [stockItemSchema],
  existingStock: [stockItemSchema],
  closedStock: [stockItemSchema],
  status: {
    type: String,
    enum: ["open-stock", "existing-stock", "closed-stock"],
    default: "open-stock",
  },
  sales: [
    {
      location: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
      tyreSize: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      SSP: {
        type: Number,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
    },
  ],
});

const StockReport = mongoose.model("StockReport", stockReportSchema);

export default StockReport;
