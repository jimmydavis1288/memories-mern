import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import { protectCsrf } from './middleware/csrf.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { HttpError } from './utils/httpError.js';

const app = express();
const configuredOrigins = process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN;

const production = process.env.NODE_ENV === 'production';
const configuredOriginList = (configuredOrigins || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (production && configuredOriginList.length === 0) {
  throw new Error('CLIENT_ORIGINS must list the trusted frontend origins in production.');
}

const developmentOrigins = production ? [] : [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];
const allowedOrigins = new Set([...developmentOrigins, ...configuredOriginList]);
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);

if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0) {
  throw new Error('TRUST_PROXY_HOPS must be a non-negative integer.');
}

app.disable('x-powered-by');
if (trustProxyHops > 0) {
  app.set('trust proxy', trustProxyHops);
}
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new HttpError(403, 'This origin is not allowed.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  maxAge: 600,
}));
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: false, limit: '8mb' }));
app.use(cookieParser());
app.use(protectCsrf(allowedOrigins));

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
