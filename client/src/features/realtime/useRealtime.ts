import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';

// Cada recurso que cambia en el servidor -> queries de React Query a refrescar.
const RESOURCE_KEYS: Record<string, unknown[][]> = {
  activities: [['activities'], ['upcoming'], ['memories']],
  wishlist: [['wishlist']],
  ideas: [['ideas']],
  memories: [['memories']],
  space: [['space']],
  countdowns: [['countdowns']],
  gifts: [['gifts']],
};

/**
 * Conecta con Socket.io y, cuando el otro miembro del espacio cambia algo, invalida
 * las queries afectadas para que la UI se actualice al instante (sin recargar).
 */
export function useRealtime(enabled: boolean): void {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io({ auth: { token } });

    socket.on('change', (payload: { resource?: string }) => {
      const keys = RESOURCE_KEYS[payload.resource ?? ''] ?? [];
      keys.forEach((queryKey) => qc.invalidateQueries({ queryKey }));
    });

    return () => {
      socket.disconnect();
    };
  }, [enabled, qc]);
}
