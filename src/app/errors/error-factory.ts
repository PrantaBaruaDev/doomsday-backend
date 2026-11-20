import { AppError } from './app-error';

export const ErrorFactory = {
  validation: (details: unknown, message = 'Invalid input') =>
    new AppError(400, 'VALIDATION_ERROR', message, details),

  notFound: (what: string) =>
    new AppError(404, 'NOT_FOUND', `${what} not found`),

  conflict: (message: string, code = 'CONFLICT') =>
    new AppError(409, code, message),

  circularDependency: () =>
    new AppError(
      409,
      'CIRCULAR_DEPENDENCY',
      'Prerequisite graph would contain a cycle',
    ),

  internal: (message = 'Internal server error') =>
    new AppError(500, 'INTERNAL_ERROR', message),
};