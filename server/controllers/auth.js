import { authenticateUser, getPublicUser, registerUser } from '../services/auth.js';
import { createSessionToken, SESSION_MAX_AGE_SECONDS } from '../utils/jwt.js';

const SESSION_COOKIE = 'memories_session';
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
});

const setSessionCookie = async (res, user) => {
  const token = await createSessionToken(user.id);
  res.cookie(SESSION_COOKIE, token, {
    ...cookieOptions(),
    maxAge: SESSION_MAX_AGE_SECONDS * 1000,
  });
};

export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    await setSessionCookie(res, user);
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await authenticateUser(req.body);
    await setSessionCookie(res, user);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const session = async (req, res, next) => {
  try {
    const user = await getPublicUser(req.user.id);
    res.set('Cache-Control', 'no-store');
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const restoreSession = (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(200).json({ user: req.user || null });
};

export const logout = (req, res) => {
  res.clearCookie(SESSION_COOKIE, cookieOptions());
  res.clearCookie('memories_csrf', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
  res.status(200).json({ message: 'Signed out successfully.' });
};
