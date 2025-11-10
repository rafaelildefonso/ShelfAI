import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role?: string;
        email: string;
      };
    }
  }
}

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Token error' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: 'Token mal formatado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role?: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true, email: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    req.user = { 
      userId: decoded.userId,
      email: user.email,
      role: user.role
    };
    
    return next();
  } catch (err) {
    console.error('Erro na autenticação admin:', err);
    return res.status(401).json({ error: 'Token inválido' });
  }
};
