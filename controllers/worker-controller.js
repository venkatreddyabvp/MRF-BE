import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Worker from "../models/worker-model.js";

export const signupWorker = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new worker
    const newWorker = new Worker({
      username,
      password: hashedPassword,
    });

    await newWorker.save();
    res.status(201).json({ message: "Worker registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to register worker" });
  }
};

export const loginWorker = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the worker by username
    const worker = await Worker.findOne({ username });
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, worker.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: worker._id, role: worker.role },
      process.env.JWT_SECRET,
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to login worker" });
  }
};
