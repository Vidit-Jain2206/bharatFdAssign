import { Request } from "express";

export interface Translation {
  question: string;
  answer: string;
}

export interface TranslationMap {
  [key: string]: Translation;
}

export interface CreateFaq {
  question: string;
  answer: string;
  category?: string;
  targetLanguages: string[];
  originalLanguage: string;
}

export interface CreateAdmin {
  email: string;
  password: string;
}

export interface FaqDocument {
  _id: string;
  originalLanguage: string;
  status: "draft" | "published" | "archived";
  translations: TranslationMap;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  targetLanguages: string[];
}

export interface AdminDocument {
  _id: string;
  email: string;
  password: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
  save: (data: any) => Promise<AdminDocument>;
}
export interface AuthenticatedRequest extends Request {
  admin?: any;
}

// structure of my faq
// {
//     originalLanguage: "en",
//     status: "draft",
//     translations: {
//         "en": {
//             question: "What is the capital of France?",
//             answer: "Paris"
//         }
//     }
//     category: "general",
//     createdAt: new Date(),
//     updatedAt: new Date(),
// }
