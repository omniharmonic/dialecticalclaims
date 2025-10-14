import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY!

if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set')
}

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(apiKey)

// Configuration for dialectic generation
const GENERATION_CONFIG = {
  temperature: 0.9,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 2048,
}

// Configuration for synthesis generation
const SYNTHESIS_CONFIG = {
  temperature: 0.8,
  topP: 0.9,
  topK: 30,
  maxOutputTokens: 1024,
}

// Get model for dialectic generation (streaming)
// Using stable 1.5-flash for better free tier limits:
// - 15 requests/min vs 10 for experimental
// - 1,500 requests/day vs 50 for experimental
export function getDialecticModel() {
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash-latest',
    generationConfig: GENERATION_CONFIG,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
    ],
  })
}

// Get model for synthesis generation
export function getSynthesisModel() {
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash-latest',
    generationConfig: SYNTHESIS_CONFIG,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
    ],
  })
}