class ErrorHandler extends Error {
  constructor(message, statusCode, errName = "Error", errors = null) {
    super(message);
    this.name = errName; // Custom error name like "ValidationError", "AuthError", and so on
    this.statusCode = statusCode;
    this.errors = errors; // Store validation errors if provided - can be null as well - depends on the error type
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorHandler;
