import { GoogleGenerativeAI } from "@google/generative-ai";

interface Model {
  name: string;
  supportedGenerationMethods: string[];
}

interface ModelsResponse {
  models: Model[];
}

let model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;

export async function getModel() {
  if (!model) {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY environment variable is required");
    }
    
    // Kullanılabilir modelleri API'den al
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_AI_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }
    
    const data: ModelsResponse = await response.json();
    
    // generateContent destekleyen modelleri filtrele
    const supportedModels = data.models?.filter((m: Model) => 
      m.supportedGenerationMethods?.includes('generateContent')
    ) || [];
    
    if (supportedModels.length === 0) {
      throw new Error("No models support generateContent with your API key");
    }
    
    // Free tier için küçük modelleri tercih et (flash > pro)
    const preferredOrder = ['flash', 'gemini-1.0', 'gemini-pro'];
    let selectedModel = supportedModels[0]; // fallback
    
    for (const preference of preferredOrder) {
      const found = supportedModels.find((m: Model) => 
        m.name.toLowerCase().includes(preference)
      );
      if (found) {
        selectedModel = found;
        break;
      }
    }
    
    const modelName = selectedModel.name;
    console.log(`Using model: ${modelName}`);
    console.log(`Available models: ${supportedModels.map((m: Model) => m.name).join(', ')}`);
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    model = genAI.getGenerativeModel({ 
      model: modelName.replace('models/', ''),
      generationConfig: {
        maxOutputTokens: 200, // SQL sorguları için daha yüksek token sınırı
        temperature: 0.1, // Daha deterministik yanıtlar
      }
    });
  }
  
  return model;
}