import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

export function getGeminiAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not set. Requests will fail if key is required.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy-key-for-init",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

/**
 * Resilient Gemini Content Generation with Multi-Model Fallback and Exponential Retry.
 * Seamlessly handles 503 high demand or 429 quota exhaustion by switching to alternate flash models.
 */
export async function generateContentWithFallback(
  requestConfig: {
    contents: string | any;
    config?: any;
  },
  operationName: string = "GeminiGeneration"
) {
  const ai = getGeminiAI();
  const candidateModels = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await withGeminiRetry(
        () =>
          ai.models.generateContent({
            model,
            contents: requestConfig.contents,
            config: requestConfig.config,
          }),
        { operationName: `${operationName} [${model}]`, maxRetries: 1, initialDelayMs: 1000 }
      );
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`[${operationName}] Model ${model} failed (${err?.message?.substring(0, 80)}). Trying fallback model...`);
    }
  }

  throw lastError;
}

/**
 * Robust retry handler with exponential backoff and jitter for transient Gemini API errors (429 rate limit, 503 high demand)
 */
export async function withGeminiRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    backoffFactor?: number;
    operationName?: string;
  } = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 2;
  const initialDelayMs = options.initialDelayMs ?? 1000;
  const backoffFactor = options.backoffFactor ?? 2;
  const opName = options.operationName ?? "Gemini API Call";

  let lastError: any = null;
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      const isRetryable =
        errMsg.includes("503") ||
        errMsg.includes("429") ||
        errMsg.includes("RESOURCE_EXHAUSTED") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("high demand") ||
        errMsg.includes("quota") ||
        errMsg.includes("fetch failed") ||
        errMsg.includes("ECONNRESET");

      if (!isRetryable || attempt > maxRetries) {
        throw err;
      }

      const delay = Math.min(
        initialDelayMs * Math.pow(backoffFactor, attempt - 1) + Math.random() * 400,
        6000
      );
      console.warn(
        `[${opName}] Attempt ${attempt} failed with retryable error (${errMsg.substring(0, 80)}). Retrying in ${Math.round(delay)}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
