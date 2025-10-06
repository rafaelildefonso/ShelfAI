export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}
