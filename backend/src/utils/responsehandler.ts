import { Response } from 'express';

export const sendSuccess = (res: Response, data: any, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const sendError = (res: Response, message: string, statusCode = 500, error?: any) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(error && { error })
  });
};

export const sendNotFound = (res: Response, message = 'Resource not found') => {
  res.status(404).json({
    success: false,
    message
  });
};

export const sendValidationError = (res: Response, errors: any) => {
  res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors
  });
};