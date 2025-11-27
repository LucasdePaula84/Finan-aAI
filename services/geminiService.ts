import { GoogleGenAI } from "@google/genai";
import { Transaction } from '../types';

// Initialize the API client
// Note: process.env.API_KEY is replaced by Vite during build time via define config
// @ts-ignore
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFinances = async (
  transactions: Transaction[], 
  userQuery: string
): Promise<string> => {
  try {
    // Serialize transactions to provide context
    const transactionContext = JSON.stringify(transactions);

    const prompt = `
      Você é um assistente financeiro pessoal especialista e amigável.
      
      Aqui estão os dados das minhas transações financeiras atuais em formato JSON:
      ${transactionContext}
      
      Por favor, responda à seguinte pergunta ou solicitação do usuário com base nesses dados:
      "${userQuery}"
      
      Diretrizes:
      1. Responda em Português do Brasil.
      2. Seja conciso, mas útil.
      3. Use formatação Markdown (negrito, listas) para facilitar a leitura.
      4. Se os dados estiverem vazios, dê dicas gerais sobre como começar a organizar finanças.
      5. Analise tendências de gastos se solicitado.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });

    return response.text || "Desculpe, não consegui analisar seus dados no momento.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ocorreu um erro ao consultar a IA. Verifique se sua chave de API está configurada corretamente nas variáveis de ambiente.";
  }
};