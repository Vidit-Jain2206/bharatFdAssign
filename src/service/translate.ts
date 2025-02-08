import { Translator } from "google-translate-api-x";
import { ApiError } from "../utils/ApiError";

const translator = new Translator();

export const translateText = async (
  text: string,
  targetLang: string
): Promise<string> => {
  try {
    const { text: translatedText } = await translator.translate(text, {
      to: targetLang,
    });
    return translatedText;
  } catch (error) {
    throw new ApiError("Translation failed", 500);
  }
};
