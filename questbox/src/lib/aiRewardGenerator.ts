
import { GoogleGenAI, Type } from "@google/genai";
import { Reward } from '../types';

// This type is for the raw AI response before we format it into a full Reward object.
// It omits fields that we'll add programmatically, like 'id' and 'needsApproval'.
type GeneratedRewardData = Omit<Reward, 'id' | 'needsApproval'>;

// Define the expected JSON structure for the AI's response.
const responseSchema = {
    type: Type.OBJECT,
    properties: {
        name: {
            type: Type.STRING,
            description: "A short, exciting name for a reward a child might want (e.g., 'Gamer's Paradise Pass', 'Master Chef's Assistant')."
        },
        description: {
            type: Type.STRING,
            description: "A one-sentence, fun description of the reward."
        },
        cost: {
            type: Type.INTEGER,
            description: "An integer value for the XP cost, between 50 and 500."
        },
        limit: {
            type: Type.OBJECT,
            properties: {
                type: {
                    type: Type.STRING,
                    description: "How often the reward can be claimed. Must be 'daily', 'weekly', 'monthly', or 'none'."
                },
                count: {
                    type: Type.INTEGER,
                    description: "The number of times it can be claimed in that period. Should be 1, unless the limit type is 'none'."
                }
            },
            required: ["type", "count"]
        },
    },
    required: ["name", "description", "cost", "limit"]
};

/**
 * Generates a new reward using the Google Gemini API.
 */
export async function generateReward(): Promise<GeneratedRewardData> {
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    throw new Error("API_KEY environment variable not set. The app can't contact the AI service.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Generate a single, creative, and age-appropriate reward for a child aged 7-10. It should be something that can be redeemed for completing tasks. Make the name and description exciting. The cost should be between 50 and 500 XP. The limit type should be one of 'daily', 'weekly', 'monthly', or 'none'. If the limit type is not 'none', the count should be 1.",
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const jsonText = response.text.trim();
    const generatedData = JSON.parse(jsonText) as GeneratedRewardData;

    // Basic validation
    if (!generatedData.name || !generatedData.description || typeof generatedData.cost !== 'number' || !generatedData.limit || !['daily', 'weekly', 'monthly', 'none'].includes(generatedData.limit.type)) {
        throw new Error("AI response is missing required fields or has incorrect types.");
    }
    
    // Clamp the cost to be within the specified range
    generatedData.cost = Math.max(50, Math.min(500, generatedData.cost));
    
    // Ensure count is set correctly
    if (generatedData.limit.type !== 'none' && !generatedData.limit.count) {
        generatedData.limit.count = 1;
    }

    return generatedData;

  } catch (error) {
    console.error("Error generating reward:", error);
    if (error instanceof Error && error.message.includes("SAFETY")) {
        throw new Error("The generated reward was blocked for safety reasons. Please try again.");
    }
    throw new Error("Failed to generate a new reward. The AI might be busy or an error occurred.");
  }
}
