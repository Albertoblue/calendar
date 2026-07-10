import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }
  try {
    const payload = verifyToken(header.slice(7));
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalido o expirado' });
  }
}
