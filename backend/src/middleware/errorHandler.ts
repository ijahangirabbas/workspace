import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next,
) => {
  if (error instanceof ZodError) {
    response
      .status(400)
      .json({ message: "Validation failed", issues: error.flatten() });
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (error && typeof error === "object" && "name" in error && error.name === "CastError") {
    response.status(400).json({ message: "Invalid resource identifier format" });
    return;
  }

  console.error(error);
  response.status(500).json({ message: "Unexpected server error" });
};

