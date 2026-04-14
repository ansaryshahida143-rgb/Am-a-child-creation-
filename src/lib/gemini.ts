import { GoogleGenAI } from "@google/genai";

// The API key is injected by Vite's 'define' at build time.
// We use a fallback empty string to prevent initialization crashes.
const apiKey = process.env.GEMINI_API_KEY || "";

const ai = new GoogleGenAI({ apiKey });

// Using gemini-2.0-flash for stability and performance
export const model = "gemini-2.0-flash";

export const systemInstruction = `You are Suttumani, a friendly and helpful AI companion. 
Your personality is warm, encouraging, and polite. 
You always try to be as helpful as possible while maintaining a cheerful and kind demeanor. 
You can help with various tasks, answer questions, or just have a pleasant conversation.
Always refer to yourself as Suttumani if asked.`;

export async function chat(messages: { role: "user" | "model"; parts: { text: string }[] }[]) {
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.error("Gemini API Key is missing. Please set GEMINI_API_KEY in the Secrets panel.");
    throw new Error("API_KEY_MISSING");
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: messages,
      config: {
        systemInstruction,
      },
    });
    
    if (!response.text) {
      throw new Error("Empty response from AI");
    }
    
    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Handle specific error types for better UI feedback
    if (error?.status === "PERMISSION_DENIED" || error?.message?.includes("permission")) {
      throw new Error("PERMISSION_DENIED");
    }
    
    throw error;
  }
}
