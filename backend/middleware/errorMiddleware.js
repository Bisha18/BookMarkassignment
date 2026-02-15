// middleware/errorMiddleware.js — Centralized Error Handling
// IMPORTANT: Express identifies error handlers by exactly 4 parameters.
// Do NOT remove any parameter — even unused ones — or Express skips this middleware.

export const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.status = 404;
  next(err);
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors;

  // Mongoose: bad ObjectId (e.g. DELETE /bookmarks/bad-id)
  if (err.name === "CastError") {
    status = 400;
    message = `Invalid ID format: "${err.value}"`;
  }

  // Mongoose: schema validation failed
  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      msg: e.message,
    }));
  }

  // Mongoose: duplicate unique key
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value for "${field}"`;
  }

  console.error(`[Error] ${status} — ${message}`);

  res.status(status).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};