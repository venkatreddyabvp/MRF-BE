import jwt from "jsonwebtoken";

const userController = {
  signUp: async (req, res) => {
    try {
      const { name, phone, password } = req.body;

      if (!name || !phone || !password) {
        return res.status(400).json({ message: "Required fields are missing" });
      }

      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const hashedPassword = await argon2.hash(password);
      const newUser = new User({ name, phone, password: hashedPassword });
      await newUser.save();

      res.status(201).json({ message: "Signup successful" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  login: async (req, res) => {
    try {
      const { phone, password } = req.body;

      const user = await User.findOne({ phone });
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const passwordMatch = await argon2.verify(user.password, password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }

      const token = jwt.sign(
        { userId: user._id, phone: user.phone },
        process.env.JWT_SECRET,
        { expiresIn: "23h" },
      );

      res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

export default userController;
