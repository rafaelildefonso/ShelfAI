import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '@prisma/client';
import { config } from '../config/env';

export interface JwtPayload {
  userId: string;
  email: string;
}

export const generateToken = (user: User): string => {
  const payload = {
    userId: user.id,
    email: user.email
  } as const;

  // Ensure expiresIn is a valid string in the format expected by jsonwebtoken
  const expiresIn = config.JWT_EXPIRES_IN || '1d';
  
  // Use type assertion to bypass TypeScript's type checking for the options
  return jwt.sign(
    payload as object, 
    config.JWT_SECRET, 
    { expiresIn } as SignOptions
  );
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.JWT_SECRET) as unknown as JwtPayload;
};