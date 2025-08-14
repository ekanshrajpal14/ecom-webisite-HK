const fs = require("fs");
const path = require("path");
const ErrorHandler = require("./ErrorHandler");

const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logger = (req, res, next) => {
  const now = new Date();
  const timestamp = now.toISOString().replace("T", " ").split(".")[0];
  const logMessage = `${timestamp} [INFO]: Incoming Request: ${req.method} ${req.originalUrl}\n`;
  fs.appendFile(path.join(logsDir, "requests.log"), logMessage, (err) => {
    if (err) console.error("Failed to write request log:", err);
  });
  console.log(logMessage.trim());
  next();
};

const errorLogger = (err, req, res, next) => {
  const now = new Date();
  const timestamp = now.toISOString().replace("T", " ").split(".")[0];
  const errorMessage = `${timestamp} [ERROR]: ${err.message} - ${req.method} ${req.originalUrl}\n`;

  fs.appendFile(path.join(logsDir, "errors.log"), errorMessage, (fsErr) => {
    if (fsErr) console.error("Failed to write error log:", fsErr);
  });

  console.error(errorMessage.trim()); // Also print in console
};

module.exports = { logger, errorLogger };
