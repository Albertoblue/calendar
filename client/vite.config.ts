import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El proxy redirige /api al backend en dev, asi evitamos CORS y
// el cliente siempre llama a rutas relativas (/api/...).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
      // WebSocket de Socket.io (sincronizacion en tiempo real)
      '/socket.io': { target: 'http://localhost:4000', ws: true },
    },
  },
});
