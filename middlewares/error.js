const { errorLogger } = require("../utlis/logger");

exports.generatedErrors = (err, req, res, next) => {
  // Log the error
  const statusCode = err.statusCode || 500;

  const errorResponse = {
    message: err.message || "Something went wrong",
    errName: err.name || "UnknownError",
    success: false,
    statusCode: statusCode,
  };
  // Include validation errors if present
  if (err.errors) {
    errorResponse.errors = err.errors;
  }
  // logging
  errorLogger(err, req, res, next);
  // sending the error to user
  res.status(statusCode).json(errorResponse);
};
