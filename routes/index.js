import express from "express";

import tyreStockController from "../controller/tyreStockController.js";
import vehicleController from "../controller/vehicleController.js";
import adminController from "../controller/adminController.js";
import userController from "../controller/userController.js";
import stockController from "../controller/stockController.js";

import salesController from "../controller/salesController.js";

const router = express.Router();

router.post("/admin/signup", adminController.signup);
router.post("/admin/login", adminController.login);

router.post("/user/signup", userController.signUp);
router.post("/user/login", userController.login);

router.post("/post-tyres", tyreStockController.createTyre);
router.get("/get-tyres", tyreStockController.getAllTyres);
router.put("/update-tyre/:date", tyreStockController.updateTyre); // Update tyre route

router.post("/post-vehicle", vehicleController.createVehicle);
router.get("/get-vehicle", vehicleController.getAllVehicle);
router.put("/update-vehicle/:date", vehicleController.updateVehicle); // Update vehicle route

router.post("/add-stock", stockController.addStock); // Add new tires to the stock
router.post("/sell-stock", stockController.sellTyresFromStock); // Reduce stock based on sales
router.get("/closed-stock/:date", stockController.getClosedStock); // Get closed stock report
router.get("/open-stock/:date", stockController.getOpenStock); // Get open stock report
router.post("/admin-logout", stockController.updateExistingStockToClosed);

// Routes for sales reports
router.post("/add-sales-report", salesController.addSalesReport);
router.get("/sales", salesController.getAllSalesReports); // Get all sales reports
router.get("/sales/:date", salesController.getSalesReportByDate); // Get sales report by date
export default router;
