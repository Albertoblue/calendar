import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { env } from './config/env';
import { connectDB } from './config/db';
import { initRealtime } from './lib/realtime';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/auth';
import spaceRoutes from './routes/spaces';
import categoryRoutes from './routes/categories';
import activityRoutes from './routes/activities';
import wishlistRoutes from './routes/wishlist';
import ideaRoutes from './routes/ideas';
import countdownRoutes from './routes/countdowns';
import suggestRoutes from './routes/suggest';
import statsRoutes from './routes/stats';
import giftRoutes from './routes/gifts';

const app = express();

app.use(cors({ origin: env.clientOrigin }));
// Limite alto: las fotos de los recuerdos viajan como data URIs dentro del JSON.
app.use(express.json({ limit: '15mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/countdowns', countdownRoutes);
app.use('/api/suggest', suggestRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/gifts', giftRoutes);

// En produccion el mismo servidor sirve el frontend buildeado (client/dist),
// asi todo vive en un unico dominio (sin CORS ni proxy). Si no existe el build
// (modo dev), este bloque se omite y el cliente corre en Vite (5173).
const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // Fallback SPA: cualquier ruta que no sea /api devuelve index.html
  // para que react-router maneje el enrutado en el cliente.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(errorHandler);

const server = http.createServer(app);

connectDB()
  .then(() => {
    initRealtime(server, env.clientOrigin);
    server.listen(env.port, () => {
      console.log(`[server] Escuchando en http://localhost:${env.port}`);
    });
  })
  .catch((err) => {
    console.error('[server] No se pudo conectar a MongoDB Atlas:', err.message);
    process.exit(1);
  });
