import { Schema, model } from "mongoose";

const salesReportSchema = new Schema({
  location: { type: String, required: true },
  date: { type: Date, required: true, unique: true },
  amount: { type: Number, required: true },
  sales: [
    {
      date: { type: Date, required: true },
      tyreSize: { type: Number, required: true },
      comment: { type: String },
      quantity: { type: Number, required: true },
      SSP: { type: Number, required: true },
      vehicle: { type: String, required: true },
      location: { type: String, required: true },
    },
  ],
});

const SalesReport = model("SalesReport", salesReportSchema);

export default SalesReport;
