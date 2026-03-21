import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.TODO_SERVICE_PORT || 5002;
const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5003';

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  })
);
app.use(express.json());

// Middleware for request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[Todo Service] ${req.method} ${req.path}`);
  next();
});

// ---- Types ----
interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Type for route params
interface IdParams {
  id: string;
}

// ---- In-memory storage ----
let todos: Todo[] = [];
let todoIdCounter = 1;

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'todo-service' });
});

// Get all todos
app.get('/todos', (req: Request, res: Response) => {
  res.json(todos);
});

// Get todo by ID
app.get('/todos/:id', (req: Request<IdParams>, res: Response) => {
  const id = parseInt(req.params.id);

  const todo = todos.find((t) => t.id === id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  res.json(todo);
});

// Create todo
app.post('/todos', async (req: Request, res: Response) => {
  try {
    const { title, description, userId } = req.body;

    if (!title || !userId) {
      return res.status(400).json({ error: 'Title and userId are required' });
    }

    const newTodo: Todo = {
      id: todoIdCounter++,
      title,
      description: description || '',
      completed: false,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    todos.push(newTodo);

    // Notify service
    axios
      .post(`${NOTIFICATION_SERVICE_URL}/notifications`, {
        type: 'todo-created',
        message: `New todo created: "${title}"`,
        todoId: newTodo.id,
        userId: newTodo.userId,
      })
      .catch((err) =>
        console.warn('[Todo Service] Notification failed:', err.message)
      );

    res.status(201).json(newTodo);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// Update todo
app.put('/todos/:id', async (req: Request<IdParams>, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const todo = todos.find((t) => t.id === id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const { title, description, completed } = req.body;

    if (title) todo.title = title;
    if (description) todo.description = description;
    if (completed !== undefined) todo.completed = completed;

    todo.updatedAt = new Date();

    axios
      .post(`${NOTIFICATION_SERVICE_URL}/notifications`, {
        type: 'todo-updated',
        message: `Todo updated: "${todo.title}"`,
        todoId: todo.id,
        userId: todo.userId,
      })
      .catch((err) =>
        console.warn('[Todo Service] Notification failed:', err.message)
      );

    res.json(todo);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete todo
app.delete('/todos/:id', async (req: Request<IdParams>, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const deletedTodo = todos.splice(index, 1)[0];

    axios
      .post(`${NOTIFICATION_SERVICE_URL}/notifications`, {
        type: 'todo-deleted',
        message: `Todo deleted: "${deletedTodo.title}"`,
        todoId: deletedTodo.id,
        userId: deletedTodo.userId,
      })
      .catch((err) =>
        console.warn('[Todo Service] Notification failed:', err.message)
      );

    res.json({ message: 'Todo deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Todo Service running on port ${PORT}`);
});