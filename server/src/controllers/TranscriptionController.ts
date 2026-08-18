import { Request, Response } from "express";
import { TranscriptionService } from "../services/TranscriptionService.js";

const transcriptionService = new TranscriptionService();

export class TranscriptionController {
  async transcribe(req: Request, res: Response): Promise<void> {
    try {
      const { mediaBase64, mimeType, context } = req.body;

      if (!mediaBase64) {
        res.status(400).json({ error: "Media data (mediaBase64) is required." });
        return;
      }

      const result = await transcriptionService.transcribeMedia({
        mediaBase64,
        mimeType: mimeType || "audio/webm",
        context,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("[TranscriptionController] Error transcribing media:", error);
      res.status(500).json({
        error: "Failed to transcribe audio/video media.",
        message: error instanceof Error ? error.message : "Internal transcription error",
      });
    }
  }
}
