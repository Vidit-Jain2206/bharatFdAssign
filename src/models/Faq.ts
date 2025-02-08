import mongoose, { Schema } from "mongoose";
import { FaqDocument } from "../types/faq.types";

const translationSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const faqSchema = new Schema(
  {
    originalLanguage: {
      type: String,
      required: true,
      default: "en",
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    translations: {
      type: Map,
      of: translationSchema,
      required: false,
    },
    category: {
      type: String,
      index: true,
    },
    targetLanguages: {
      type: [String],
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Faq = mongoose.model<FaqDocument>("Faq", faqSchema);
