import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { messageQueue } from '../shared/message-queue';
import { authMiddleware } from '../shared/auth';

dotenv.config();

const app = express();
const PORT = process.env.TODO_SERVICE_PORT || 5002;
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5003';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());

// Middleware for request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[Todo Service] ${req.method} ${req.path}`);
  next();
});

// In-memory todo storage (in production, use database)
interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

let todos: Todo[] = [];
let todoIdCounter = 1;

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'todo-service' });
});

// Initialize message queue
const initializeQueue = async () => {
  try {
    await messageQueue.connect();
    
    // Create and register todo-created queue handler
    messageQueue.registerHandler('todo-created', async (job) => {
      const { title, userId } = job.data.payload;
      console.log(`[Todo Service] Processing todo-created queue: ${title} for user ${userId}`);
      
      // Send notification asynchronously
      try {
        await axios.post(`${NOTIFICATION_SERVICE_URL}/notifications`, {
          type: 'todo-created',
          message: `New todo created: "${title}"`,
          userId,
          todoId: job.data.payload.todoId
        }, { timeout: 3000 });
        console.log('[Todo Service] Notification sent via queue');
      } catch (error) {
        console.warn('[Todo Service] Failed to send notification:', (error as Error).message);
      }
    });
    
    console.log('[Todo Service] Message queue initialized');
  } catch (error) {
    console.warn('[Todo Service] Message queue not available:', (error as Error).message);
    console.warn('[Todo Service] Continuing without queue support');
  }
};

// Initialize queue on startup
initializeQueue();

// Get all todos
app.get('/todos', (req: Request, res: Response) => {
  console.log(`[Todo Service] Retrieved ${todos.length} todos`);
  res.json(todos);
});

// Get todo by ID
app.get('/todos/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const todo = todos.find(t => t.id === parseInt(id));

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
      updatedAt: new Date()
    };

    todos.push(newTodo);
    console.log('[Todo Service] Todo created:', newTodo);

    // Publish to message queue (asynchronous, fire-and-forget)
    try {
      await messageQueue.publish('todo-created', {
        type: 'todo-created',
        payload: {
          title,
          userId,
          todoId: newTodo.id
        },
        timestamp: new Date()
      }, {
        delay: 1000, // Process after 1 second
        priority: 'normal'
      });
      console.log('[Todo Service] Todo-created event published to queue');
    } catch (queueError) {
      console.warn('[Todo Service] Failed to publish to queue, falling back to direct notification');
      
      // Fallback: Trigger notification service directly if queue fails
      try {
        await axios.post(`${NOTIFICATION_SERVICE_URL}/notifications`, {
          type: 'todo-created',
          message: `New todo created: "${title}" by user ${userId}`,
          todoId: newTodo.id,
          userId: newTodo.userId
        }, {
          timeout: 5000
        }).catch((err) => {
          console.warn('[Todo Service] Failed to notify notification service:', err.message);
      });
    } catch (notifyError) {
      console.warn('[Todo Service] Notification service unreachable, continuing anyway');
    }

    res.status(201).json(newTodo);
  } catch (error: any) {
    console.error('[Todo Service] Error creating todo:', error.message);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// Update todo
app.put('/todos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const todo = todos.find(t => t.id === parseInt(id));

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const { title, description, completed } = req.body;
    todo.title = title || todo.title;
    todo.description = description || todo.description;
    todo.completed = completed !== undefined ? completed : todo.completed;
    todo.updatedAt = new Date();

    console.log('[Todo Service] Todo updated:', todo);

    // Notify notification service
    try {
      await axios.post(`${NOTIFICATION_SERVICE_URL}/notifications`, {
        type: 'todo-updated',
        message: `Todo updated: "${todo.title}"`,
        todoId: todo.id,
        userId: todo.userId,
        completed: todo.completed
      }, {
        timeout: 5000
      }).catch((err) => {
        console.warn('[Todo Service] Failed to notify notification service:', err.message);
      });
    } catch (notifyError) {
      console.warn('[Todo Service] Notification service unreachable');
    }

    res.json(todo);
  } catch (error: any) {
    console.error('[Todo Service] Error updating todo:', error.message);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete todo
app.delete('/todos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const todoIndex = todos.findIndex(t => t.id === parseInt(id));

    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const deletedTodo = todos.splice(todoIndex, 1)[0];
    console.log('[Todo Service] Todo deleted:', deletedTodo);

    // Notify notification service
    try {
      await axios.post(`${NOTIFICATION_SERVICE_URL}/notifications`, {
        type: 'todo-deleted',
        message: `Todo deleted: "${deletedTodo.title}"`,
        todoId: deletedTodo.id,
        userId: deletedTodo.userId
      }, {
        timeout: 5000
      }).catch((err) => {
        console.warn('[Todo Service] Failed to notify notification service:', err.message);
      });
    } catch (notifyError) {
      console.warn('[Todo Service] Notification service unreachable');
    }

    res.json({ message: `Todo ${id} deleted successfully` });
  } catch (error: any) {
    console.error('[Todo Service] Error deleting todo:', error.message);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Todo Service] Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Todo Service running on port ${PORT}`);
  console.log(`Notification Service URL: ${NOTIFICATION_SERVICE_URL}`);
});
