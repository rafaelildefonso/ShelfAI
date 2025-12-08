import { Request, Response } from "express";
import { GeminiService } from "../services/GeminiService.js";

const geminiService = new GeminiService();

export class GeminiController {
  async analyzeProduct(req: Request, res: Response) {
    try {
      const { imageBase64, nameInput, additionalText } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Image is required" });
      }

      const analysis = await geminiService.analyzeProduct({
        imageBase64,
        nameInput,
        additionalText,
      });

      return res.json(analysis);
    } catch (error) {
      console.error("Gemini Controller Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
