
import { GoogleGenAI, Type } from "@google/genai";
import { Task } from '@/src/types';

// This type is for the raw AI response before we format it into a Task
type GeneratedTaskData = Omit<Task, 'id'>;

// As per requirements, the API key is sourced from the environment variables.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This will prevent the app from running without the API key,
  // making it clear that it's a required configuration.
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Define the expected JSON structure for the AI's response.
const responseSchema = {
    type: Type.OBJECT,
    properties: {
        name: {
            type: Type.STRING,
            description: "A short, engaging name for the task. (e.g., 'Master of the Socks', 'Bookworm Adventure')."
        },
        description: {
            type: Type.STRING,
            description: "A one-sentence, fun description of the task."
        },
        xp: {
            type: Type.INTEGER,
            description: "An integer value for experience points, between 10 and 100."
        },
        repeatable: {
            type: Type.STRING,
            description: "How often the task can be done. Must be 'daily', 'weekly', or 'none'."
        },
    },
    required: ["name", "description", "xp", "repeatable"]
};

/**
 * Generates a new quest using the Google Gemini API.
 * It requests a single, creative task and expects a JSON response matching the defined schema.
 */
export async function generateQuest(): Promise<GeneratedTaskData> {
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Generate a single, creative, and age-appropriate household chore or self-improvement task for a child aged 7-10. The task should be framed in a fun, gamified way. Make the name and description exciting. The xp should be fair for the task's difficulty.",
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const jsonText = response.text.trim();
    const generatedData = JSON.parse(jsonText) as GeneratedTaskData;

    // Validate the response to ensure it conforms to our Task structure.
    if (!generatedData.name || !generatedData.description || typeof generatedData.xp !== 'number' || !['daily', 'weekly', 'none'].includes(generatedData.repeatable)) {
        throw new Error("AI response is missing required fields or has incorrect types.");
    }
    
    // Clamp XP to a reasonable range just in case the AI goes wild.
    generatedData.xp = Math.max(10, Math.min(100, generatedData.xp));

    return generatedData;
  } catch (error) {
    console.error("Error generating quest:", error);
    // Re-throw a more user-friendly error to be displayed in the UI.
    throw new Error("Failed to generate a new quest. The AI might be busy.");
  }
}
