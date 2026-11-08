import { z } from 'zod';

const password = z.string()
  .min(12, 'Password must be at least 12 characters.')
  .max(72, 'Password must be at most 72 characters.')
  .refine((value) => Buffer.byteLength(value, 'utf8') <= 72, 'Password must be at most 72 bytes.');

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters.').max(100),
  email: z.string().trim().email('Enter a valid email address.').max(254).transform((value) => value.toLowerCase()),
  password,
  confirmPassword: z.string(),
}).strict().refine((body) => body.password === body.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.').max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(1, 'Password is required.').max(72),
}).strict();

export const emptyQuerySchema = z.object({}).strict();
