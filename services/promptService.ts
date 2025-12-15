import { GoogleGenAI } from "@google/genai";
import { AppState } from '../types';

const BASE_PROMPT_CORE = "Transforme esta fotografia de alimento em uma imagem ultra profissional em estilo editorial gastronômico. Aplique iluminação de estúdio suave e difusa, realçando textura, brilho e frescor do alimento. Melhore as cores para torná-las mais vivas, naturais e apetitosas. Ajuste o enquadramento para composição perfeita, seguindo regras de fotografia gastronômica (como regra dos terços e foco seletivo). Crie um cenário sofisticado com ambientação realista, usando fundo com profundidade, elementos de mesa minimalistas e tons harmônicos que valorizem o prato. Aplique correção de perspectiva, nitidez avançada e tratamento premium. Mantenha o prato como protagonista absoluto. Resultado final: fotografia digna de revista gourmet, extremamente nítida, estética, elegante e profissional.";

/**
 * Generates the text prompt based on user configuration.
 */
export const generatePrompt = (state: AppState): string => {
  const activeEnhancements = state.enhancements
    .filter(e => e.selected)
    .map(e => e.label)
    .join(", ");

  const userCustomInstructions = state.userDescription 
    ? `- INSTRUÇÕES EXTRAS DO USUÁRIO: ${state.userDescription}`
    : "";

  const prompt = `
    [CONTEXTO]: O usuário enviou uma foto de ${state.selectedFoodType || "alimento"}.
    [PROMPT PRINCIPAL]: ${BASE_PROMPT_CORE}
    [DETALHES ESPECÍFICOS]:
    - Tipo de Alimento: ${state.selectedFoodType}
    - Melhorias Solicitadas: ${activeEnhancements}
    - Proporção Final: ${state.aspectRatio}
    ${userCustomInstructions}
    
    Instruction: Generate a high-quality, photorealistic image based on the input image and the description above. Ensure the main food item remains the protagonist and looks exactly as described. Pay special attention to the user's custom instructions if provided.
  `.trim();

  console.log("--- PROMPT GERADO ---");
  console.log(prompt);
  return prompt;
};

/**
 * Converts a File object to a Base64 string (raw data) for the Gemini API.
 */
const fileToGoogleGenAIInput = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g. "data:image/jpeg;base64,")
      // The API expects just the raw base64 data.
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Sends the image and prompt to the Gemini API and returns the processed image URL.
 */
export const generateEnhancedImage = async (state: AppState): Promise<string> => {
    if (!state.imageFile) {
        throw new Error("No image file provided.");
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const base64Image = await fileToGoogleGenAIInput(state.imageFile);
        const promptText = generatePrompt(state);

        console.log("Enviando para Gemini API...");

        // We use gemini-2.5-flash-image as it supports image input + text prompt -> image output
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { 
                        inlineData: { 
                            mimeType: state.imageFile.type, 
                            data: base64Image 
                        } 
                    },
                    { text: promptText }
                ]
            }
        });

        // Iterate through parts to find the image
        if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    // Create a usable Data URL for the frontend
                    const mimeType = part.inlineData.mimeType || 'image/png';
                    return `data:${mimeType};base64,${part.inlineData.data}`;
                }
            }
        }

        throw new Error("A IA não retornou uma imagem válida. Tente ajustar o tipo de alimento.");

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};

/**
 * Refines an existing generated image based on user instructions.
 */
export const refineImage = async (currentImageDataUrl: string, instruction: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Extract base64 data from Data URL
        // Expect format: data:image/png;base64,.....
        const matches = currentImageDataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
            throw new Error("Dados da imagem inválidos para refinamento.");
        }
        
        const mimeType = matches[1];
        const base64Data = matches[2];

        console.log("Enviando refinamento para Gemini API...");
        const editPrompt = `Edit this image based on the following instruction: "${instruction}". Maintain the high-quality, photorealistic editorial food photography style. Do not change the aspect ratio.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { 
                        inlineData: { 
                            mimeType: mimeType, 
                            data: base64Data 
                        } 
                    },
                    { text: editPrompt }
                ]
            }
        });

        if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    const respMimeType = part.inlineData.mimeType || 'image/png';
                    return `data:${respMimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        
        throw new Error("Falha ao refinar a imagem.");

    } catch (error) {
        console.error("Gemini API Refine Error:", error);
        throw error;
    }
};