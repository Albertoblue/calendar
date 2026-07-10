import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Datos invalidos', details: err.flatten() });
    return;
  }
  // Error de clave duplicada de Mongo (p. ej. email repetido).
  if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    res.status(409).json({ error: 'Ese registro ya existe' });
    return;
  }
  console.error('[error]', err);
  res.status(500).json({ error: 'Error interno del servidor' });
}
