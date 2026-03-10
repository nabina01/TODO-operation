import { Request, Response, NextFunction } from 'express';
import { sendError } from './responsehandler';

// Custom Error Classes
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class TodoNotFoundError extends AppError {
  constructor(message: string = 'Todo not found') {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500);
  }
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const errorHandler = (err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }
  
  sendError(res, err.message || 'Internal server error', 500);
};