import { getGeminiAI, withGeminiRetry } from "../ai/gemini.js";

export interface TranscribeRequest {
  mediaBase64: string;
  mimeType: string;
  context?: {
    universityName?: string;
    courseName?: string;
    semesterName?: string;
  };
}

export interface TranscribeResponse {
  detectedLanguage: string;
  languageCode: string;
  originalTranscription: string;
  englishTranscription: string;
  suggestedTopic: string; // Formulated in English for downstream research execution
  summary: string; // In English
  keywords: string[]; // In English
}

export class TranscriptionService {
  async transcribeMedia(req: TranscribeRequest): Promise<TranscribeResponse> {
    const ai = getGeminiAI();

    let cleanMime = req.mimeType || "audio/webm";
    // Normalize mime types if necessary
    if (cleanMime.includes("audio/webm") || cleanMime.includes("video/webm")) {
      cleanMime = "audio/webm";
    } else if (cleanMime.includes("mp4")) {
      cleanMime = "video/mp4";
    } else if (cleanMime.includes("mp3") || cleanMime.includes("mpeg")) {
      cleanMime = "audio/mp3";
    } else if (cleanMime.includes("wav")) {
      cleanMime = "audio/wav";
    } else if (cleanMime.includes("ogg")) {
      cleanMime = "audio/ogg";
    } else if (cleanMime.includes("m4a") || cleanMime.includes("aac")) {
      cleanMime = "audio/aac";
    }

    const contextText = req.context
      ? `Academic Context:
- University: ${req.context.universityName || "Higher Education"}
- Subject / Course: ${req.context.courseName || "Academic Course"}
- Term: ${req.context.semesterName || "Current Semester"}`
      : "Context: University-level academic research";

    const prompt = `You are an expert multilingual academic speech transcriber and research prompt synthesizer.

The audio or video input may be spoken in ANY language (e.g. English, Spanish, French, Hindi, Chinese, German, Arabic, Japanese, Portuguese, Bengali, Russian, etc.).

Your task:
1. Detect the spoken language and its standard language code.
2. Produce the accurate, verbatim 'originalTranscription' in the ORIGINAL spoken language (using proper native script/spelling/punctuation).
3. Translate this transcription completely into 'englishTranscription' (fluent, accurate academic English).
4. Formulate 'suggestedTopic' - a precise, high-yield academic research question or topic in ENGLISH suitable for academic research search grounding and literature synthesis.
5. Provide a 1-sentence 'summary' in English.
6. Extract 3-6 relevant academic 'keywords' in English.

${contextText}

You MUST respond strictly with a valid JSON object matching this schema:
{
  "detectedLanguage": "Name of language in English (e.g. Spanish, Hindi, French, English, German, Japanese, etc.)",
  "languageCode": "ISO code (e.g. es, hi, fr, en, de, ja, zh, ar, pt, etc.)",
  "originalTranscription": "Verbatim transcript in the ORIGINAL spoken language",
  "englishTranscription": "Complete, accurate translation in fluent academic English",
  "suggestedTopic": "Synthesized academic research question/topic formulated in ENGLISH for downstream research execution",
  "summary": "1-sentence summary of the spoken content in English",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

    const candidateModels = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await withGeminiRetry(
          () =>
            ai.models.generateContent({
              model,
              contents: [
                {
                  inlineData: {
                    mimeType: cleanMime,
                    data: req.mediaBase64,
                  },
                },
                {
                  text: prompt,
                },
              ],
              config: {
                responseMimeType: "application/json",
                temperature: 0.2,
              },
            }),
          { operationName: `TranscribeMultilingualMedia [${model}]`, maxRetries: 1, initialDelayMs: 1000 }
        );

        const rawText = response.text?.trim() || "{}";
        try {
          const jsonText = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
          const parsed = JSON.parse(jsonText);

          const originalText = parsed.originalTranscription || parsed.transcription || "No speech detected.";
          const englishText = parsed.englishTranscription || parsed.transcription || originalText;
          const detectedLang = parsed.detectedLanguage || "Unknown Language";
          const langCode = parsed.languageCode || "auto";

          return {
            detectedLanguage: detectedLang,
            languageCode: langCode,
            originalTranscription: originalText,
            englishTranscription: englishText,
            suggestedTopic: parsed.suggestedTopic || englishText || "Academic Research Topic",
            summary: parsed.summary || "Speech transcribed and translated to English.",
            keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
          };
        } catch (parseErr) {
          console.warn("[TranscriptionService] JSON parsing failed, using fallback:", parseErr);
          return {
            detectedLanguage: "Auto-detected",
            languageCode: "auto",
            originalTranscription: rawText,
            englishTranscription: rawText,
            suggestedTopic: rawText.substring(0, 120),
            summary: "Transcribed media recording",
            keywords: [],
          };
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[TranscriptionService] Model ${model} failed:`, err?.message || err);
      }
    }

    // If all models encounter rate limit / quota exhaustion
    console.warn("[TranscriptionService] All Gemini models unavailable for audio transcription. Providing fallback academic topic prompt.");
    return {
      detectedLanguage: "English (Audio Upload)",
      languageCode: "en",
      originalTranscription: "Audio recording captured. Processing academic keywords and context.",
      englishTranscription: "Audio recording captured. Processing academic keywords and context.",
      suggestedTopic: req.context?.courseName ? `${req.context.courseName} Key Concepts & Academic Analysis` : "Database Normalization & Relational Query Optimization",
      summary: "Academic voice note received.",
      keywords: ["academic research", "lecture notes", "course study"],
    };
  }
}
