import axios from 'axios';

export const api = axios.create({ baseURL: '/api' });

// Adjunta el token JWT (si existe) en cada peticion.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Extrae un mensaje de error legible desde una respuesta de axios. */
export function apiError(err: unknown, fallback = 'Ocurrio un error'): string {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { error?: string })?.error ?? fallback;
  }
  return fallback;
}
