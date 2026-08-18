import { Request, Response } from "express";
import { ResearchService, ResearchPipelineInput } from "../services/ResearchService.js";

const researchService = new ResearchService();

export class ResearchController {
  async runResearch(req: Request, res: Response): Promise<void> {
    try {
      const {
        requestId,
        userId,
        universityProfile,
        semesterProfile,
        subjectProfile,
        topic,
        researchType,
        researchDepth,
        additionalInstructions,
        forceFresh,
      } = req.body;

      if (!topic || !topic.trim()) {
        res.status(400).json({ error: "Topic is required." });
        return;
      }

      const input: ResearchPipelineInput = {
        requestId,
        userId: userId || "anonymous-student",
        universityProfile,
        semesterProfile,
        subjectProfile,
        topic: topic.trim(),
        researchType: researchType || "detailed_research",
        researchDepth: researchDepth || "standard",
        additionalInstructions,
        forceFresh: !!forceFresh,
      };

      const result = await researchService.runResearchPipeline(input);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("[ResearchController] runResearch error:", error);
      res.status(500).json({
        error: "Failed to execute academic research pipeline.",
        message: error instanceof Error ? error.message : "Internal error",
      });
    }
  }

  async runResearchStream(req: Request, res: Response): Promise<void> {
    // Enable Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const sendEvent = (event: string, data: any) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
      const {
        requestId,
        userId,
        universityProfile,
        semesterProfile,
        subjectProfile,
        topic,
        researchType,
        researchDepth,
        additionalInstructions,
        forceFresh,
      } = req.body;

      if (!topic || !topic.trim()) {
        sendEvent("error", { message: "Topic is required" });
        res.end();
        return;
      }

      const input: ResearchPipelineInput = {
        requestId,
        userId: userId || "anonymous-student",
        universityProfile,
        semesterProfile,
        subjectProfile,
        topic: topic.trim(),
        researchType: researchType || "detailed_research",
        researchDepth: researchDepth || "standard",
        additionalInstructions,
        forceFresh: !!forceFresh,
      };

      const result = await researchService.runResearchPipeline(input, (update) => {
        sendEvent("progress", update);
      });

      sendEvent("complete", result);
      res.end();
    } catch (error) {
      console.error("[ResearchController] runResearchStream error:", error);
      sendEvent("error", {
        message: error instanceof Error ? error.message : "Internal pipeline failure",
      });
      res.end();
    }
  }
}
