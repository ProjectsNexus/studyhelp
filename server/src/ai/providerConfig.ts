export interface AIProviderConfig {
  geminiApiKey?: string;
  geminiModel: string;
  openRouterApiKey?: string;
  openRouterModel: string;
  primaryProvider: "gemini" | "openrouter";
  enableFallback: boolean;
  maxRetriesPerProvider: number;
  providerTimeoutMs: number;
  providerCooldownSeconds: number;
}

export function getAIProviderConfig(): AIProviderConfig {
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
  const geminiModel = process.env.GEMINI_MODEL?.trim() || "gemini-3.7-flash";

  const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
  const openRouterModel = process.env.OPENROUTER_MODEL?.trim() || "meta-llama/llama-3.3-70b-instruct:free";

  const rawPrimary = (process.env.AI_PRIMARY_PROVIDER || "gemini").toLowerCase().trim();
  const primaryProvider: "gemini" | "openrouter" = rawPrimary === "openrouter" ? "openrouter" : "gemini";

  const enableFallback = process.env.AI_ENABLE_FALLBACK !== "false";

  const maxRetriesPerProvider = Math.max(
    0,
    Math.min(3, parseInt(process.env.AI_MAX_RETRIES_PER_PROVIDER || "1", 10) || 1)
  );

  const providerTimeoutMs = Math.max(
    5000,
    Math.min(120000, parseInt(process.env.AI_PROVIDER_TIMEOUT_MS || "30000", 10) || 30000)
  );

  const providerCooldownSeconds = Math.max(
    10,
    Math.min(600, parseInt(process.env.AI_PROVIDER_COOLDOWN_SECONDS || "60", 10) || 60)
  );

  return {
    geminiApiKey,
    geminiModel,
    openRouterApiKey,
    openRouterModel,
    primaryProvider,
    enableFallback,
    maxRetriesPerProvider,
    providerTimeoutMs,
    providerCooldownSeconds,
  };
}
