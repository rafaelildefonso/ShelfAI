import { Router } from "express";
import { authController } from "../controllers/authController.js";

import { authLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// Rotas públicas
router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/refresh-token", authLimiter, authController.refreshToken);

// Rotas protegidas
router.get("/me", authController.getProfile);
router.put("/update-password", authLimiter, authController.updatePassword);
router.put("/update-profile", authController.updateProfile);

// Rotas administrativas
router.get("/users", authController.getAllUsers);
router.patch("/users/:id/deactivate", authController.deactivateUser);
router.patch("/users/:id/activate", authController.activateUser);

export default router;
