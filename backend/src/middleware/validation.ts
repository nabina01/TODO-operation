import { Request, Response, NextFunction } from 'express';
import { sendValidationError } from '../utils/responsehandler';

const validate = (checks: Array<{ condition: boolean; field: string; message: string }>) => {
  return checks.filter(check => check.condition).map(({ field, message }) => ({ field, message }));
};

export const validateCreateTodo = (req: Request, res: Response, next: NextFunction): void => {
  const { title, description, completed } = req.body;

  const errors = validate([
    { condition: !title || typeof title !== 'string' || !title.trim(), field: 'title', message: 'Title is required' },
    { condition: description !== undefined && typeof description !== 'string', field: 'description', message: 'Description must be a string' },
    { condition: completed !== undefined && typeof completed !== 'boolean', field: 'completed', message: 'Completed must be a boolean' }
  ]);

  errors.length > 0 ? sendValidationError(res, errors) : next();
};

export const validateUpdateTodo = (req: Request, res: Response, next: NextFunction): void => {
  const { title, description, completed } = req.body;

  const errors = validate([
    { condition: title !== undefined && (typeof title !== 'string' || !title.trim()), field: 'title', message: 'Title must be a non-empty string' },
    { condition: description !== undefined && typeof description !== 'string', field: 'description', message: 'Description must be a string' },
    { condition: completed !== undefined && typeof completed !== 'boolean', field: 'completed', message: 'Completed must be a boolean' }
  ]);

  errors.length > 0 ? sendValidationError(res, errors) : next();
};

export const validateTodoId = (req: Request, res: Response, next: NextFunction): void => {
  const id = parseInt(String(req.params.id));
  const errors = validate([{ condition: isNaN(id) || id <= 0, field: 'id', message: 'Invalid ID' }]);
  errors.length > 0 ? sendValidationError(res, errors) : next();
};
