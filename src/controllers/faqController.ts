import { Request, Response } from "express";
import { Faq } from "../models/Faq";
import { CreateFaq } from "../types/faq.types";
import { ApiError } from "../utils/ApiError";
import { translateText } from "../service/translate";

export const createFaq = async (req: Request, res: Response) => {
  try {
    const {
      question,
      answer,
      category,
      targetLanguages,
      originalLanguage,
    }: CreateFaq = req.body;

    // Initialize translations map with English as default

    const translations = new Map();

    for (const lang of targetLanguages) {
      if (lang === originalLanguage) {
        translations.set(lang, {
          question: question,
          answer: answer,
        });
        continue;
      }
      try {
        const translatedQuestion = await translateText(question, lang);
        const translatedAnswer = await translateText(answer, lang);

        translations.set(lang, {
          question: translatedQuestion,
          answer: translatedAnswer,
        });
      } catch (error) {
        console.error(`Translation failed for language ${lang}:`, error);
        const translatedQuestion = await translateText(question, "en");
        const translatedAnswer = await translateText(answer, "en");

        translations.set("en", {
          question: translatedQuestion,
          answer: translatedAnswer,
        });
      }
    }

    const faq = await Faq.create({
      category,
      translations,
      originalLanguage: originalLanguage,
      status: "published",
    });
    await faq.save();

    res.status(201).json({
      message: "FAQ created successfully",
      faq: faq,
    });
  } catch (error) {
    console.log("error", error);
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFaqById = async (req: Request, res: Response) => {
  try {
    const id: string = req.params.id;
    if (!id) {
      throw new ApiError("Id is required", 400);
    }
    const faq = await Faq.findById(id);
    if (!faq) {
      throw new ApiError("FAQ not found", 404);
    }
    res.status(200).json({
      message: "FAQ fetched successfully",
      faq,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateFaq = async (req: Request, res: Response) => {
  try {
    const id: string = req.params.id;
    if (!id) {
      throw new ApiError("Id is required", 400);
    }
    const { question, answer, category, targetLanguages }: CreateFaq = req.body;
    const faq = await Faq.findByIdAndUpdate(id, {
      question,
      answer,
      category,
      targetLanguages,
    });
    res.status(200).json({
      message: "FAQ updated successfully",
      faq,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteFaq = async (req: Request, res: Response) => {
  try {
    const id: string = req.params.id;
    if (!id) {
      throw new ApiError("Id is required", 400);
    }
    const faq = await Faq.findByIdAndDelete(id);
    res.status(200).json({
      message: "FAQ deleted successfully",
      faq,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllFaq = async (req: Request, res: Response) => {
  try {
    let { lang } = req.query;
    if (!lang) {
      lang = "en";
    }
    const faqs = await Faq.find();

    const translatedFaqs = faqs.map((faq) => {
      // Try to get translation for requested language
      const translation = faq.translations?.[lang as string];

      // Fallback to English if translation not found
      if (!translation) {
        const englishTranslation = faq.translations?.["en"];
        return {
          id: faq._id,
          question: englishTranslation?.question || "",
          answer: englishTranslation?.answer || "",
          category: faq.category,
        };
      }

      return {
        id: faq._id,
        question: translation.question,
        answer: translation.answer,
        category: faq.category,
      };
    });

    res.status(200).json({
      message: "All FAQ fetched successfully",
      faqs: translatedFaqs,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
