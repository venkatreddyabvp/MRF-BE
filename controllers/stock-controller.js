import Stock from "../models/stock-model.js";
import Sales from "../models/sales-model.js";

export const addStock = async (req, res) => {
  try {
    const {
      date,
      quantity,
      tyreSize,
      SSP,
      invoiceAmount,
      pricePerUnit,
      location,
    } = req.body;
    const { role } = req.user;

    // Check if the user has the owner role
    if (role !== "owner") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Find the stock for the given date
    let stock = await Stock.findOne({ date });

    // If no stock exists for the given date, create a new "open-stock" record
    if (!stock) {
      stock = new Stock({
        date,
        status: "open-stock",
        quantity,
        tyreSize,
        SSP,
        invoiceAmount,
        pricePerUnit,
        location,
      });
    } else {
      // If an "existing-stock" record exists, update the existing stock
      if (stock.status === "existing-stock") {
        stock.quantity += quantity;
        stock.invoiceAmount += invoiceAmount;
      } else {
        // If an "open-stock" record exists, update the open stock
        stock.quantity = quantity;
        stock.tyreSize = tyreSize;
        stock.SSP = SSP;
        stock.invoiceAmount = invoiceAmount;
        stock.pricePerUnit = pricePerUnit;
        stock.location = location;
      }
    }

    // Save the updated stock record
    await stock.save();

    res.status(201).json({ message: "Stock updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to update stock" });
  }
};

export const recordSale = async (req, res) => {
  try {
    const { date, quantity, amount, customerName, phoneNumber, comments } =
      req.body;
    const { role } = req.user;

    let currentDate = date;
    let customDate = false;

    // Check if the date is not obtained using Date.now(), then consider it as a custom date
    if (new Date(date).getTime() !== Date.now()) {
      customDate = true;
    } else {
      currentDate = Date.now();
    }

    // Check if the user has the owner role or worker role
    if (role !== "owner" && role !== "worker") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Create a new sales record
    const newSale = new Sales({
      date: currentDate,
      quantity,
      amount,
      customerName,
      phoneNumber,
      comments,
      user: req.user.id,
    });

    // Save the sales record
    await newSale.save();

    // Update the stock with the sales data
    let stock = await Stock.findOne({ date: currentDate });
    if (!stock) {
      stock = new Stock({ date: currentDate });
    }

    stock.quantity += quantity;
    stock.invoiceAmount += amount;

    await stock.save();

    res.status(201).json({ message: "Sales recorded successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to record sales" });
  }
};

export const getOpenStock = async (req, res) => {
  try {
    const { date } = req.body;

    // Find the "open-stock" record for the given date
    const openStock = await Stock.findOne({ date, status: "open-stock" });

    if (!openStock) {
      return res.status(404).json({ message: "Open stock not found" });
    }

    res.status(200).json({ openStock });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to get open stock" });
  }
};

export const getExistingStock = async (req, res) => {
  try {
    const { date } = req.body;

    // Find the "existing-stock" records for dates before or on the given date
    const existingStock = await Stock.find({
      date: { $lte: date },
      status: "existing-stock",
    });

    res.status(200).json({ existingStock });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to get existing stock" });
  }
};
