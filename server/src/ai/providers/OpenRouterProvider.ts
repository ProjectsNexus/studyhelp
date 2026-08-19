import { z } from "zod";
import {
  AIProvider,
  GenerateJSONOptions,
  GenerateTextOptions,
  NormalizedAIResponse,
} from "../AIProvider.js";
import { ResponseValidator } from "../responseValidator.js";

export class OpenRouterProvider implements AIProvider {
  private apiKey?: string;
  private model: string;
  private cooldownUntil: number = 0;
  private baseUrl: string = "https://openrouter.ai/api/v1/chat/completions";

  constructor(apiKey?: string, model: string = "meta-llama/llama-3.3-70b-instruct:free") {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY;
    this.model = model;
  }

  getName(): string {
    return "openrouter";
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
    console.warn(`[OpenRouterProvider] Cooldown activated for ${seconds}s until ${new Date(this.cooldownUntil).toISOString()}`);
  }

  private async callOpenRouterApi(
    payload: any,
    timeoutMs: number = 30000,
    taskName: string = "OpenRouter Call"
  ): Promise<any> {
    const key = this.apiKey || process.env.OPENROUTER_API_KEY;
    if (!key) {
      throw new Error("OPENROUTER_API_KEY is not configured for OpenRouter fallback.");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://studyhelper.app",
          "X-Title": "AI Academic Research Platform",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errBody: string = "";
        try {
          errBody = await response.text();
        } catch {
          errBody = response.statusText;
        }

        const error: any = new Error(
          `[${taskName}] OpenRouter HTTP ${response.status} (${response.statusText}): ${errBody.substring(0, 150)}`
        );
        error.status = response.status;
        error.isFallbackEligible = response.status === 429 || response.status >= 500;
        throw error;
      }

      const json = await response.json();
      return json;
    } catch (err: any) {
      if (err.name === "AbortError" || err.message?.includes("aborted")) {
        const timeoutErr: any = new Error(`[${taskName}] OpenRouter request timed out after ${timeoutMs}ms`);
        timeoutErr.isTimeout = true;
        timeoutErr.isFallbackEligible = true;
        throw timeoutErr;
      }
      this.handleError(err, taskName);
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async generateText(prompt: string, options?: GenerateTextOptions): Promise<NormalizedAIResponse> {
    const taskName = options?.taskName || "OpenRouter.generateText";
    const timeoutMs = options?.timeoutMs || 30000;

    const messages: Array<{ role: string; content: any }> = [];

    if (options?.systemInstruction) {
      messages.push({
        role: "system",
        content: options.systemInstruction,
      });
    }

    if (options?.inlineMedia) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${options.inlineMedia.mimeType};base64,${options.inlineMedia.data}`,
            },
          },
        ],
      });
    } else {
      messages.push({
        role: "user",
        content: prompt,
      });
    }

    const payload: any = {
      model: this.model,
      messages,
      temperature: typeof options?.temperature === "number" ? options.temperature : 0.4,
    };

    try {
      const result = await this.callOpenRouterApi(payload, timeoutMs, taskName);
      const text = result?.choices?.[0]?.message?.content || "";
      const usage = result?.usage;

      return {
        text,
        provider: "openrouter",
        model: this.model,
        fallbackUsed: true,
        usage: usage
          ? {
              inputTokens: usage.prompt_tokens,
              outputTokens: usage.completion_tokens,
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
    const taskName = options.taskName || "OpenRouter.generateJSON";
    const timeoutMs = options.timeoutMs || 30000;

    const systemPrompt = `${options.systemInstruction || "You are an expert academic research assistant."}\n\nIMPORTANT FORMATTING REQUIREMENT:\nYou MUST return your entire response as a valid, well-formed JSON object. Do not include introductory conversational text or concluding text outside the JSON. Return only the raw JSON.`;

    const messages: Array<{ role: string; content: any }> = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    if (options.inlineMedia) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: `${prompt}\n\nStrict requirement: Output valid JSON matching the requested schema.`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${options.inlineMedia.mimeType};base64,${options.inlineMedia.data}`,
            },
          },
        ],
      });
    } else {
      messages.push({
        role: "user",
        content: `${prompt}\n\nStrict requirement: Output valid JSON matching the requested schema.`,
      });
    }

    const payload: any = {
      model: this.model,
      messages,
      temperature: typeof options.temperature === "number" ? options.temperature : 0.2,
      response_format: { type: "json_object" },
    };

    try {
      const result = await this.callOpenRouterApi(payload, timeoutMs, taskName);
      const rawText = result?.choices?.[0]?.message?.content || "{}";
      const validatedData = ResponseValidator.parseAndValidate(rawText, options.schema, taskName);
      const usage = result?.usage;

      const normalizedResponse: NormalizedAIResponse = {
        text: rawText,
        provider: "openrouter",
        model: this.model,
        fallbackUsed: true,
        usage: usage
          ? {
              inputTokens: usage.prompt_tokens,
              outputTokens: usage.completion_tokens,
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
      msg.includes("rate limit") ||
      msg.includes("credits") ||
      err?.status === 429;

    const isServerError =
      msg.includes("500") ||
      msg.includes("502") ||
      msg.includes("503") ||
      msg.includes("504") ||
      err?.status >= 500;

    const isNetwork =
      msg.includes("fetch failed") ||
      msg.includes("ECONNRESET") ||
      msg.includes("ETIMEDOUT") ||
      err?.isTimeout;

    if (isRateLimit || isServerError || isNetwork) {
      err.isRetryableProviderError = true;
      err.isFallbackEligible = true;
      console.warn(`[OpenRouterProvider] Capacity or network error in ${taskName}: ${msg.substring(0, 80)}...`);
    }
  }
}
