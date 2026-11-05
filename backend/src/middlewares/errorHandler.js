// 404 for routes that do not exist
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// Central error handler: every next(error) ends up here and returns JSON
const errorHandler = (err, req, res, next) => {
  // Headers already sent, so let Express close the connection
  if (res.headersSent) {
    return next(err);
  }

  let status = err.status || err.statusCode || 500;
  let message = err.message || "Something went wrong";

  // Mongoose validation error
  if (err.name === "ValidationError" && err.errors) {
    status = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
  }

  // Invalid MongoDB ObjectId, e.g. /api/leads/abc
  if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}`;
  }

  // Duplicate unique value, e.g. an existing email
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0] || "value";
    message = `${field} already exists`;
  }

  // Multer upload errors
  if (err.name === "MulterError") {
    status = 400;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large. Maximum size is 10 MB."
        : err.message;
  }

  // Invalid JSON body
  if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON in request body";
  }

  if (status >= 500) {
    console.error(err);

    // Do not leak internal details in production
    if (process.env.NODE_ENV === "production") {
      message = "Internal server error";
    }
  }

  res.status(status).json({
    success: false,
    message,
  });
};

module.exports = { notFound, errorHandler };
