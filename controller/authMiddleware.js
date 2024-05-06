import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // Get the token from the request headers
  const { authorization } = req.headers;

  // Check if token is provided
  if (!authorization) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify the token
    const decodedToken = jwt.verify(authorization, process.env.JWT_SECRET);

    // Check if token is expired
    if (decodedToken.exp <= Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ message: "Token expired" });
    }

    // Attach the user ID from the token to the request object
    req.userId = decodedToken.userId;

    // Move to the next middleware
    next();
  } catch (error) {
    // Pass the error to the error handling middleware
    next(error);
  }
};

export default authMiddleware;
