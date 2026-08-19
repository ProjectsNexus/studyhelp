import { z } from "zod";

export class ResponseValidator {
  /**
   * Safely extract JSON text from potential markdown blocks, code fences, or surrounding text
   */
  static cleanJsonText(rawText: string): string {
    if (!rawText) return "{}";
    let text = rawText.trim();

    // Match code block ```json ... ``` or ``` ... ```
    const markdownRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
    const match = text.match(markdownRegex);
    if (match && match[1]) {
      text = match[1].trim();
    }

    // If text still starts/ends with other characters, look for the outer balanced brackets
    const firstBrace = text.indexOf("{");
    const firstBracket = text.indexOf("[");

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      const lastBrace = text.lastIndexOf("}");
      if (lastBrace !== -1 && lastBrace > firstBrace) {
        text = text.substring(firstBrace, lastBrace + 1);
      }
    } else if (firstBracket !== -1) {
      const lastBracket = text.lastIndexOf("]");
      if (lastBracket !== -1 && lastBracket > firstBracket) {
        text = text.substring(firstBracket, lastBracket + 1);
      }
    }

    return text;
  }

  /**
   * Parse JSON string and validate against a Zod schema with detailed error reporting
   */
  static parseAndValidate<T>(rawText: string, schema: z.ZodType<T>, taskName: string = "AI JSON Validation"): T {
    const cleaned = this.cleanJsonText(rawText);
    let parsed: any;

    try {
      parsed = JSON.parse(cleaned);
    } catch (parseError: any) {
      throw new Error(
        `[${taskName}] Malformed JSON response from AI provider: ${parseError?.message || "Invalid JSON format"}`
      );
    }

    const validationResult = schema.safeParse(parsed);
    if (!validationResult.success) {
      const issueSummary = validationResult.error.issues
        .slice(0, 3)
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      throw new Error(`[${taskName}] Schema validation failed: ${issueSummary}`);
    }

    return validationResult.data;
  }
}
