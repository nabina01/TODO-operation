// @ts-nocheck
import { Request, Response } from 'express';
import {
  validateCreateTodo,
  validateUpdateTodo,
  validateTodoId
} from '../../middleware/validation';

describe('Validation Middleware - Unit Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  describe('validateCreateTodo - Positive Tests', () => {
    test('should call next when only title is valid', () => {
      mockReq.body = { title: 'Valid Todo' };
      validateCreateTodo(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should call next when all create fields are valid', () => {
      mockReq.body = {
        title: 'Valid Todo',
        description: 'Valid description',
        completed: false
      };
      validateCreateTodo(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should call next when title and description are valid', () => {
      mockReq.body = { title: 'Todo', description: 'Description' };
      validateCreateTodo(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should call next when completed is true', () => {
      mockReq.body = { title: 'Completed Todo', completed: true };
      validateCreateTodo(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('validateCreateTodo - Negative Tests', () => {
    test('should return 400 with errors when title is missing', () => {
      mockReq.body = { description: 'No title' };
      validateCreateTodo(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'title', message: 'Title is required' })
        ])
      }));
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 400 with errors when title is empty string', () => {
      mockReq.body = { title: '' };
      validateCreateTodo(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Validation failed'
      }));
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 400 with errors when title is whitespace only', () => {
      mockReq.body = { title: '   ' };
      validateCreateTodo(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Validation failed'
      }));
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 400 with errors when title is not a string', () => {
      mockReq.body = { title: 123 };
      validateCreateTodo(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Validation failed'
      }));
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 400 with errors when description is not a string', () => {
      mockReq.body = { title: 'Valid', description: 123 };
      validateCreateTodo(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'description', message: 'Description must be a string' })
        ])
      }));
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 400 with errors when completed is string', () => {
      mockReq.body = { title: 'Valid', completed: 'true' };
      validateCreateTodo(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'completed', message: 'Completed must be a boolean' })
        ])
      }));
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 400 with errors when completed is number', () => {
      mockReq.body = { title: 'Valid', completed: 1 };
      validateCreateTodo(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Validation failed'
      }));
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 400 when create request body is empty', () => {
      mockReq.body = {};
      validateCreateTodo(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'title', message: 'Title is required' })
        ])
      }));
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('validateUpdateTodo - Positive Tests', () => {
    test('should call next for valid title update', () => {
      mockReq.body = { title: 'Updated Title' };
      validateUpdateTodo(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should call next for valid completed update', () => {
      mockReq.body = { completed: true };
      validateUpdateTodo(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should call next for empty update body', () => {
      mockReq.body = {};
      validateUpdateTodo(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should call next for valid multi-field update', () => {
      mockReq.body = { title: 'New Title', description: 'New Desc', completed: true };
      validateUpdateTodo(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('validateUpdateTodo - Negative Tests', () => {
    test('should return 400 when update title is empty string', () => {
      mockReq.body = { title: '' };
      validateUpdateTodo(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'title', message: 'Title must be a non-empty string' })
        ])
      }));
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 400 when update completed is string', () => {
      mockReq.body = { completed: 'false' };
      validateUpdateTodo(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'completed', message: 'Completed must be a boolean' })
        ])
      }));
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 400 when update title is whitespace only', () => {
      mockReq.body = { title: '     ' };
      validateUpdateTodo(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Validation failed'
      }));
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 400 when update description is not a string', () => {
      mockReq.body = { description: 777 };
      validateUpdateTodo(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'description', message: 'Description must be a string' })
        ])
      }));
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('validateTodoId - Positive Tests', () => {
    test('should call next for valid numeric ID', () => {
      mockReq.params = { id: '1' };
      validateTodoId(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should call next for large valid ID', () => {
      mockReq.params = { id: '99999' };
      validateTodoId(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('validateTodoId - Negative Tests', () => {
    test('should return 400 when ID is non-numeric', () => {
      mockReq.params = { id: 'abc' };
      validateTodoId(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'id', message: 'Invalid ID' })
        ])
      }));
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 400 when ID is zero', () => {
      mockReq.params = { id: '0' };
      validateTodoId(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Validation failed'
      }));
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 400 when ID is negative', () => {
      mockReq.params = { id: '-5' };
      validateTodoId(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Validation failed'
      }));
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 400 when ID is missing', () => {
      mockReq.params = {};
      validateTodoId(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'id', message: 'Invalid ID' })
        ])
      }));
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});
