import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { HttpError } from '../utils/httpError.js';

export const CSRF_COOKIE = 'memories_csrf';

const signToken = (token) => createHmac('sha256', process.env.JWT_SECRET)
  .update(token)
  .digest('hex');

export const issueCsrfToken = (req, res) => {
  const nonce = randomBytes(32).toString('hex');
  const token = `${nonce}.${signToken(nonce)}`;
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
  res.set('Cache-Control', 'no-store');
  res.status(200).json({ csrfToken: token });
};

export const protectCsrf = (allowedOrigins) => (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const origin = req.get('origin');
  const cookieToken = req.cookies[CSRF_COOKIE];
  const headerToken = req.get('x-csrf-token');
  const [nonce, signature, extra] = (cookieToken || '').split('.');
  const expectedSignature = nonce ? signToken(nonce) : '';
  const cookieBytes = Buffer.from(cookieToken || '');
  const headerBytes = Buffer.from(headerToken || '');
  const tokensMatch = cookieBytes.length === headerBytes.length
    && timingSafeEqual(cookieBytes, headerBytes);

  if (
    (origin && !allowedOrigins.has(origin))
    || !cookieToken
    || !headerToken
    || !tokensMatch
    || !nonce
    || !signature
    || extra
    || signature.length !== expectedSignature.length
    || !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return next(new HttpError(403, 'Request verification failed. Refresh the page and try again.'));
  }

  return next();
};
