import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { successResponse } from "../utils/response.js";

/** JWT payload includes `username`, `name`, and `sub` (user id). Password is never stored in the token. */
function signToken(user) {
  const secret = typeof process.env.JWT_SECRET === "string" ? process.env.JWT_SECRET.trim() : "";
  if (!secret) {
    throw new ApiError(500, "JWT_SECRET is not configured", "CONFIG_ERROR");
  }

  return jwt.sign(
    {
      username: user.username,
      name: user.name,
      sub: user._id.toString(),
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function authProfile(user) {
  return {
    username: user.username,
    name: user.name,
    experience: user.experience,
    mobileNumber: user.mobileNumber,
  };
}

export const register = asyncHandler(async (req, res) => {
  const { username, password, name, experience, mobileNumber } = req.body;
  const user = await User.create({
    username,
    password,
    name,
    experience: experience === undefined || experience === null || experience === "" ? 0 : Number(experience),
    mobileNumber,
  });
  const token = signToken(user);

  return successResponse(res, {
    statusCode: 201,
    message: "User registered successfully",
    data: { token, ...authProfile(user) },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username: username.trim() }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid username or password", "INVALID_CREDENTIALS");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new ApiError(401, "Invalid username or password", "INVALID_CREDENTIALS");
  }

  const token = signToken(user);

  return successResponse(res, {
    message: "Login successful",
    data: { token, ...authProfile(user) },
  });
});

/** Lists all registered users (no passwords). */
export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();

  const data = users.map((u) => ({
    id: u._id,
    username: u.username,
    name: u.name,
    experience: u.experience,
    mobileNumber: u.mobileNumber,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));

  return successResponse(res, {
    message: "Users fetched successfully",
    data,
  });
});
