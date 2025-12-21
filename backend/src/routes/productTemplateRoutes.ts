import { Router } from "express";
import { productTemplateController } from "../controllers/productTemplateController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authenticate); // Todas as rotas requerem autenticação

router.get("/", productTemplateController.list);
router.get("/:id", productTemplateController.get);
router.post("/", productTemplateController.create);
router.put("/:id", productTemplateController.update);
router.delete("/:id", productTemplateController.delete);

export default router;
