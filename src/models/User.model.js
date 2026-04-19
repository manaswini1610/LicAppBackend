import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [32, "Username must be at most 32 characters"],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters"],
      maxlength: [128, "Password must be at most 128 characters"],
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [120, "Name must be at most 120 characters"],
    },
    /** Years of experience (e.g. in insurance / sales). */
    experience: {
      type: Number,
      default: 0,
      min: [0, "Experience cannot be negative"],
      max: [60, "Experience seems unreasonably high"],
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: [20, "Mobile number is too long"],
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model("User", userSchema);

export default User;
