import 'dotenv/config'; // o: import dotenv from 'dotenv'; dotenv.config();
import express from 'express';
import cors from 'cors';
import media from './routes/media';
import blog from './routes/blog';
import dotenv from 'dotenv';
import stats from './routes/stats';
import likes from './routes/likes';
import comments from './routes/comments';
import shares from './routes/shares';
import { requireUser } from './middleware/auth';

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// Parseo robusto de orígenes
const allowedOrigins: string[] = (process.env.FRONTEND_ORIGINS ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// Si usarás cookies/sesión entre front y back
const useCredentials = String(process.env.CORS_CREDENTIALS ?? 'false') === 'true';

app.use(cors({
  origin: (origin, callback) => {
    // Permite llamadas sin origin (curl, SSR) y las que estén en la lista
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origen no permitido por CORS: ${origin}`), false);
  },
  credentials: useCredentials,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.use(express.json());

// (opcional) ruta de salud
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now(), allowedOrigins, credentials: useCredentials });
});

app.use('/api', media);
app.use('/api', blog);
app.use('/api', stats);
app.use('/api', comments);

// Protegidos (usa requireUser directamente)
app.use('/api', requireUser, likes);

// Shares no requiere user (puedes proteger si quieres)
app.use('/api', shares);

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  console.log('CORS orígenes permitidos:', allowedOrigins);
});
