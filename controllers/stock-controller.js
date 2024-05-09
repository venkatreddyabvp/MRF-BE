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

    if (!["owner", "worker"].includes(role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const existingStock = await Stock.findOne({ date, tyreSize });

    if (existingStock) {
      return res.status(400).json({
        message: "Stock record already exists for this date and tyreSize",
      });
    }

    let stock = await Stock.findOne({ date, tyreSize });

    if (!stock) {
      stock = new Stock({
        date,
        status: "open-stock",
        quantity: 0,
        tyreSize: "",
        SSP: 0,
        totalAmount: 0,
        pricePerUnit: 0,
        location: "",
      });
    }

    stock.quantity += quantity;
    stock.tyreSize = tyreSize;
    stock.SSP = SSP;
    stock.totalAmount += totalAmount;
    stock.pricePerUnit = pricePerUnit;
    stock.location = location;

    await stock.save();

    res.status(201).json({ message: "Stock updated successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to update stock", error: err.message });
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

    // Check if the item exists in the stock for the given tyreSize
    let stock = await Stock.findOne({
      date: currentDate.toISOString().split("T")[0],
      tyreSize,
    });

    if (!stock) {
      return res.status(404).json({ message: "Item not found in stock" });
    }

    // Calculate the total amount based on quantity and price per unit
    const totalAmount = quantity * pricePerUnit;

    // Check if the requested quantity is available in existing stock
    if (stock.status === "existing-stock" && stock.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock quantity" });
    }

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
    if (stock.status === "open-stock") {
      let existingOpenStockDay = await Stock.findOne({
        date: { $eq: stock.date }, // Compare dates directly
        status: "open-stock-day",
        tyreSize: stock.tyreSize,
      });

      // If an openStockDay record already exists for the same date, do not create a new record
      if (!existingOpenStockDay) {
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
    // Find all "open-stock" records
    const openStock = await Stock.find({ status: "open-stock" });

    res.status(200).json({ openStock });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to get open stock" });
  }
};

export const getExistingStock = async (req, res) => {
  try {
    // Find all "existing-stock" records
    const existingStock = await Stock.find({ status: "existing-stock" });

    res.status(200).json({ existingStock });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to get existing stock" });
  }
};

export const getOpenStockDays = async (req, res) => {
  try {
    // Find all "open-stock-day" records
    const openStockDays = await Stock.find({ status: "open-stock-day" });

    res.status(200).json({ openStockDays });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to get open stock days" });
  }
};
