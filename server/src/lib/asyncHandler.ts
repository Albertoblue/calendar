import { Request, Response, NextFunction } from 'express';

/**
 * Envuelve un handler async para que los errores lleguen al middleware de error
 * (Express 4 no captura rechazos de promesas automaticamente).
 */
export const asyncHandler =
  (fn: (req: any, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
