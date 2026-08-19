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
        { operationName: `${operationName} [${model}]`, maxRetries: 0, initialDelayMs: 500 }
      );
      return response;
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(`[${operationName}] Model ${model} unavailable (${errMsg.substring(0, 60)}...). Trying next model...`);
    }
  }

  throw lastError;
}

/**
 * Robust retry handler with exponential backoff and jitter for transient Gemini API errors (503 high demand, connection resets)
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
  const maxRetries = options.maxRetries ?? 1;
  const initialDelayMs = options.initialDelayMs ?? 800;
  const backoffFactor = options.backoffFactor ?? 1.5;
  const opName = options.operationName ?? "Gemini API Call";

  let lastError: any = null;
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      const isQuotaOrAuth =
        errMsg.includes("429") ||
        errMsg.includes("RESOURCE_EXHAUSTED") ||
        errMsg.includes("quota") ||
        errMsg.includes("API key not valid");

      // For quota or auth issues, fail fast so fallback systems activate immediately without blocking
      if (isQuotaOrAuth || attempt > maxRetries) {
        throw err;
      }

      const isTransientNetwork =
        errMsg.includes("503") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("high demand") ||
        errMsg.includes("fetch failed") ||
        errMsg.includes("ECONNRESET");

      if (!isTransientNetwork) {
        throw err;
      }

      const delay = Math.min(
        initialDelayMs * Math.pow(backoffFactor, attempt - 1) + Math.random() * 200,
        3000
      );
      console.warn(
        `[${opName}] Transient issue (${errMsg.substring(0, 60)}). Retrying in ${Math.round(delay)}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
