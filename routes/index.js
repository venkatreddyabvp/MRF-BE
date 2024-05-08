import express from "express";

import adminController from "../controller/adminController.js";
import userController from "../controller/userController.js";

const router = express.Router();

router.post("/admin/signup", adminController.signup);
router.post("/admin/login", adminController.login);

router.post("/user/signup", userController.signUp);
router.post("/user/login", userController.login);

export default router;
