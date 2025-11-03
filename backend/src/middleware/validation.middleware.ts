/**
 * Request validation middleware
 * 
 * Validates request bodies, params, and queries using Zod schemas
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './error.middleware';

/**
 * Validation middleware factory
 * Creates middleware to validate request data against a Zod schema
 */
export function validate(schema: {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate body
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      // Validate params
      if (schema.params) {
        const validatedParams = await schema.params.parseAsync(req.params);
        req.params = validatedParams as typeof req.params;
      }

      // Validate query
      if (schema.query) {
        const validatedQuery = await schema.query.parseAsync(req.query);
        req.query = validatedQuery as typeof req.query;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        throw new AppError(
          `Validation failed: ${errorMessages.map((e) => e.message).join(', ')}`,
          400
        );
      }

      throw error;
    }
  };
}

/**
 * Validate only request body
 */
export function validateBody<T extends ZodSchema>(schema: T) {
  return validate({ body: schema });
}

/**
 * Validate only request params
 */
export function validateParams<T extends ZodSchema>(schema: T) {
  return validate({ params: schema });
}

/**
 * Validate only request query
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
  return validate({ query: schema });
}

