import { Router } from "express";
import {
  createFaq,
  deleteFaq,
  getAllFaq,
  getFaqById,
  updateFaq,
} from "../../../controllers/faqController";
import { authenticateAdmin } from "../../../middleware/authenticateAdmin";

const faqRouter = Router();
faqRouter.get("/", getAllFaq);

faqRouter.post("/", authenticateAdmin, createFaq);
faqRouter.put("/:id", authenticateAdmin, updateFaq);
faqRouter.get("/:id", getFaqById);
faqRouter.delete("/:id", authenticateAdmin, deleteFaq);

export default faqRouter;
