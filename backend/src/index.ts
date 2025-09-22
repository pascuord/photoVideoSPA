import 'dotenv/config';
import express from 'express';
import cors, { CorsOptionsDelegate, CorsRequest } from 'cors';
import dotenv from 'dotenv';

import media from './routes/media';
import blog from './routes/blog';
import stats from './routes/stats';
import likes from './routes/likes';
import comments from './routes/comments';
import shares from './routes/shares';
import { requireUser } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// Orígenes explícitos (separados por coma) desde env
const allowedOrigins: string[] = (process.env.FRONTEND_ORIGINS ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// ¿Cookies/sesión cross-site?
const useCredentials = String(process.env.CORS_CREDENTIALS ?? 'false') === 'true';

// Permite cualquier subdominio *.vercel.app (previews incluidas)
const vercelHostRe = /\.vercel\.app$/;

const corsDelegate: CorsOptionsDelegate<CorsRequest> = (req, cb) => {
  // origin puede ser string | string[] | undefined
  const rawOrigin = (req.headers?.origin ?? '') as string | string[];
  const origin =
    Array.isArray(rawOrigin) ? (rawOrigin[0] ?? '') : (rawOrigin || '');

  let isAllowed = false;

  if (!origin) {
    // curl, SSR, health checks… sin cabecera Origin
    isAllowed = true;
  } else {
    try {
      const url = new URL(origin);
      isAllowed =
        allowedOrigins.includes(origin) || // lista blanca exacta (tal cual en env)
        vercelHostRe.test(url.hostname);   // *.vercel.app
    } catch {
      isAllowed = false;
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('[CORS]', { origin, isAllowed, allowedOrigins });
  }

  cb(null, {
    origin: isAllowed, // true => refleja el Origin permitido
    credentials: useCredentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
};

// ⬇️ CORS SIEMPRE ANTES DE LAS RUTAS
app.use(cors(corsDelegate));
// Responder preflights
//app.options('(.*)', cors(corsDelegate));

app.use(express.json());

// Health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now(), allowedOrigins, credentials: useCredentials });
});

// Rutas públicas
app.use('/api', media);
app.use('/api', blog);
app.use('/api', stats);
app.use('/api', comments);

// Rutas protegidas
app.use('/api', requireUser, likes);

// Shares (público; protégelo si lo necesitas)
app.use('/api', shares);

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  console.log('CORS orígenes permitidos (env):', allowedOrigins);
  console.log('CORS allow *.vercel.app:', true);
});
