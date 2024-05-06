import StockReport from "../model/stockReport.js";
import authMiddleware from "./authMiddleware.js"; // Import the authMiddleware

const stockController = {
  verifyToken: authMiddleware, // Middleware to verify JWT token

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

      // Get the user ID from the JWT token
      const userId = req.userId;

      // Update the existing stock report with sales information
      let stockReport = await StockReport.findOneAndUpdate(
        { date, status: "existing-stock" },
        {
          $inc: {
            "sales.$[elem].quantity": quantity,
            "sales.$[elem].amount": amount,
          },
        },
        {
          arrayFilters: [{ "elem.date": date }],
          new: true,
          upsert: true,
        },
      );

      // If stockReport is null, it means there was no existing stock report for the date
      if (!stockReport) {
        return res.status(404).json({
          message: "Stock report not found for the given date",
        });
      }

      res.status(200).json({ message: "Sales report added successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add sales report" });
    }
  },

  sellTyresFromStock: async (req, res) => {
    try {
      stockController.verifyToken(req, res, async () => {
        const { date, tyreSize, quantity, comment, SSP, location, amount } =
          req.body;

        let stockReport = await StockReport.findOne({
          date,
          status: "existing-stock",
        });

        if (!stockReport) {
          return res.status(404).json({ message: "Stock not found" });
        }

        const existingItemIndex = stockReport.existingStock.findIndex(
          (item) => item.tyreSize === tyreSize,
        );

        if (existingItemIndex !== -1) {
          if (
            stockReport.existingStock[existingItemIndex].quantity < quantity
          ) {
            return res
              .status(400)
              .json({ message: "Not enough stock available" });
          }

          stockReport.existingStock[existingItemIndex].quantity -= quantity;
          stockReport.sales.push({
            date,
            tyreSize,
            comment,
            quantity,
            SSP,
            location,
            amount,
          });
          await stockReport.save();

          res.status(200).json({ message: "Stock updated successfully" });
        } else {
          res.status(404).json({ message: "Tyre size not found in stock" });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update stock" });
    }
  },

  getClosedStock: async (req, res) => {
    try {
      stockController.verifyToken(req, res, async () => {
        const { date } = req.params;

        const stockReport = await StockReport.findOne({
          date,
          status: "closed-stock",
        });

        if (!stockReport) {
          return res.status(404).json({
            message: "Closed-stock report not found for the given date",
          });
        }

        res.status(200).json(stockReport);
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to get closed-stock report" });
    }
  },

  getOpenStock: async (req, res) => {
    try {
      stockController.verifyToken(req, res, async () => {
        const { date } = req.params;

        let openStockReport = await StockReport.findOne({
          date,
          status: "open-stock",
        });

        if (!openStockReport) {
          let latestClosedStockReport = await StockReport.findOne({
            status: "closed-stock",
          }).sort({ date: -1 });

          if (!latestClosedStockReport) {
            let existingStockReport = await StockReport.findOne({
              date,
              status: "existing-stock",
            });

            if (!existingStockReport) {
              return res.status(404).json({
                message: "No existing stock found for the given date",
              });
            }

            existingStockReport.status = "closed-stock";
            await existingStockReport.save();

            return res.status(200).json(existingStockReport);
          } else {
            latestClosedStockReport.status = "open-stock";
            await latestClosedStockReport.save();

            openStockReport = latestClosedStockReport;
          }
        }

        res.status(200).json(openStockReport);
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to get open-stock report" });
    }
  },
  updateExistingStockToClosed: async (req, res) => {
    try {
      stockController.verifyToken(req, res, async () => {
        const { date } = req.body;

        let existingStockReport = await StockReport.findOne({
          date,
          status: "existing-stock",
        });

        if (!existingStockReport) {
          return res.status(404).json({
            message: "Existing stock report not found for the given date",
          });
        }

        existingStockReport.status = "closed-stock";
        await existingStockReport.save();

        res.status(200).json({
          message: "Existing stock updated to closed-stock successfully",
        });
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Failed to update existing stock to closed-stock" });
    }
  },
};

export default stockController;
