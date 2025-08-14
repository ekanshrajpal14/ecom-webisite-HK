const { body, validationResult } = require("express-validator");
const ErrorHandler = require("../utlis/ErrorHandler");
exports.validateUserRegistration = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err) => ({
        field: err.path, // Use "path" to get field name
        message: err.msg,
      }));
      return next(new ErrorHandler("Validation failed", 400, formattedErrors));
    }
    next();
  },
];
