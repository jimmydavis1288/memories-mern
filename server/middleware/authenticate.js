import { getPublicUser } from '../services/auth.js';
import { HttpError } from '../utils/httpError.js';
import { verifySessionToken } from '../utils/jwt.js';

export const optionalAuthentication = async (req, res, next) => {
  const token = req.cookies.memories_session;

  if (!token) {
    return next();
  }

  let userId;
  try {
    userId = await verifySessionToken(token);
  } catch {
    res.clearCookie('memories_session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
    return next();
  }

  try {
    const user = await getPublicUser(userId);
    if (!user) {
      res.clearCookie('memories_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
      });
      return next();
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireAuthentication = (req, res, next) => {
  if (!req.user) {
    return next(new HttpError(401, 'Sign in to continue.'));
  }

  return next();
};
