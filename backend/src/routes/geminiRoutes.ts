import { Router } from "express";
import { GeminiController } from "../controllers/GeminiController.js";

const router = Router();
const geminiController = new GeminiController();

router.post("/analyze", geminiController.analyzeProduct);

export default router;
