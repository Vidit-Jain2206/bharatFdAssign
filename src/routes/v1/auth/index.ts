import express from "express";
import {
  login,
  logout,
  refreshToken,
  register,
} from "../../../controllers/authController";

const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/logout", logout);

export default authRouter;
