import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { verifyToken } from './jwt';
import { User } from '../models/User';

let io: Server | null = null;

/**
 * Arranca Socket.io sobre el servidor HTTP. Cada cliente se autentica con su JWT
 * y se une a la sala de su espacio, para recibir avisos de cambios en tiempo real.
 */
export function initRealtime(httpServer: HttpServer, clientOrigin: string): void {
  io = new Server(httpServer, { cors: { origin: clientOrigin } });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error('No autenticado'));
      const { userId } = verifyToken(token);
      const user = await User.findById(userId).select('spaceId');
      if (user?.spaceId) {
        socket.join(`space:${user.spaceId.toString()}`);
      }
      next();
    } catch {
      next(new Error('Token invalido'));
    }
  });

  console.log('[realtime] Socket.io listo');
}

export type ChangeResource =
  | 'activities'
  | 'wishlist'
  | 'ideas'
  | 'space'
  | 'memories'
  | 'countdowns'
  | 'gifts';

/** Avisa a los miembros del espacio de que un recurso cambio (para que refresquen). */
export function emitChange(
  spaceId: { toString(): string } | string,
  resource: ChangeResource
): void {
  if (!io) return;
  const id = typeof spaceId === 'string' ? spaceId : spaceId.toString();
  io.to(`space:${id}`).emit('change', { resource });
}
