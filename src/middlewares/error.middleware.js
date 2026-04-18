import mongoose from "mongoose";

export const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    errorCode: "ROUTE_NOT_FOUND",
  });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errorCode = err.errorCode || "INTERNAL_ERROR";
  const details = err.details || undefined;

  if (err instanceof mongoose.Error.CastError) {
    message = "Invalid resource id";
    errorCode = "INVALID_ID";
  }

  if (err?.code === 11000) {
    message = "Duplicate value found";
    errorCode = "DUPLICATE_KEY";
  }

  const payload = {
    success: false,
    message,
    errorCode,
  };
  if (details) payload.details = details;

  return res.status(statusCode).json(payload);
};
