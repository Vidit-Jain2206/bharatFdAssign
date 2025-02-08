import { Request, Response } from "express";
import { Faq } from "../models/Faq";
import { CreateFaq } from "../types/faq.types";
import { ApiError } from "../utils/ApiError";

export const createFaq = async (req: Request, res: Response) => {
  try {
    const { question, answer, category, targetLanguages }: CreateFaq = req.body;
    const faq = await Faq.create({
      question,
      answer,
      category,
      targetLanguages,
    });
    res.status(201).json({
      message: "FAQ created successfully",
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
    const faq = await Faq.find();
    console.log(faq);
    console.log(lang);
    const translatedFaq = faq.map((faq) => {
      const translatedFaq = faq.translations?.[lang as string];
      return {
        id: faq._id,
        question: translatedFaq?.question || "",
        answer: translatedFaq?.answer || "",
      };
    });
    res.status(200).json({
      message: "All FAQ fetched successfully",
      translatedFaq,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
