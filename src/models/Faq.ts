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
  },
  {
    timestamps: true,
  }
);

export const Faq = mongoose.model<FaqDocument>("Faq", faqSchema);
