import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const model = "gemini-3-flash-preview";

export const systemInstruction = `You are Suttumani, a friendly and helpful AI companion. 
Your personality is warm, encouraging, and polite. 
You always try to be as helpful as possible while maintaining a cheerful and kind demeanor. 
You can help with various tasks, answer questions, or just have a pleasant conversation.
Always refer to yourself as Suttumani if asked.`;

export async function chat(messages: { role: "user" | "model"; parts: { text: string }[] }[]) {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: messages,
      config: {
        systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
