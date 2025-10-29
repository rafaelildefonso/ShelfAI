import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

import prisma from '../prisma/client.js';


export const userController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: { products: true },
      });
      res.json(users);
    } catch (err) {
      next(err);
    }
  },
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id },
        include: { products: true },
      });
      if (!user) return res.status(404).json({ error: { message: 'Usuário não encontrado' } });
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const user = await prisma.user.create({ data });
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = await prisma.user.update({ where: { id }, data });
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.user.delete({ where: { id } });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
};
