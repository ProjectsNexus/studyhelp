import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import {
  AIProvider,
  GenerateJSONOptions,
  GenerateTextOptions,
  NormalizedAIResponse,
} from "../AIProvider.js";
import { ResponseValidator } from "../responseValidator.js";

export class GeminiProvider implements AIProvider {
  private apiKey?: string;
  private model: string;
  private client: GoogleGenAI | null = null;
  private cooldownUntil: number = 0;

  constructor(apiKey?: string, model: string = "gemini-3.7-flash") {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
    this.model = model;
  }

  getName(): string {
    return "gemini";
  }

  getModel(): string {
    return this.model;
  }

  isAvailable(): boolean {
    if (!this.apiKey) {
      return false;
    }
    return Date.now() >= this.cooldownUntil;
  }

  setCooldown(seconds: number): void {
    this.cooldownUntil = Date.now() + seconds * 1000;
    console.warn(`[GeminiProvider] Cooldown activated for ${seconds}s until ${new Date(this.cooldownUntil).toISOString()}`);
  }

  private getClient(): GoogleGenAI {
    if (!this.client) {
      const key = this.apiKey || process.env.GEMINI_API_KEY;
      if (!key) {
        throw new Error("GEMINI_API_KEY environment variable is required to initialize GeminiProvider");
      }
      this.client = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return this.client;
  }

  private async executeWithTimeout<T>(
    promiseFactory: () => Promise<T>,
    timeoutMs: number = 30000,
    taskName: string = "Gemini Call"
  ): Promise<T> {
    let timer: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        const err: any = new Error(`[${taskName}] Gemini request timed out after ${timeoutMs}ms`);
        err.isTimeout = true;
        reject(err);
      }, timeoutMs);
    });

    try {
      return await Promise.race([promiseFactory(), timeoutPromise]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async generateText(prompt: string, options?: GenerateTextOptions): Promise<NormalizedAIResponse> {
    const ai = this.getClient();
    const taskName = options?.taskName || "Gemini.generateText";
    const timeoutMs = options?.timeoutMs || 30000;

    const contents: any[] = [];
    if (options?.inlineMedia) {
      contents.push({
        inlineData: {
          mimeType: options.inlineMedia.mimeType,
          data: options.inlineMedia.data,
        },
      });
    }
    contents.push({ text: prompt });

    const config: any = {};
    if (options?.systemInstruction) {
      config.systemInstruction = options.systemInstruction;
    }
    if (typeof options?.temperature === "number") {
      config.temperature = options.temperature;
    }
    if (options?.tools && options.tools.length > 0) {
      config.tools = options.tools;
    }

    try {
      const response = await this.executeWithTimeout(
        () =>
          ai.models.generateContent({
            model: this.model,
            contents: contents.length === 1 && typeof contents[0].text === "string" ? contents[0].text : contents,
            config: Object.keys(config).length > 0 ? config : undefined,
          }),
        timeoutMs,
        taskName
      );

      const rawText = response.text || "";
      const usageMetadata = response.usageMetadata;

      return {
        text: rawText,
        provider: "gemini",
        model: this.model,
        fallbackUsed: false,
        usage: usageMetadata
          ? {
              inputTokens: usageMetadata.promptTokenCount,
              outputTokens: usageMetadata.candidatesTokenCount,
            }
          : undefined,
      };
    } catch (err: any) {
      this.handleError(err, taskName);
      throw err;
    }
  }

  async generateJSON<T>(
    prompt: string,
    options: GenerateJSONOptions<T>
  ): Promise<{ data: T; response: NormalizedAIResponse }> {
    const ai = this.getClient();
    const taskName = options.taskName || "Gemini.generateJSON";
    const timeoutMs = options.timeoutMs || 30000;

    const contents: any[] = [];
    if (options.inlineMedia) {
      contents.push({
        inlineData: {
          mimeType: options.inlineMedia.mimeType,
          data: options.inlineMedia.data,
        },
      });
    }
    contents.push({ text: prompt });

    const config: any = {
      responseMimeType: "application/json",
    };

    if (options.systemInstruction) {
      config.systemInstruction = options.systemInstruction;
    }
    if (typeof options.temperature === "number") {
      config.temperature = options.temperature;
    }
    if (options.tools && options.tools.length > 0) {
      config.tools = options.tools;
    }

    try {
      const response = await this.executeWithTimeout(
        () =>
          ai.models.generateContent({
            model: this.model,
            contents: contents.length === 1 && typeof contents[0].text === "string" ? contents[0].text : contents,
            config,
          }),
        timeoutMs,
        taskName
      );

      const rawText = response.text || "{}";
      const validatedData = ResponseValidator.parseAndValidate(rawText, options.schema, taskName);
      const usageMetadata = response.usageMetadata;

      const normalizedResponse: NormalizedAIResponse = {
        text: rawText,
        provider: "gemini",
        model: this.model,
        fallbackUsed: false,
        usage: usageMetadata
          ? {
              inputTokens: usageMetadata.promptTokenCount,
              outputTokens: usageMetadata.candidatesTokenCount,
            }
          : undefined,
      };

      return {
        data: validatedData,
        response: normalizedResponse,
      };
    } catch (err: any) {
      this.handleError(err, taskName);
      throw err;
    }
  }

  private handleError(err: any, taskName: string): void {
    const msg = err?.message || String(err);
    const isRateLimit =
      msg.includes("429") ||
      msg.includes("RESOURCE_EXHAUSTED") ||
      msg.includes("quota") ||
      err?.status === 429;

    const isServerError =
      msg.includes("500") ||
      msg.includes("502") ||
      msg.includes("503") ||
      msg.includes("504") ||
      msg.includes("UNAVAILABLE") ||
      msg.includes("high demand") ||
      err?.status >= 500;

    const isNetwork =
      msg.includes("fetch failed") ||
      msg.includes("ECONNRESET") ||
      msg.includes("ETIMEDOUT") ||
      err?.isTimeout;

    if (isRateLimit || isServerError || isNetwork) {
      err.isRetryableProviderError = true;
      err.isFallbackEligible = true;
      console.warn(`[GeminiProvider] Transient/Capacity failure in ${taskName}: ${msg.substring(0, 80)}...`);
    }
  }
}
