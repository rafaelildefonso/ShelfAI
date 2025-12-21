import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError.js";
import prisma from "../prisma/client.js";

export const productTemplateController = {
  // Listar templates de produto
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const templates = await prisma.productTemplate.findMany({
        orderBy: [{ category: "asc" }, { name: "asc" }],
      });

      res.json({ data: templates });
    } catch (err) {
      next(err);
    }
  },

  // Obter template por ID
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const template = await prisma.productTemplate.findUnique({
        where: { id },
      });

      if (!template) {
        throw new AppError("Template de produto não encontrado", 404);
      }

      res.json({ data: template });
    } catch (err) {
      next(err);
    }
  },

  // Criar novo template
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      const { name, category, description, icon, fields } = req.body;

      if (!name || !category || !fields) {
        throw new AppError("Nome, categoria e campos são obrigatórios", 400);
      }

      const template = await prisma.productTemplate.create({
        data: {
          name,
          category,
          description,
          icon,
          fields,
          userId,
        },
      });

      res.status(201).json({ data: template });
    } catch (err) {
      next(err);
    }
  },

  // Atualizar template
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, category, description, icon, fields } = req.body;

      const existingTemplate = await prisma.productTemplate.findUnique({
        where: { id },
      });

      if (!existingTemplate) {
        throw new AppError("Template de produto não encontrado", 404);
      }

      const template = await prisma.productTemplate.update({
        where: { id },
        data: {
          name,
          category,
          description,
          icon,
          fields,
        },
      });

      res.json({ data: template });
    } catch (err) {
      next(err);
    }
  },

  // Excluir template
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const template = await prisma.productTemplate.findUnique({
        where: { id },
      });

      if (!template) {
        throw new AppError("Template de produto não encontrado", 404);
      }

      await prisma.productTemplate.delete({
        where: { id },
      });

      res.json({ message: "Template de produto excluído com sucesso" });
    } catch (err) {
      next(err);
    }
  },
};
