import { GoogleGenAI, Type } from "@google/genai";

/**
 * Converts a File object to a Base64 string for the Gemini API.
 */
const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface ValidationResult {
  isValid: boolean;
  reason: string;
}

/**
 * Validates if the uploaded image is a receipt containing the value R$ 1,00.
 */
export const validatePaymentProof = async (proofFile: File): Promise<ValidationResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const base64Image = await fileToBase64(proofFile);

    const prompt = `
      Analyze this image. It is supposed to be a payment receipt (Pix confirmation) from a banking app.
      
      Task:
      1. Identify if it looks like a payment receipt.
      2. Search specifically for a transaction value of exactly "1,00" or "1.00" or "R$ 1,00".
      
      Return a JSON object with:
      - isValid: boolean (true only if it is a receipt AND contains the value 1,00)
      - reason: string (short explanation in Portuguese)
    `;

    // Define schema for structured JSON output
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        isValid: { type: Type.BOOLEAN },
        reason: { type: Type.STRING },
      },
      required: ["isValid", "reason"],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: proofFile.type, data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText) as ValidationResult;

    return result;

  } catch (error) {
    console.error("Payment Validation Error:", error);
    return {
      isValid: false,
      reason: "Erro técnico ao analisar o comprovante. Tente enviar uma foto mais nítida."
    };
  }
};