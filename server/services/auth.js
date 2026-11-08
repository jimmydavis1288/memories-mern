import { prisma } from '../lib/prisma.js';
import { HttpError } from '../utils/httpError.js';
import { hashPassword, verifyPassword } from './passwords.js';

export const publicUser = ({ id, fullName, email, createdAt }) => ({
  id,
  fullName,
  email,
  createdAt,
});

export const registerUser = async ({ fullName, email, password }) => {
  const passwordHash = await hashPassword(password);

  try {
    return publicUser(await prisma.user.create({
      data: { fullName, email, passwordHash },
    }));
  } catch (error) {
    if (error.code === 'P2002') {
      throw new HttpError(409, 'An account with this email already exists.');
    }

    throw error;
  }
};

export const authenticateUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new HttpError(401, 'Email or password is incorrect.');
  }

  return publicUser(user);
};

export const getPublicUser = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });

  return user ? publicUser(user) : null;
};
