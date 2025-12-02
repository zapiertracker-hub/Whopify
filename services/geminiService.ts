import { GoogleGenAI } from "@google/genai";

export const generateMarketingCopy = async (
  productName: string,
  productType: string,
  language: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are a conversion copywriting expert for high-performance checkout pages.
    Write a short, punchy "Why Buy This" summary (bullet points, max 50 words) for a "${productType}" named "${productName}" to be placed on a checkout page.
    Focus on overcoming objections and instant value.
    The output must be in ${language === 'ar' ? 'Arabic' : language === 'fr' ? 'French' : 'English'}.
    Do not use markdown formatting like bold or italics, just plain text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating content. Please try again later.";
  }
};

export const generateBusinessInsights = async (
  metrics: { visits: number; conversion: number; revenue: number }
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze these checkout page metrics:
    - Visits: ${metrics.visits}
    - Conversion Rate: ${metrics.conversion}%
    - Revenue: $${metrics.revenue}
    
    Provide 2 short, actionable tips to increase the conversion rate specifically for a checkout page (e.g. trust badges, fewer fields).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No insights available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not load insights.";
  }
};