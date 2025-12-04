
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CardCategory } from "../types";

const API_KEY = process.env.API_KEY || '';

// Define the expected schema for the card data
const cardSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    issuer: {
      type: Type.STRING,
      description: "The issuing entity (e.g., Visa, Company Name, Government Country, DMV State).",
    },
    type: {
      type: Type.STRING,
      enum: [
        CardCategory.BANKING, 
        CardCategory.BUSINESS, 
        CardCategory.ID, 
        CardCategory.LOYALTY, 
        CardCategory.PASSPORT, 
        CardCategory.DRIVER_LICENSE, 
        CardCategory.NATIONAL_ID,
        CardCategory.STUDENT_ID,
        CardCategory.OTHER
      ],
      description: "The category of the card or document.",
    },
    number: {
      type: Type.STRING,
      description: "The primary identifier number (Card Number, Phone, Passport No, Driver License No). Mask sensitive digits if banking.",
    },
    holderName: {
      type: Type.STRING,
      description: "The name of the card/document holder.",
    },
    expiryDate: {
      type: Type.STRING,
      description: "Expiry date in MM/YY or MM/YYYY format.",
    },
    cvv: {
      type: Type.STRING,
      description: "Security code if visible.",
    },
    // Business Card Fields
    jobTitle: {
      type: Type.STRING,
      description: "The professional job title, role, or position of the cardholder (e.g., 'Software Engineer', 'Director').",
    },
    email: {
      type: Type.STRING,
      description: "The email address associated with the cardholder.",
    },
    phone: {
      type: Type.STRING,
      description: "The contact phone number on the card.",
    },
    // ID/Vault Fields
    dob: {
      type: Type.STRING,
      description: "Date of Birth in DD/MM/YYYY format if present on ID.",
    },
    nationality: {
      type: Type.STRING,
      description: "Nationality or Country Code for Passports/IDs.",
    }
  },
  required: ["issuer", "type", "holderName"],
};

export const analyzeCardImage = async (base64Image: string): Promise<any> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please configure your environment.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image,
          },
        },
        {
          text: "Analyze this image. It could be a credit card, business card, passport, driver's license, or national ID. Extract details into JSON.",
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: cardSchema,
        temperature: 0.1, // Low temperature for factual extraction
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text from Gemini.");
    }
    
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
