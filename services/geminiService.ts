import { GoogleGenAI, Type } from "@google/genai";
import { OutfitRecommendation, UserInput, WeatherData } from "../types";

// Helper to safely get the client instance
const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is configured.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateOutfitRecommendation = async (
  user: UserInput,
  weather: WeatherData
): Promise<OutfitRecommendation | null> => {
  try {
    const ai = getGeminiClient();
    const model = "gemini-2.5-flash";
    
    const systemInstruction = `
      You are an expert personal stylist, nutritionist, and meteorologist combined. 
      Your goal is to recommend the perfect outfit and suitable snacks based on user details and weather.
      
      STRICT LOGIC RULES:
      1. If the user is Older (60+) AND it is Cold (<10°C): Prioritize warmth and comfort above all else. Suggest wool, thermal layers, and non-slip sturdy shoes.
      2. If the user is Young (18-30) AND it is Hot (>25°C): Suggest trendy, breathable options like linen, crop tops (if applicable), graphic tees, and open footwear.
      3. If Rain is detected (Weather Code indicates rain/drizzle/storm): You MUST suggest a raincoat, waterproof shoes, or an umbrella, regardless of age or gender.
      4. For 'Others' gender: Suggest gender-neutral clothing that fits the weather context.
      5. Always match the vibe of the city if known (e.g., Paris = Chic, New York = Urban/Edgy).
      6. Suggest 2-3 easy-to-carry food or drink items that are appropriate for the weather (e.g., Hot Cocoa for snow, Electrolyte water/fruits for heat).
    `;

    const prompt = `
      User Profile:
      - Age: ${user.age}
      - Gender: ${user.gender}
      - Location: ${user.city}

      Current Weather Conditions:
      - Temperature: ${weather.temperature}°C
      - Condition: ${weather.description}
      - Day/Night: ${weather.isDay ? 'Day' : 'Night'}

      Generate a stylish, practical outfit recommendation and food suggestions following the rules provided.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: "A catchy 3-5 word title for the look" },
            top: { type: Type.STRING, description: "Detailed recommendation for upper body wear" },
            bottom: { type: Type.STRING, description: "Detailed recommendation for lower body wear" },
            footwear: { type: Type.STRING, description: "Specific shoe recommendation" },
            accessories: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of 2-3 essential accessories"
            },
            foodItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 2-3 easy to carry food/drink items suitable for the weather"
            },
            reasoning: { type: Type.STRING, description: "A friendly explanation of why this outfit works for the weather and age." },
            colorPalette: { type: Type.STRING, description: "Suggested color combination (e.g., 'Navy and Cream')" }
          },
          required: ["headline", "top", "bottom", "footwear", "accessories", "foodItems", "reasoning", "colorPalette"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text) as OutfitRecommendation;

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Rethrow specific API key errors so they show in UI
    if (error instanceof Error && error.message.includes("API Key")) {
      throw error;
    }
    return null;
  }
};

export const generateOutfitImage = async (
  user: UserInput,
  weather: WeatherData,
  rec: OutfitRecommendation
): Promise<{ url: string | null; error?: string }> => {
  try {
    const ai = getGeminiClient();
    let contents;

    if (user.userImage) {
      // Logic for User Image present (Image Editing/Generation based on reference)
      const base64Data = user.userImage.split(',')[1];
      const mimeType = user.userImage.split(';')[0].split(':')[1];
      
      const prompt = `
        Generate a photorealistic fashion image. 
        Use the person in the provided image as the model. Keep their facial features, body type, and hair exact.
        Dress them in the following outfit:
        - Top: ${rec.top}
        - Bottom: ${rec.bottom}
        - Footwear: ${rec.footwear}
        - Accessories: ${rec.accessories.join(", ")}
        
        The person is standing on a street in ${user.city}.
        The weather is ${weather.description}.
        High quality, 4k, fashion photography.
      `;

      contents = {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      };
    } else {
      // Logic for No User Image (Text to Image)
      const prompt = `
        A full body fashion photography shot of a ${user.age} year old ${user.gender} person standing on a street in ${user.city}.
        The weather is ${weather.description}.
        The person is wearing the following outfit:
        - Top: ${rec.top}
        - Bottom: ${rec.bottom}
        - Footwear: ${rec.footwear}
        - Accessories: ${rec.accessories.join(", ")}
        
        The style is ${rec.headline}. High quality, photorealistic, 4k, street style photography.
      `;

      contents = {
        parts: [{ text: prompt }]
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [contents], // Wrap in array to be explicitly safe
      config: {
        imageConfig: {
          aspectRatio: "3:4", 
        }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      console.warn("No content candidates returned. Potential safety filter trigger.", response);
      return { url: null, error: "The image could not be generated (likely safety filter or model busy)." };
    }

    for (const part of parts) {
      if (part.inlineData) {
        return { url: `data:image/png;base64,${part.inlineData.data}` };
      }
    }
    return { url: null, error: "No image data found in response." };

  } catch (error: any) {
    console.error("Gemini Image Gen Error:", error);
    return { url: null, error: error.message || "Failed to generate image." };
  }
};