
import { GoogleGenAI } from "@google/genai";
import { RenderingSettings } from "../types";

export const generateArchitecturalRender = async (
  base64Image: string,
  generalPrompt: string,
  settings: RenderingSettings,
  isRegenerate: boolean = false
): Promise<string> => {
  // Initialize Gemini with API key from environment variable directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const paletteDesc = settings.palette.join(", ");
  
  const architecturalPrompt = `
    TAREFA: Renderização arquitetônica de luxo para a marca "IDEAL PROJETOS".
    
    ESTILO E TEMA:
    - Tema de Design: ${settings.designTheme}. Aplique rigorosamente os princípios estéticos deste estilo.
    - Paleta de Cores (3 Tons Principais): ${paletteDesc}. Use estes tons para definir materiais de fachada, esquadrias e acabamentos, mantendo uma hierarquia visual elegante.

    GEOMETRIA (CRÍTICO):
    - Mantenha a volumetria e estrutura 100% fiel ao modelo original. Não adicione ou remova paredes, janelas ou telhados.

    ELEMENTOS E AMBIENTAÇÃO:
    - ILUMINAÇÃO E CÉU: ${settings.timeOfDay}. A luz deve ser fotorrealista, com sombras precisas e reflexos naturais.
    - MOBILIÁRIO: ${
      // Fix comparison with correct FurniturePolicy values
      settings.furniturePolicy === 'Manter Original' ? 'Mantenha o mobiliário original.' :
      settings.furniturePolicy === 'Remover Mobília' ? 'Cena totalmente vazia (unfurnished).' :
      `Adicione mobiliário AI de alta gama seguindo o tema ${settings.designTheme} com densidade de ${settings.creativityLevel}%.`
    }
    - PAISAGISMO: ${
      // Fix comparison with correct LandscapingPolicy values
      settings.landscapingPolicy === 'Manter Original' ? 'Mantenha o paisagismo original.' :
      settings.landscapingPolicy === 'Remover Paisagismo' ? 'Remova vegetação e deixe o terreno limpo.' :
      `Adicione vegetação e natureza exuberante de acordo com the tema ${settings.designTheme} e a iluminação ${settings.timeOfDay}.`
    }

    NÍVEL DE CRIATIVIDADE E DETALHE: ${settings.creativityLevel}% (influencia a riqueza de texturas e reflexos).

    PEDIDOS ESPECÍFICOS DO ARQUITETO:
    "${settings.designObservations}"

    ${isRegenerate ? 'REGENERAÇÃO: Forneça uma nova perspectiva de luz e materiais, mantendo a coerência estrutural.' : ''}

    SAÍDA: 8k, ultra-realista, ray-tracing, acabamento fotográfico premium.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1] || base64Image,
              mimeType: 'image/png',
            },
          },
          {
            text: architecturalPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: settings.aspectRatio,
        }
      }
    });

    let generatedImageUrl = '';
    // Correctly iterate through parts to find the image part as per guidelines
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!generatedImageUrl) throw new Error("Falha na geração da imagem.");
    return generatedImageUrl;
  } catch (error) {
    console.error("Erro Gemini:", error);
    throw error;
  }
};
