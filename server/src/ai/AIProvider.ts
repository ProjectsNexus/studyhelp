import { z } from "zod";

export interface NormalizedAIResponse {
  text: string;
  provider: string;
  model: string;
  fallbackUsed: boolean;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
}

export interface GenerateTextOptions {
  systemInstruction?: string;
  temperature?: number;
  timeoutMs?: number;
  taskName?: string;
  tools?: any[];
  inlineMedia?: {
    mimeType: string;
    data: string;
  };
}

export interface GenerateJSONOptions<T> {
  systemInstruction?: string;
  schema: z.ZodType<T>;
  temperature?: number;
  timeoutMs?: number;
  taskName?: string;
  tools?: any[];
  inlineMedia?: {
    mimeType: string;
    data: string;
  };
  jsonSchemaName?: string;
}

export interface AIProvider {
  /**
   * Identifies the provider name (e.g. 'gemini', 'openrouter')
   */
  getName(): string;

  /**
   * Identifies the active model configured for this provider
   */
  getModel(): string;

  /**
   * Returns true if the provider has valid credentials and is not currently in rate-limit cooldown
   */
  isAvailable(): boolean;

  /**
   * Temporarily mark the provider as in cooldown after a rate-limit/quota or 5xx outage
   */
  setCooldown(seconds: number): void;

  /**
   * Generate raw text response
   */
  generateText(prompt: string, options?: GenerateTextOptions): Promise<NormalizedAIResponse>;

  /**
   * Generate structured JSON validated against a Zod schema
   */
  generateJSON<T>(
    prompt: string,
    options: GenerateJSONOptions<T>
  ): Promise<{ data: T; response: NormalizedAIResponse }>;
}
