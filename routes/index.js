import express from "express";
import {
  addStock,
  recordSale,
  getOpenStock,
  getExistingStock,
  getOpenStockDays,
} from "../controllers/stock-controller.js";

import { signupOwner, loginOwner } from "../controllers/owner-controller.js";
import { signupWorker, loginWorker } from "../controllers/worker-controller.js";
import { authenticate } from "../middleware/authenticate.js";
import {
  createSpecialOrder,
  getSpecialOrders,
} from "../controllers/specialOrder-controller.js";
const router = express.Router();

// Stock routes
router.post("/add-stock", authenticate(["owner", "worker"]), addStock);
router.post("/update-stock", authenticate(["owner", "worker"]), recordSale);

// Get open stock route
router.get("/open-stock", getOpenStock);

// Get existing stock route
router.get(
  "/existing-stock",

  getExistingStock,
);
// Define a route to get open-stock-day records
router.get("/open-stock-days", getOpenStockDays);

// Owner routes
router.post("/owner/signup", signupOwner);
router.post("/owner/login", loginOwner);

// Worker routes
router.post("/worker/signup", signupWorker);
router.post("/worker/login", loginWorker);

router.post(
  "/special-reports",
  authenticate(["owner", "worker"]),
  createSpecialOrder,
);
router.get(
  "/special-reports",

  getSpecialOrders,
);

export default router;
