import express from 'express';
import rateLimit from 'express-rate-limit';

import { login, logout, register, restoreSession as restoreSessionController, session } from '../controllers/auth.js';
import { optionalAuthentication, requireAuthentication } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { emptyQuerySchema, loginSchema, registerSchema } from '../validators/auth.js';
import { emptyBodySchema } from '../validators/likes.js';
import { issueCsrfToken } from '../middleware/csrf.js';

const router = express.Router();
router.use(validate({ query: emptyQuerySchema }));

const authenticationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Try again in 15 minutes.' },
});

router.get('/csrf', issueCsrfToken);
router.post('/register', authenticationLimiter, validate({ body: registerSchema }), register);
router.post('/login', authenticationLimiter, validate({ body: loginSchema }), login);
router.get('/session', optionalAuthentication, restoreSessionController);
router.get('/me', optionalAuthentication, requireAuthentication, session);
router.post('/logout', optionalAuthentication, requireAuthentication, validate({ body: emptyBodySchema }), logout);

export default router;
