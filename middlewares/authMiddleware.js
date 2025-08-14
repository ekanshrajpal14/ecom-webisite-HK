const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utlis/ErrorHandler");

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token

  if (!token) {
    return next(new ErrorHandler("Unauthorized: No token provided", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    return next(new ErrorHandler("Unauthorized: Invalid or expired token", 401, null, "RELOGIN_REQUIRED"));
  }
};

module.exports = { authenticateUser };
