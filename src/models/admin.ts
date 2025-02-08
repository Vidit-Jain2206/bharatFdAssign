import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { AdminDocument } from "../types/faq.types";

const adminSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  refreshToken: {
    type: String,
    required: false,
  },
});
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
adminSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

export const Admin = mongoose.model<AdminDocument>("Admin", adminSchema);
