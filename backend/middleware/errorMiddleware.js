// middleware/errorMiddleware.js — Centralized Error Handling
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (err, _req, res, _next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = undefined;

  // Mongoose: bad ObjectId (e.g. /bookmarks/bad-id)
  if (err.name === "CastError") {
    status = 400;
    message = `Invalid ID format: ${err.value}`;
  }

  // Mongoose: schema validation error
  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      msg: e.message,
    }));
  }

  // Mongoose: duplicate key (unique index violation)
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value for ${field}`;
  }

  console.error(`[Error] ${status} — ${message}`);

  res.status(status).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};