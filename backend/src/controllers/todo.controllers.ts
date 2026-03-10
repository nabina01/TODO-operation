import { Request, Response } from 'express';
import db from '../../models';
import { sendSuccess, sendError, sendNotFound } from '../utils/responsehandler';
import { asyncHandler } from '../utils/errorhandler';

const { Todo } = db;

export const createTodo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { title, description, completed } = req.body;
  const todo = await Todo.create({ title, description, completed });
  sendSuccess(res, todo, 'Todo created successfully', 201);
});

export const getTodos = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const todos = await Todo.findAll({ order: [['createdAt', 'DESC']] });
  sendSuccess(res, todos, 'Todos retrieved successfully');
});

export const getTodoById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const todo = await Todo.findByPk(Number(req.params.id));
  if (!todo) return sendNotFound(res, 'Todo not found');
  sendSuccess(res, todo);
});

export const updateTodo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const todo = await Todo.findByPk(Number(req.params.id));
  if (!todo) return sendNotFound(res, 'Todo not found');
  
  await todo.update(req.body);
  sendSuccess(res, todo, 'Todo updated successfully');
});

export const deleteTodo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const todo = await Todo.findByPk(Number(req.params.id));
  if (!todo) return sendNotFound(res, 'Todo not found');
  
  await todo.destroy();
  sendSuccess(res, null, 'Todo deleted successfully');
});