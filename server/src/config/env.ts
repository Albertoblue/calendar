import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-cambia-esto',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  // APIs externas (opcionales): si faltan, el apartado Ideas funciona en modo manual.
  tmdbKey: process.env.TMDB_API_KEY ?? '',
  googlePlacesKey: process.env.GOOGLE_PLACES_KEY ?? '',
  // Anthropic (Claude): para el sugeridor de planes con IA. Si falta, se desactiva.
  anthropicKey: process.env.ANTHROPIC_API_KEY ?? '',
};

if (!env.mongoUri) {
  console.warn('[config] MONGODB_URI no esta definida. Copia server/.env.example a server/.env y completa tu cadena de Atlas.');
}
