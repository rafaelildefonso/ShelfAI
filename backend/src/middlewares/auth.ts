import { Request, Response, NextFunction } from 'express';

export function auth(req: Request, res: Response, next: NextFunction) {
  // Durante desenvolvimento, aceitar qualquer requisição como autenticada
  // Para produção, implemente JWT ou OAuth real
  const authHeader = req.headers.authorization;

  if (process.env.NODE_ENV === 'production' && !authHeader) {
    return res.status(401).json({ error: { message: 'Token ausente' } });
  }

  // Simula usuário autenticado
  (req as any).user = { id: 'demo-user', userId: 'demo-user', role: 'admin' };
  next();
}
