import type { Response } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export function notFound(message = "Resource not found"): HttpError {
  return new HttpError(404, "NOT_FOUND", message);
}

export function validationError(message = "Invalid request body", details?: unknown): HttpError {
  return new HttpError(400, "VALIDATION_ERROR", message, details);
}

export function toHttpError(error: unknown): HttpError {
  if (error instanceof HttpError) {
    return error;
  }

  if (error instanceof ZodError) {
    return validationError("Invalid request body", error.issues);
  }

  return new HttpError(500, "INTERNAL_ERROR", "Internal server error");
}

export function sendError(response: Response, error: unknown): void {
  const httpError = toHttpError(error);

  response.status(httpError.status).json({
    error: {
      code: httpError.code,
      message: httpError.message,
      details: httpError.details ?? [],
    },
  });
}

