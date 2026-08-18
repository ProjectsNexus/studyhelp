import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { UniversityController } from "./server/src/controllers/UniversityController.js";
import { ResearchController } from "./server/src/controllers/ResearchController.js";
import { TranscriptionController } from "./server/src/controllers/TranscriptionController.js";

dotenv.config();

const universityController = new UniversityController();
const researchController = new ResearchController();
const transcriptionController = new TranscriptionController();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "AI Academic Research Platform",
    });
  });

  // University Verification & Extraction
  app.post("/api/university/verify", (req, res) => universityController.verifyUniversity(req, res));

  // Speech & Multimodal Audio/Video Transcription
  app.post("/api/transcribe", (req, res) => transcriptionController.transcribe(req, res));

  // Research Pipeline execution
  app.post("/api/research", (req, res) => researchController.runResearch(req, res));
  app.post("/api/research/stream", (req, res) => researchController.runResearchStream(req, res));

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Academic Research Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[Server] Fatal bootstrap error:", err);
  process.exit(1);
});
