import { Request, Response } from "express";
import { UniversityVerificationService } from "../services/UniversityVerificationService.js";

const verificationService = new UniversityVerificationService();

export class UniversityController {
  async verifyUniversity(req: Request, res: Response): Promise<void> {
    try {
      const { name, website, country, city, degree, program, department } = req.body;

      if (!name || !country || !degree || !program) {
        res.status(400).json({
          error: "Missing required fields: name, country, degree, and program are required.",
        });
        return;
      }

      const result = await verificationService.verifyUniversity({
        name,
        website,
        country,
        city,
        degree,
        program,
        department: department || "General Studies",
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("[UniversityController] verifyUniversity error:", error);
      res.status(500).json({
        error: "Failed to verify university profile.",
        message: error instanceof Error ? error.message : "Internal error",
      });
    }
  }
}
