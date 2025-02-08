import { Router } from "express";
import {
  createFaq,
  deleteFaq,
  getAllFaq,
  getFaqById,
  updateFaq,
} from "../../controllers/faqController";

const v1Router = Router();
v1Router.get("/faq", getAllFaq);

v1Router.post("/faq", createFaq);
v1Router.put("/faq/:id", updateFaq);
v1Router.get("/faq/:id", getFaqById);
v1Router.delete("/faq/:id", deleteFaq);

export default v1Router;
