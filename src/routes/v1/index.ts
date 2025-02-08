import { Router } from "express";
import faqRouter from "./faq";
import authRouter from "./auth";

const v1Router = Router();
v1Router.use("/faq", faqRouter);
v1Router.use("/admin", authRouter);
export default v1Router;
