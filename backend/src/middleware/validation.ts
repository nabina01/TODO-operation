import { Request, Response, NextFunction } from 'express';

interface ValidationError {
  field: string;
  message: string;
}

const sendValidationError = (res: Response, errors: ValidationError[]): void => {
  res.status(400).json({ success: false, message: 'Validation failed', errors });
};

export const validateCreateTodo = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = [];
  const { title, description, completed } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push({ field: 'title', message: 'Title is required' });
  }

  if (description !== undefined && typeof description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a string' });
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    errors.push({ field: 'completed', message: 'Completed must be a boolean' });
  }

  if (errors.length > 0) {
    sendValidationError(res, errors);
    return;
  }

  next();
};

export const validateUpdateTodo = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = [];
  const { title, description, completed } = req.body;

  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    errors.push({ field: 'title', message: 'Title must be a non-empty string' });
  }

  if (description !== undefined && typeof description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a string' });
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    errors.push({ field: 'completed', message: 'Completed must be a boolean' });
  }

  if (errors.length > 0) {
    sendValidationError(res, errors);
    return;
  }

  next();
};

export const validateTodoId = (req: Request, res: Response, next: NextFunction): void => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id) || id <= 0) {
    sendValidationError(res, [{ field: 'id', message: 'Invalid ID' }]);
    return;
  }

  next();
};
