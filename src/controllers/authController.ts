import { Request, Response } from "express";
import { Admin } from "../models/admin";
import { CreateAdmin } from "../types/faq.types";
import { ApiError } from "../utils/ApiError";
import { generateToken } from "../utils/jwtTokens";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: CreateAdmin = req?.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      throw new ApiError("Invalid email or password", 401);
    }

    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      throw new ApiError("Invalid email or password", 401);
    }

    const refreshToken = generateToken({ id: admin._id }, "refreshToken");
    const accessToken = generateToken({ id: admin._id }, "accessToken");
    admin.refreshToken = refreshToken;
    await admin.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.cookies;
    const admin = await Admin.findOne({ refreshToken });
    if (!admin) {
      throw new ApiError("Invalid refresh token", 401);
    }
    const accessToken = generateToken({ id: admin._id }, "accessToken");
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000, // 15 minutes
    };
    res.cookie("accessToken", accessToken, options);

    res.status(200).json({ accessToken });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.cookies;
    const admin = await Admin.findOne({ refreshToken });
    if (!admin) {
      throw new ApiError("Invalid refresh token", 401);
    }
    admin.refreshToken = undefined;
    await admin.save();
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password }: CreateAdmin = req.body;
    const admin = await Admin.findOne({ email });
    if (admin) {
      throw new ApiError("Admin already exists", 400);
    }
    const newAdmin = await Admin.create({ email, password });
    const refreshToken = generateToken({ id: newAdmin._id }, "refreshToken");
    const accessToken = generateToken({ id: newAdmin._id }, "accessToken");
    newAdmin.refreshToken = refreshToken;
    await newAdmin.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
