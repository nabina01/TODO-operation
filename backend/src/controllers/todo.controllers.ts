import { Request, Response } from 'express';
import db from '../../models';

const { Todo } = db;

export const createTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, completed } = req.body;
    const todo = await Todo.create({ title, description, completed });
    
    res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      data: todo
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create todo',
      error: error.message
    });
  }
};

export const getTodos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const todos = await Todo.findAll({ order: [['createdAt', 'DESC']] });
    
    res.json({
      success: true,
      message: 'Todos retrieved successfully',
      data: todos
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve todos',
      error: error.message
    });
  }
};

export const getTodoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const todo = await Todo.findByPk(Number(req.params.id));
    
    if (!todo) {
      res.status(404).json({ success: false, message: 'Todo not found' });
      return;
    }
    
    res.json({ success: true, data: todo });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve todo',
      error: error.message
    });
  }
};

export const updateTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const todo = await Todo.findByPk(Number(req.params.id));
    
    if (!todo) {
      res.status(404).json({ success: false, message: 'Todo not found' });
      return;
    }
    
    await todo.update(req.body);
    
    res.json({
      success: true,
      message: 'Todo updated successfully',
      data: todo
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update todo',
      error: error.message
    });
  }
};

export const deleteTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const todo = await Todo.findByPk(Number(req.params.id));
    
    if (!todo) {
      res.status(404).json({ success: false, message: 'Todo not found' });
      return;
    }
    
    await todo.destroy();
    res.json({ success: true, message: 'Todo deleted successfully' });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete todo',
      error: error.message
    });
  }
};