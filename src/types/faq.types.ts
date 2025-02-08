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
}

export interface FaqDocument {
  _id: string;
  originalLanguage: string;
  status: "draft" | "published" | "archived";
  translations: TranslationMap;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
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
