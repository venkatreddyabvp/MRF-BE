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
    const {
      currentDate,
      customDate,
      quantity,
      amount,
      customerName,
      phoneNumber,
    } = req.body;
    const { role } = req.user;

    // Check if the user has the owner role
    if (role !== "owner" || role !== "worker") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Create a new sales record with the current date
    const newSaleCurrent = new Sales({
      date: currentDate,
      quantity,
      amount,
      customerName,
      phoneNumber,
      user: req.user.id,
    });

    // Save the sales record with the current date
    await newSaleCurrent.save();

    // Update the stock with the sales data for the current date
    let stockCurrent = await Stock.findOne({ date: currentDate });
    if (!stockCurrent) {
      stockCurrent = new Stock({ date: currentDate });
    }

    stockCurrent.quantity += quantity;
    stockCurrent.invoiceAmount += amount;

    await stockCurrent.save();

    // Create a new sales record with the custom date
    const newSaleCustom = new Sales({
      date: customDate,
      quantity,
      amount,
      customerName,
      phoneNumber,
      user: req.user.id,
    });

    // Save the sales record with the custom date
    await newSaleCustom.save();

    // Update the stock with the sales data for the custom date
    let stockCustom = await Stock.findOne({ date: customDate });
    if (!stockCustom) {
      stockCustom = new Stock({ date: customDate });
    }

    stockCustom.quantity += quantity;
    stockCustom.invoiceAmount += amount;

    await stockCustom.save();

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
