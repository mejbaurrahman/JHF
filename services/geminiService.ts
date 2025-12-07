
import { GoogleGenAI } from "@google/genai";

// Safely access process.env for browser environments where it might not be defined
const getApiKey = () => {
  try {
    // Check if process is defined and is an object
    if (typeof process !== 'undefined' && process && process.env) {
      return process.env.API_KEY || '';
    }
    return '';
  } catch (e) {
    // process is not defined
    return '';
  }
};

const apiKey = getApiKey();
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateEventDescription = async (title: string, type: string): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API Key is missing.");
    return "AI generation unavailable: API Key not configured.";
  }

  try {
    const prompt = `Write a compelling and inviting description (max 100 words) for an Islamic organization event. 
    Event Title: "${title}"
    Event Type: "${type}"
    The tone should be respectful, spiritual, and community-focused.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating description. Please try again later.";
  }
};
