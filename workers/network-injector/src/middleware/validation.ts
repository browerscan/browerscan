/**
 * Validation Middleware
 * Hono middleware for Zod schema validation
 */

import { Context, MiddlewareHandler } from 'hono';
import { z } from 'zod';
import { formatValidationError } from '../schemas';

/**
 * Creates a Hono middleware that validates request body against a Zod schema
 */
export function validateBody<T extends z.ZodSchema>(
  schema: T
): MiddlewareHandler {
  return async (c: Context, next) => {
    try {
      const body = await c.req.json();
      const result = schema.safeParse(body);

      if (!result.success) {
        return c.json({
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          errors: formatValidationError(result.error.errors),
        }, 400);
      }

      // Store validated data in context for handler to use
      c.set('validatedBody', result.data);
      await next();
    } catch (error) {
      // JSON parsing error
      return c.json({
        status: 'error',
        code: 'INVALID_JSON',
        message: 'Invalid JSON in request body',
      }, 400);
    }
  };
}

/**
 * Creates a Hono middleware that validates query parameters against a Zod schema
 */
export function validateQuery<T extends z.ZodSchema>(
  schema: T
): MiddlewareHandler {
  return async (c: Context, next) => {
    const query = c.req.query();
    const result = schema.safeParse(query);

    if (!result.success) {
      return c.json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Query parameter validation failed',
        errors: formatValidationError(result.error.errors),
      }, 400);
    }

    c.set('validatedQuery', result.data);
    await next();
  };
}

/**
 * Type-safe getter for validated body from context
 */
export function getValidatedBody<T>(c: Context): T {
  return c.get('validatedBody') as T;
}

/**
 * Type-safe getter for validated query from context
 */
export function getValidatedQuery<T>(c: Context): T {
  return c.get('validatedQuery') as T;
}
