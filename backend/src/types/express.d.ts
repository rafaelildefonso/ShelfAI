// src/types/express.d.ts
import { JwtPayload } from '../services/authService.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}