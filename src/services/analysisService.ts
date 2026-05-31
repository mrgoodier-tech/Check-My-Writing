import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export enum ErrorType {
  SPELLING = "SPELLING",
  FULL_STOP = "FULL_STOP",
  COMMA = "COMMA",
  SPACE = "SPACE",
}

export interface WritingError {
  fragment: string; // The part of the text with the error
  type: ErrorType;
  correction: string;
  reason: string;
  offset: number; // Index in the original text (if the model can provide it accurately)
  length: number;
}

export interface AnalysisResult {
  summary: string;
  score: number;
  totalMistakes: number;
  suggestions: string[];
  errors: WritingError[];
}

export async function analyzeText(text: string): Promise<AnalysisResult> {
  if (!text.trim()) {
    throw new Error("Please provide some text to analyze.");
  }

  const prompt = `Analyze the following piece of writing for UK English spelling, missing full stops, missing commas, and missing spaces.
  
  Writing to analyze:
  "${text}"

  Specific instructions:
  1. Spelling: Only flag words that are incorrect in UK English (e.g. 'color' is an error, 'colour' is correct).
  2. Full Stops: Identify places where a full stop is missing at the end of a sentence.
  3. Commas: Identify missing commas based on standard UK English grammar.
  4. Spaces: Identify missing spaces between words or after punctuation.
  5. Summary: Provide a 2-sentence summary of the content.
  6. Score: Give an overall quality score out of 100.
  7. Suggestions: List 3 key ways the author could improve this specific piece of writing.
  8. Errors: For every error found, specify the exact 'fragment' from the original text (as it appears), the 'type' (SPELLING, FULL_STOP, COMMA, or SPACE), the 'correction', and a brief 'reason'.
  
  CRITICAL: You MUST provide the exact 'offset' (0-indexed start position) and 'length' for each error in the original string provided. If an error is a "missing" character, use the nearest word as the fragment or the location where it should be.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            score: { type: Type.NUMBER },
            totalMistakes: { type: Type.NUMBER },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            errors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  fragment: { type: Type.STRING },
                  type: { 
                    type: Type.STRING,
                    enum: Object.values(ErrorType)
                  },
                  correction: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  offset: { type: Type.NUMBER },
                  length: { type: Type.NUMBER },
                },
                required: ["fragment", "type", "correction", "reason", "offset", "length"],
              },
            },
          },
          required: ["summary", "score", "totalMistakes", "suggestions", "errors"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Failed to analyze writing. Please try again.");
  }
}
