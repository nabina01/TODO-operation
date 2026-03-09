import { Request, Response } from 'express';
import db from '../../models';

const { Todo } = db;

// Create a Todo
export const createTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, completed } = req.body;
    const todo = await Todo.create({
      title,
      description: description || '',
      completed: completed || false
    });
    
    res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      data: todo
    });
  } catch (error: any) {
    console.error('Error creating todo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create todo',
      error: error.message
    });
  }
};

// Get all Todos
export const getTodos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const todos = await Todo.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: 'Todos retrieved successfully',
      data: todos
    });
  } catch (error: any) {
    console.error('Error fetching todos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve todos',
      error: error.message
    });
  }
};

// Get Todo by ID
export const getTodoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const todo = await Todo.findByPk(id);
    
    if (!todo) {
      res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Todo retrieved successfully',
      data: todo
    });
  } catch (error: any) {
    console.error('Error fetching todo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve todo',
      error: error.message
    });
  }
};

// Update Todo
export const updateTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const todo = await Todo.findByPk(id);
    
    if (!todo) {
      res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
      return;
    }
    
    const { title, description, completed } = req.body;
    await todo.update({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(completed !== undefined && { completed })
    });
    
    res.status(200).json({
      success: true,
      message: 'Todo updated successfully',
      data: todo
    });
  } catch (error: any) {
    console.error('Error updating todo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update todo',
      error: error.message
    });
  }
};

// Delete Todo
export const deleteTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const todo = await Todo.findByPk(id);
    
    if (!todo) {
      res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
      return;
    }
    
    await todo.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting todo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete todo',
      error: error.message
    });
  }
};