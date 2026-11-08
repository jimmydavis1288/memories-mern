import { HttpError } from '../utils/httpError.js';

export const validate = (schemas) => (req, res, next) => {
  for (const [part, schema] of Object.entries(schemas)) {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.') || part}: ${issue.message}`)
        .join('; ');
      return next(new HttpError(400, message));
    }

    req[part] = result.data;
  }

  return next();
};
