import { NextFunction, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/jwtTokens";
import { AuthenticatedRequest } from "../types/faq.types";

export const authenticateAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken } = req.cookies;
    if (!accessToken) {
      throw new ApiError("Access token is required", 401);
    }
    const decoded = verifyToken(accessToken, "accessToken");
    req.admin = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
