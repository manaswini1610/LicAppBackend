import mongoose from "mongoose";

export const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    errorCode: "ROUTE_NOT_FOUND",
  });
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errorCode = err.errorCode || "INTERNAL_ERROR";
  const details = err.details || undefined;

  if (err instanceof mongoose.Error.CastError) {
    message = "Invalid resource id";
    errorCode = "INVALID_ID";
    statusCode = 400;
  }

  if (err?.code === 11000) {
    statusCode = 409;
    errorCode = "DUPLICATE_KEY";
    const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : null;
    if (field === "username") {
      message =
        "This username is already registered. Sign in instead, or register with a different username.";
    } else if (field === "policyNumber") {
      message = "A policy with this number already exists.";
    } else if (field) {
      message = `This ${field} is already in use.`;
    } else {
      message = "Duplicate value found";
    }
  }

  const payload = {
    success: false,
    message,
    errorCode,
  };
  if (details) payload.details = details;

  return res.status(statusCode).json(payload);
};
