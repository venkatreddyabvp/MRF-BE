import jwt from "jsonwebtoken";

/**
 * Middleware to authenticate user roles.
 * @param {string} role - The required role ('owner', 'worker', etc.).
 * @returns {Function} - Express middleware function.
 */
export const authenticate = (role) => (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
