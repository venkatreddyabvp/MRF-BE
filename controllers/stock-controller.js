import Stock from "../models/stock-model.js";
import Sales from "../models/sales-model.js";
import { sendEmail } from "../utils/mailer.js";

export const addStock = async (req, res) => {
  try {
    const {
      date,
      quantity,
      tyreSize,
      SSP,
      totalAmount,
      pricePerUnit,
      location,
    } = req.body;
    const { role } = req.user;

    // Check if the user has the owner role
    if (!["owner", "worker"].includes(role)) {
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
        totalAmount,
        pricePerUnit,
        location,
      });
    } else {
      // If an "existing-stock" record exists, update the existing stock
      if (stock.status === "existing-stock") {
        stock.quantity += quantity;
        stock.totalAmount += totalAmount;
      } else {
        // If an "open-stock" record exists, update the open stock
        stock.quantity = quantity;
        stock.tyreSize = tyreSize;
        stock.SSP = SSP;
        stock.totalAmount = totalAmount;
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
      date,
      quantity,
      customerName,
      phoneNumber,
      comment,
      tyreSize,
      pricePerUnit,
    } = req.body;
    const { role, id: userId } = req.user;

    // Check if the user has the owner or worker role
    if (!["owner", "worker"].includes(role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Parse the date or use the current date if not provided
    const currentDate = date ? new Date(date) : new Date();

    // Calculate the total amount based on quantity and price per unit
    const totalAmount = quantity * pricePerUnit;

    // Create a new sales record
    const newSale = new Sales({
      date: currentDate,
      quantity,
      totalAmount,
      customerName,
      phoneNumber,
      comment,
      tyreSize,
      user: userId,
    });

    // Save the sales record
    await newSale.save();

    // Update the stock with the sales data
    let stock = await Stock.findOne({
      date: currentDate.toISOString().split("T")[0],
    });
    if (!stock) {
      stock = new Stock({ date: currentDate });
    }

    // Check if the requested quantity is available in existing stock
    if (stock.status === "existing-stock" && stock.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock quantity" });
    }

    // Check if the stock status is "open-stock" and convert it to "open-stock-day"
    if (stock.status === "open-stock") {
      let existingOpenStockDay = await Stock.findOne({
        date: { $eq: stock.date }, // Compare dates directly
        status: "open-stock-day",
      });

      // If an openStockDay record already exists for the same date, do not create a new record
      if (existingOpenStockDay) {
        return; // Skip creating a new record and move to the next line of code
      }

      // Create a new openStockDay record
      const openStockDay = new Stock({
        date: stock.date,
        status: "open-stock-day",
        quantity: stock.quantity,
        tyreSize: stock.tyreSize,
        SSP: stock.SSP,
        totalAmount: stock.totalAmount,
        pricePerUnit: stock.pricePerUnit,
        location: stock.location,
      });
      await openStockDay.save();
    }

    stock.quantity -= quantity; // Assuming quantity is being subtracted from stock
    stock.totalAmount += totalAmount;

    await stock.save();
    const emailOptions = {
      from: "venkatreddyabvp2@gmail.com",
      to: "venkatreddyabvp2@gmail.com", // Replace with the recipient's email
      subject: "Stock Update Notification",
      text: "Stock updated successfully",
      html: "<p>Stock updated successfully</p>", // You can use HTML content here
    };
    await sendEmail(emailOptions);

    res.status(201).json({ message: "Stock updated successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(400)
      .json({ message: "Failed to record sales", error: err.message });
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

export const getOpenStockDays = async (req, res) => {
  try {
    // Find all documents where the status is "open-stock-day"
    const openStockDays = await Stock.find({ status: "open-stock-day" });

    res.status(200).json({ openStockDays });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to get open stock days" });
  }
};
