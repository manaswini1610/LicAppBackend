import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new ApiError(400, "Validation failed", "VALIDATION_ERROR");
    error.details = errors.array().map(({ type, value, msg, path, location }) => ({
      type,
      value,
      message: msg,
      field: path,
      location,
    }));
    return next(error);
  }
  return next();
};
