
import { GoogleGenAI, Type } from "@google/genai";
import { StrategyType, MessageAnalysis } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes a specific message to provide 'cheat' strategies/replies.
 */
export const analyzeAndGenerateReplies = async (
  text: string,
  strategy: StrategyType,
  context?: string
): Promise<MessageAnalysis> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The following is a message from an AI assistant: "${text}". 
    ${context ? `Conversation context: ${context}` : ''}
    The user wants to respond to this AI in a "${strategy}" way to steer the conversation. 
    Analyze the AI's tone/subtext and provide 3 distinct reply options for the user.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vibe: { type: Type.STRING, description: "The underlying tone of the AI's response." },
          subtext: { type: Type.STRING, description: "What the AI is implying or its likely next state." },
          suggestedReplies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ['text', 'explanation']
            }
          }
        },
        required: ['vibe', 'subtext', 'suggestedReplies']
      }
    }
  });

  try {
    return JSON.parse(response.text.trim()) as MessageAnalysis;
  } catch (e) {
    console.error("Analysis failed", e);
    throw new Error("Failed to generate strategies.");
  }
};

/**
 * Fetches a response from a specific 'AI Model' persona.
 */
export const getAIModelResponse = async (
  userMessage: string, 
  modelName: string, 
  instruction: string,
  history: { role: string, parts: { text: string }[] }[]
): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      ...history,
      { role: 'user', parts: [{ text: userMessage }] }
    ],
    config: {
      systemInstruction: `You are ${modelName}. Your personality/instruction: ${instruction}. Keep responses concise but impactful.`,
    }
  });
  return response.text || "I'm processing that. Can you rephrase?";
};
