import { z } from "zod";
import {
  AIProvider,
  GenerateJSONOptions,
  GenerateTextOptions,
  NormalizedAIResponse,
} from "./AIProvider.js";
import { GeminiProvider } from "./providers/GeminiProvider.js";
import { OpenRouterProvider } from "./providers/OpenRouterProvider.js";
import { AIProviderConfig, getAIProviderConfig } from "./providerConfig.js";

export interface AIExecutionLog {
  task: string;
  provider: string;
  model: string;
  durationMs: number;
  fallbackUsed: boolean;
  attempts: number;
  status: "success" | "failure";
  errorType?: string;
}

export class AIProviderManager {
  private config: AIProviderConfig;
  private primaryProvider: AIProvider;
  private fallbackProvider: AIProvider;

  constructor(customConfig?: Partial<AIProviderConfig>) {
    const baseConfig = getAIProviderConfig();
    this.config = { ...baseConfig, ...customConfig };

    const gemini = new GeminiProvider(this.config.geminiApiKey, this.config.geminiModel);
    const openRouter = new OpenRouterProvider(this.config.openRouterApiKey, this.config.openRouterModel);

    if (this.config.primaryProvider === "openrouter") {
      this.primaryProvider = openRouter;
      this.fallbackProvider = gemini;
    } else {
      this.primaryProvider = gemini;
      this.fallbackProvider = openRouter;
    }
  }

  getPrimaryProviderName(): string {
    return this.primaryProvider.getName();
  }

  getFallbackProviderName(): string {
    return this.fallbackProvider.getName();
  }

  private isFallbackEligibleError(error: any): boolean {
    if (!error) return false;
    if (error.isFallbackEligible || error.isTimeout) return true;

    const msg = (error.message || String(error)).toLowerCase();
    const status = error.status || error.statusCode;

    // HTTP 429, quota, rate limit
    if (
      status === 429 ||
      msg.includes("429") ||
      msg.includes("quota") ||
      msg.includes("resource_exhausted") ||
      msg.includes("rate limit") ||
      msg.includes("credit")
    ) {
      return true;
    }

    // HTTP 500, 502, 503, 504
    if (
      (status >= 500 && status <= 504) ||
      msg.includes("500") ||
      msg.includes("502") ||
      msg.includes("503") ||
      msg.includes("504") ||
      msg.includes("unavailable") ||
      msg.includes("high demand")
    ) {
      return true;
    }

    // Timeout & network glitches
    if (
      msg.includes("timeout") ||
      msg.includes("timed out") ||
      msg.includes("fetch failed") ||
      msg.includes("econnreset") ||
      msg.includes("etimedout")
    ) {
      return true;
    }

    return false;
  }

  private classifyErrorType(error: any): string {
    const msg = (error?.message || String(error)).toLowerCase();
    const status = error?.status;

    if (status === 429 || msg.includes("429") || msg.includes("quota") || msg.includes("rate limit")) {
      return "RateLimitOrQuotaExhausted";
    }
    if (error?.isTimeout || msg.includes("timeout")) {
      return "Timeout";
    }
    if (status >= 500 || msg.includes("503") || msg.includes("500") || msg.includes("unavailable")) {
      return "ServerUnavailable5xx";
    }
    if (msg.includes("fetch failed") || msg.includes("network") || msg.includes("econnreset")) {
      return "NetworkGlitch";
    }
    if (msg.includes("json") || msg.includes("schema")) {
      return "SchemaOrJSONParseError";
    }
    return "ApplicationOrGeneralError";
  }

  private logMetric(log: AIExecutionLog): void {
    const errorInfo = log.errorType ? ` | ErrorType: ${log.errorType}` : "";
    console.log(
      `[AIProviderManager] Task: ${log.task} | Provider: ${log.provider} (${log.model}) | Status: ${log.status} | Attempts: ${log.attempts} | FallbackUsed: ${log.fallbackUsed} | Duration: ${log.durationMs}ms${errorInfo}`
    );
  }

  /**
   * Universal generateText method with automated Gemini -> OpenRouter fallback & retry logic
   */
  async generateText(prompt: string, options?: GenerateTextOptions): Promise<NormalizedAIResponse> {
    const startTime = Date.now();
    const taskName = options?.taskName || "GeneralTextGeneration";
    const timeoutMs = options?.timeoutMs || this.config.providerTimeoutMs;

    let primaryAttempts = 0;
    let primaryError: any = null;

    // Check if primary provider is available (not in cooldown and has credentials)
    if (this.primaryProvider.isAvailable()) {
      for (let attempt = 0; attempt <= this.config.maxRetriesPerProvider; attempt++) {
        primaryAttempts++;
        try {
          const response = await this.primaryProvider.generateText(prompt, {
            ...options,
            timeoutMs,
            taskName: `${taskName} [${this.primaryProvider.getName()}]`,
          });

          this.logMetric({
            task: taskName,
            provider: this.primaryProvider.getName(),
            model: this.primaryProvider.getModel(),
            durationMs: Date.now() - startTime,
            fallbackUsed: false,
            attempts: primaryAttempts,
            status: "success",
          });

          return response;
        } catch (err: any) {
          primaryError = err;
          const errorType = this.classifyErrorType(err);

          // If quota or rate-limit, trigger cooldown and skip redundant immediate retries
          if (errorType === "RateLimitOrQuotaExhausted" || errorType === "ServerUnavailable5xx") {
            this.primaryProvider.setCooldown(this.config.providerCooldownSeconds);
            break;
          }

          if (attempt < this.config.maxRetriesPerProvider && this.isFallbackEligibleError(err)) {
            console.warn(
              `[AIProviderManager] Retrying ${this.primaryProvider.getName()} for task ${taskName} (attempt ${attempt + 1})...`
            );
            await new Promise((resolve) => setTimeout(resolve, 800 * Math.pow(1.5, attempt)));
          }
        }
      }
    } else {
      console.warn(
        `[AIProviderManager] Primary provider (${this.primaryProvider.getName()}) is temporarily in cooldown or missing credentials. Initiating fallback provider.`
      );
    }

    // Try fallback provider if enabled
    if (this.config.enableFallback) {
      if (this.fallbackProvider.isAvailable()) {
        let fallbackAttempts = 0;
        let fallbackError: any = null;

        for (let attempt = 0; attempt <= this.config.maxRetriesPerProvider; attempt++) {
          fallbackAttempts++;
          try {
            console.log(
              `[AIProviderManager] Activating fallback provider (${this.fallbackProvider.getName()} [${this.fallbackProvider.getModel()}]) for task: ${taskName}`
            );

            const response = await this.fallbackProvider.generateText(prompt, {
              ...options,
              timeoutMs,
              taskName: `${taskName} [${this.fallbackProvider.getName()}]`,
            });

            this.logMetric({
              task: taskName,
              provider: this.fallbackProvider.getName(),
              model: this.fallbackProvider.getModel(),
              durationMs: Date.now() - startTime,
              fallbackUsed: true,
              attempts: primaryAttempts + fallbackAttempts,
              status: "success",
            });

            return {
              ...response,
              fallbackUsed: true,
            };
          } catch (err: any) {
            fallbackError = err;
            if (this.classifyErrorType(err) === "RateLimitOrQuotaExhausted") {
              this.fallbackProvider.setCooldown(this.config.providerCooldownSeconds);
              break;
            }
          }
        }

        this.logMetric({
          task: taskName,
          provider: `${this.primaryProvider.getName()}+${this.fallbackProvider.getName()}`,
          model: `${this.primaryProvider.getModel()}/${this.fallbackProvider.getModel()}`,
          durationMs: Date.now() - startTime,
          fallbackUsed: true,
          attempts: primaryAttempts + fallbackAttempts,
          status: "failure",
          errorType: this.classifyErrorType(fallbackError || primaryError),
        });
      } else {
        console.warn(`[AIProviderManager] Fallback provider (${this.fallbackProvider.getName()}) is not available or configured.`);
      }
    }

    // Controlled error response without leaking keys or stack traces
    throw new Error("We couldn't complete the research right now. Please try again shortly.");
  }

  /**
   * Universal generateJSON method with schema validation and automated fallback
   */
  async generateJSON<T>(
    prompt: string,
    options: GenerateJSONOptions<T>
  ): Promise<{ data: T; response: NormalizedAIResponse }> {
    const startTime = Date.now();
    const taskName = options.taskName || "StructuredJSONGeneration";
    const timeoutMs = options.timeoutMs || this.config.providerTimeoutMs;

    let primaryAttempts = 0;
    let primaryError: any = null;

    if (this.primaryProvider.isAvailable()) {
      for (let attempt = 0; attempt <= this.config.maxRetriesPerProvider; attempt++) {
        primaryAttempts++;
        try {
          const result = await this.primaryProvider.generateJSON(prompt, {
            ...options,
            timeoutMs,
            taskName: `${taskName} [${this.primaryProvider.getName()}]`,
          });

          this.logMetric({
            task: taskName,
            provider: this.primaryProvider.getName(),
            model: this.primaryProvider.getModel(),
            durationMs: Date.now() - startTime,
            fallbackUsed: false,
            attempts: primaryAttempts,
            status: "success",
          });

          return result;
        } catch (err: any) {
          primaryError = err;
          const errorType = this.classifyErrorType(err);

          if (errorType === "RateLimitOrQuotaExhausted" || errorType === "ServerUnavailable5xx") {
            this.primaryProvider.setCooldown(this.config.providerCooldownSeconds);
            break;
          }

          if (attempt < this.config.maxRetriesPerProvider && this.isFallbackEligibleError(err)) {
            console.warn(
              `[AIProviderManager] Retrying JSON generation on ${this.primaryProvider.getName()} (${attempt + 1}/${this.config.maxRetriesPerProvider})...`
            );
            await new Promise((resolve) => setTimeout(resolve, 800 * Math.pow(1.5, attempt)));
          }
        }
      }
    }

    if (this.config.enableFallback) {
      if (this.fallbackProvider.isAvailable()) {
        let fallbackAttempts = 0;
        let fallbackError: any = null;

        for (let attempt = 0; attempt <= this.config.maxRetriesPerProvider; attempt++) {
          fallbackAttempts++;
          try {
            console.log(
              `[AIProviderManager] Activating fallback provider (${this.fallbackProvider.getName()} [${this.fallbackProvider.getModel()}]) for JSON task: ${taskName}`
            );

            const result = await this.fallbackProvider.generateJSON(prompt, {
              ...options,
              timeoutMs,
              taskName: `${taskName} [${this.fallbackProvider.getName()}]`,
            });

            this.logMetric({
              task: taskName,
              provider: this.fallbackProvider.getName(),
              model: this.fallbackProvider.getModel(),
              durationMs: Date.now() - startTime,
              fallbackUsed: true,
              attempts: primaryAttempts + fallbackAttempts,
              status: "success",
            });

            return {
              data: result.data,
              response: {
                ...result.response,
                fallbackUsed: true,
              },
            };
          } catch (err: any) {
            fallbackError = err;
            if (this.classifyErrorType(err) === "RateLimitOrQuotaExhausted") {
              this.fallbackProvider.setCooldown(this.config.providerCooldownSeconds);
              break;
            }
          }
        }

        this.logMetric({
          task: taskName,
          provider: `${this.primaryProvider.getName()}+${this.fallbackProvider.getName()}`,
          model: `${this.primaryProvider.getModel()}/${this.fallbackProvider.getModel()}`,
          durationMs: Date.now() - startTime,
          fallbackUsed: true,
          attempts: primaryAttempts + fallbackAttempts,
          status: "failure",
          errorType: this.classifyErrorType(fallbackError || primaryError),
        });
      }
    }

    throw new Error("We couldn't complete the research right now. Please try again shortly.");
  }
}

// Global Singleton Instance
let defaultManagerInstance: AIProviderManager | null = null;

export function getAIProviderManager(): AIProviderManager {
  if (!defaultManagerInstance) {
    defaultManagerInstance = new AIProviderManager();
  }
  return defaultManagerInstance;
}
