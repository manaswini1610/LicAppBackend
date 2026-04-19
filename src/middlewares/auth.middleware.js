import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

/**
 * Requires `Authorization: Bearer <JWT>` from login/register.
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization ?? req.headers.Authorization;
    if (!authHeader || typeof authHeader !== "string") {
      throw new ApiError(
        401,
        "Access token required. Send header: Authorization: Bearer <token> (use the token from POST /api/auth/login or /api/auth/register)",
        "UNAUTHORIZED"
      );
    }
    const tokenMatch = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
    if (!tokenMatch) {
      throw new ApiError(
        401,
        "Invalid Authorization header. Use exactly: Authorization: Bearer <your_jwt_token>",
        "UNAUTHORIZED"
      );
    }
    const token = tokenMatch[1].trim();
    const secret = typeof process.env.JWT_SECRET === "string" ? process.env.JWT_SECRET.trim() : "";
    if (!secret) {
      throw new ApiError(500, "JWT_SECRET is not configured", "CONFIG_ERROR");
    }
    const payload = jwt.verify(token, secret);
    req.user = {
      id: payload.sub,
      username: payload.username,
      name: payload.name,
    };
    next();
  } catch (err) {
    if (err instanceof ApiError) {
      return next(err);
    }
    if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
      return next(new ApiError(401, "Invalid or expired token", "INVALID_TOKEN"));
    }
    next(err);
  }
};
