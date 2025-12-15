import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { AppError } from "../utils/appError.js";

export const errorHandler = (
  err: Error | AppError | ZodError | PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);

  // Handle AppError
  if (err instanceof AppError) {
    const errorResponse: {
      status: string;
      message: string;
      details?: any;
      code?: string;
    } = {
      status: "error",
      message: err.message,
    };

    if (err.details) {
      errorResponse.details = err.details;
    }

    if ("code" in err && err.code) {
      errorResponse.code = err.code;
    }

    return res.status(err.statusCode).json(errorResponse);
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "error",
      message: "Erro de validação",
      details: err.issues,
    });
  }

  // Handle Prisma Errors
  if (err instanceof PrismaClientKnownRequestError) {
    return res.status(400).json({
      status: "error",
      message: "Erro no banco de dados",
      code: err.code,
      meta: err.meta,
    });
  }

  // Handle JWT Errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      message: "Token inválido ou expirado",
      code: "UNAUTHORIZED",
    });
  }

  // Handle other unhandled errors
  console.error("Unhandled error:", err);

  return res.status(500).json({
    status: "error",
    message: "Erro interno do servidor",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};
