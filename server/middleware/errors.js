import { ZodError } from 'zod';
import { HttpError } from '../utils/httpError.js';

export const notFound = (req, res, next) => {
  next(new HttpError(404, 'The requested resource was not found.'));
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: error.issues.map((issue) => `${issue.path.join('.') || 'request'}: ${issue.message}`).join('; '),
    });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({ message: 'The requested resource was not found.' });
  }

  if (error.status === 413) {
    return res.status(413).json({ message: 'Request body is too large.' });
  }

  if (error.status === 400 && !(error instanceof HttpError)) {
    return res.status(400).json({ message: 'Request body is invalid.' });
  }

  const status = error instanceof HttpError ? error.status : 500;
  const message = error instanceof HttpError
    ? error.message
    : 'An unexpected error occurred. Please try again.';

  if (status >= 500) {
    console.error('API request failed:', error.name || 'Error', error.code || 'NO_CODE');
  }

  return res.status(status).json({ message });
};
