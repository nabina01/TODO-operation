import { Request, Response, NextFunction } from 'express';
import { sendError } from './responsehandler';

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  sendError(res, err.message || 'Internal server error', err.status || 500);
};