import creatOpenRouterClient from "@openrouter/ai-sdk-provider";

export function getAgentModel() {
  const provider = creatOpenRouterClient({  apiKey: process.env.OPENROUTER_API_KEY,}); 
  const defaultModel = process.env.OPENROUTER_DEFAULT_MODEL
}