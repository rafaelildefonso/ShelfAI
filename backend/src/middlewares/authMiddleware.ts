import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService';
import { AppError } from '../utils/appError';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role?: string;
      };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token de autenticação não fornecido', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError('Token inválido ou expirado', 401));
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Não autorizado', 403);
    }

    // Check if user has a role and if it's included in the allowed roles
    if (!req.user.role || !roles.includes(req.user.role)) {
      throw new AppError('Acesso negado. Permissão insuficiente.', 403);
    }

    next();
  };
};