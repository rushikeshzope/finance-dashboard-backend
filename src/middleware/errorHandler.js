import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    const details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return res.status(422).json({ success: false, message: 'Validation failed', details });
  }

  // Catch malformed JSON errors from body-parser
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Malformed JSON payload' });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2025: Record to update not found.
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    // P2002: Unique constraint failed.
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Conflict: identifier already exists' });
    }
  }

  // Handle explicitly thrown service errors with custom status codes
  if (err.statusCode && err.message) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  // Fallback generic error
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
};
