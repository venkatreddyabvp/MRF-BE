import Admin from "../model/adminModel.js";
import jwt from "jsonwebtoken";
import argon2 from "argon2";

const adminController = {
  signup: async (req, res) => {
    try {
      const { phone, password } = req.body;
      console.log("Received request body:", req.body);

      if (!phone || !password) {
        console.error("Phone and password are required");
        return res
          .status(400)
          .json({ message: "Phone and password are required" });
      }

      const hashedPassword = await argon2.hash(password);
      const newAdmin = new Admin({ phone, password: hashedPassword });
      await newAdmin.save();
      console.log("Admin signup successful");
      res.status(201).json({ message: "Admin signup successful" });
    } catch (error) {
      console.error("Failed to signup admin:", error.message);
      res
        .status(500)
        .json({ error: "Failed to signup admin", message: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res
          .status(400)
          .json({ message: "Phone and password are required" });
      }

      const admin = await Admin.findOne({ phone });
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      const isValidPassword = await argon2.verify(admin.password, password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid password" });
      }

      const token = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      res.status(200).json({
        message: "Admin login successful",
        adminId: admin._id,
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to login" });
    }
  },
};

export default adminController;
