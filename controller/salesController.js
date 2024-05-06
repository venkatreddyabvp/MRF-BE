import SalesReport from "../model/salesReport.js";
import StockReport from "../model/stockReport.js";
import authMiddleware from "./authMiddleware.js";

const salesController = {
  // Middleware to verify JWT token
  verifyToken: authMiddleware,

  // Get sales report for a specific date

  getAllSalesReports: async (req, res) => {
    try {
      // Find all sales reports
      const allSalesReports = await SalesReport.find();

      res.status(200).json(allSalesReports);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to get all sales reports" });
    }
  },
  // GET /api/sales/:date
  getSalesReportByDate: async (req, res) => {
    try {
      const { date } = req.params;

      // Find the sales report for the given date
      const salesReport = await SalesReport.findOne({ date });

      if (!salesReport) {
        return res.status(404).json({
          message: "Sales report not found for the given date",
        });
      }

      res.status(200).json(salesReport);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to get sales report" });
    }
  },
  // Add a new sales report
  // POST /api/sales
  addSalesReport: async (req, res) => {
    try {
      const {
        date,
        tyreSize,
        comment,
        quantity,
        amount,
        SSP,
        vehicle,
        location,
      } = req.body;
      if (
        !date ||
        !tyreSize ||
        !comment ||
        !quantity ||
        !amount ||
        !SSP ||
        !vehicle ||
        !location
      ) {
        return res.status(400).json({ message: "Required fields are missing" });
      }

      // Create a new sales report
      const salesReport = new SalesReport({
        date,
        amount,
        location,
        sales: [
          { tyreSize, comment, quantity, amount, SSP, vehicle, location },
        ],
      });
      await salesReport.save();

      // Update the stock report with sales information
      let stockReport = await StockReport.findOne({
        date,
        status: "existing-stock",
      });
      if (!stockReport) {
        stockReport = new StockReport({ date, status: "existing-stock" });
      }

      // Check if the stock report already has sales for the given date
      const existingSalesIndex = stockReport.sales.findIndex(
        (sale) => sale.date.toString() === date.toString(),
      );

      if (existingSalesIndex !== -1) {
        // If sales already exist for the given date, update the quantities
        stockReport.sales[existingSalesIndex].quantity += quantity;
        stockReport.sales[existingSalesIndex].amount += amount;
      } else {
        // If sales do not exist for the given date, add a new entry
        stockReport.sales.push({
          date,
          tyreSize,
          comment,
          quantity,
          amount,
          SSP,
          vehicle,
          location,
        });
      }

      // Validate that the requested quantity is less than or equal to SSP
      const existingStockItem = stockReport.existingStock.find(
        (item) => item.tyreSize === tyreSize,
      );
      if (existingStockItem && quantity > existingStockItem.SSP) {
        throw new Error("Requested quantity cannot be greater than SSP");
      }

      await stockReport.save();

      res.status(200).json({ message: "Sales report added successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add sales report" });
    }
  },
};

// Add authMiddleware as a middleware for all salesController methods
Object.keys(salesController).forEach((key) => {
  if (typeof salesController[key] === "function") {
    salesController[key] = [authMiddleware, salesController[key]];
  }
});

export default salesController;
