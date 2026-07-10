import { useSyncExternalStore } from 'react';

const MOBILE_QUERY = '(max-width: 768px)';

function subscribe(callback: () => void): () => void {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

/** Devuelve true cuando el viewport es de movil (<= 768px). Reactivo a cambios de tamano. */
export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  );
}
