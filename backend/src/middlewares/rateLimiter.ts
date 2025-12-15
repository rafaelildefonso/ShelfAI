import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";
import { config } from "../config/env.js";

// Rate limiter configuration for general API requests
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message:
      "Muitas requisições criadas a partir deste IP, por favor tente novamente após 15 minutos",
  },
});

// Rate limiter configuration for authentication requests
const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 login requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message:
      "Muitas tentativas de login a partir deste IP, por favor tente novamente após uma hora",
  },
});

// Conditional middleware that only applies rate limiting in production
export const apiLimiter = (req: Request, res: Response, next: NextFunction) => {
  if (config.NODE_ENV === "production") {
    return apiRateLimiter(req, res, next);
  }
  // Skip rate limiting in development/test
  next();
};

export const authLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (config.NODE_ENV === "production") {
    return authRateLimiter(req, res, next);
  }
  // Skip rate limiting in development/test
  next();
};
