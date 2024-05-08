import express from "express";
import {
  addStock,
  recordSale,
  getOpenStock,
  getExistingStock,
} from "../controllers/stock-controller.js";

import { signupOwner, loginOwner } from "../controllers/owner-controller.js";
import { signupWorker, loginWorker } from "../controllers/worker-controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// Stock routes
router.post("/add-stock", authenticate("owner"), addStock);
router.post("/update-stock", authenticate(["owner", "worker"]), recordSale);

// Get open stock route
router.get("/open-stock", authenticate("owner"), getOpenStock);

// Get existing stock route
router.get("/existing-stock", authenticate("owner"), getExistingStock);

// Owner routes
router.post("/owner/signup", signupOwner);
router.post("/owner/login", loginOwner);

// Worker routes
router.post("/worker/signup", signupWorker);
router.post("/worker/login", loginWorker);

export default router;
