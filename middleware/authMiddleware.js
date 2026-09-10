const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    // Check if header starts with Bearer
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Access denied. Invalid token format.",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Store decoded user information in request
    req.user = decoded;

    // Continue to the next function
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;