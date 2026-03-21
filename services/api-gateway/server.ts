import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios, { AxiosError } from 'axios';
import morgan from 'morgan';

dotenv.config();

const app = express();
const PORT = process.env.GATEWAY_PORT || 5000;

// Service URLs
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5001';
const TODO_SERVICE_URL = process.env.TODO_SERVICE_URL || 'http://localhost:5002';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5003';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());
app.use(morgan('combined'));

console.log('[API Gateway] Starting with service URLs:');
console.log(`  User Service: ${USER_SERVICE_URL}`);
console.log(`  Todo Service: ${TODO_SERVICE_URL}`);
console.log(`  Notification Service: ${NOTIFICATION_SERVICE_URL}`);

// Health check for gateway
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// Health check for all services
app.get('/health/services', async (req: Request, res: Response) => {
  const services: { [key: string]: any } = {};

  try {
    const userHealth = await axios.get(`${USER_SERVICE_URL}/health`, { timeout: 2000 });
    services.userService = userHealth.data;
  } catch (e: any) {
    services.userService = { error: e.message };
  }

  try {
    const todoHealth = await axios.get(`${TODO_SERVICE_URL}/health`, { timeout: 2000 });
    services.todoService = todoHealth.data;
  } catch (e: any) {
    services.todoService = { error: e.message };
  }

  try {
    const notificationHealth = await axios.get(`${NOTIFICATION_SERVICE_URL}/health`, { timeout: 2000 });
    services.notificationService = notificationHealth.data;
  } catch (e: any) {
    services.notificationService = { error: e.message };
  }

  res.json(services);
});

// ==================== USER SERVICE ROUTES ====================

// GET /users - Get all users
app.get('/users', async (req: Request, res: Response) => {
  try {
    console.log('[API Gateway] Forwarding GET /users to User Service');
    const response = await axios.get(`${USER_SERVICE_URL}/users`, { timeout: 5000 });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'User Service');
  }
});

// GET /users/:id - Get user by ID
app.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[API Gateway] Forwarding GET /users/${id} to User Service`);
    const response = await axios.get(`${USER_SERVICE_URL}/users/${id}`, { timeout: 5000 });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'User Service');
  }
});

// POST /users - Create user
app.post('/users', async (req: Request, res: Response) => {
  try {
    console.log('[API Gateway] Forwarding POST /users to User Service');
    const response = await axios.post(`${USER_SERVICE_URL}/users`, req.body, { timeout: 5000 });
    res.status(201).json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'User Service');
  }
});

// PUT /users/:id - Update user
app.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[API Gateway] Forwarding PUT /users/${id} to User Service`);
    const response = await axios.put(`${USER_SERVICE_URL}/users/${id}`, req.body, { timeout: 5000 });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'User Service');
  }
});

// DELETE /users/:id - Delete user
app.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[API Gateway] Forwarding DELETE /users/${id} to User Service`);
    const response = await axios.delete(`${USER_SERVICE_URL}/users/${id}`, { timeout: 5000 });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'User Service');
  }
});

// ==================== TODO SERVICE ROUTES ====================

// GET /todos - Get all todos
app.get('/todos', async (req: Request, res: Response) => {
  try {
    console.log('[API Gateway] Forwarding GET /todos to Todo Service');
    const response = await axios.get(`${TODO_SERVICE_URL}/todos`, { timeout: 5000 });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'Todo Service');
  }
});

// GET /todos/:id - Get todo by ID
app.get('/todos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[API Gateway] Forwarding GET /todos/${id} to Todo Service`);
    const response = await axios.get(`${TODO_SERVICE_URL}/todos/${id}`, { timeout: 5000 });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'Todo Service');
  }
});

// POST /todos - Create todo
app.post('/todos', async (req: Request, res: Response) => {
  try {
    console.log('[API Gateway] Forwarding POST /todos to Todo Service');
    const response = await axios.post(`${TODO_SERVICE_URL}/todos`, req.body, { timeout: 5000 });
    res.status(201).json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'Todo Service');
  }
});

// PUT /todos/:id - Update todo
app.put('/todos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[API Gateway] Forwarding PUT /todos/${id} to Todo Service`);
    const response = await axios.put(`${TODO_SERVICE_URL}/todos/${id}`, req.body, { timeout: 5000 });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'Todo Service');
  }
});

// DELETE /todos/:id - Delete todo
app.delete('/todos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[API Gateway] Forwarding DELETE /todos/${id} to Todo Service`);
    const response = await axios.delete(`${TODO_SERVICE_URL}/todos/${id}`, { timeout: 5000 });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'Todo Service');
  }
});

// ==================== NOTIFICATION SERVICE ROUTES ====================

// GET /notifications - Get all notifications
app.get('/notifications', async (req: Request, res: Response) => {
  try {
    console.log('[API Gateway] Forwarding GET /notifications to Notification Service');
    const response = await axios.get(`${NOTIFICATION_SERVICE_URL}/notifications`, { timeout: 5000 });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'Notification Service');
  }
});

// GET /notifications/:id - Get notification by ID
app.get('/notifications/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[API Gateway] Forwarding GET /notifications/${id} to Notification Service`);
    const response = await axios.get(`${NOTIFICATION_SERVICE_URL}/notifications/${id}`, { timeout: 5000 });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'Notification Service');
  }
});

// POST /notifications - Create notification
app.post('/notifications', async (req: Request, res: Response) => {
  try {
    console.log('[API Gateway] Forwarding POST /notifications to Notification Service');
    const response = await axios.post(`${NOTIFICATION_SERVICE_URL}/notifications`, req.body, { timeout: 5000 });
    res.status(201).json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'Notification Service');
  }
});

// POST /notifications/:id/retry - Retry notification
app.post('/notifications/:id/retry', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[API Gateway] Forwarding POST /notifications/${id}/retry to Notification Service`);
    const response = await axios.post(`${NOTIFICATION_SERVICE_URL}/notifications/${id}/retry`, {}, { timeout: 5000 });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'Notification Service');
  }
});

// GET /notifications/user/:userId - Get notifications by user
app.get('/notifications/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    console.log(`[API Gateway] Forwarding GET /notifications/user/${userId} to Notification Service`);
    const response = await axios.get(`${NOTIFICATION_SERVICE_URL}/notifications/user/${userId}`, { timeout: 5000 });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'Notification Service');
  }
});

// DELETE /notifications/:id - Delete notification
app.delete('/notifications/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[API Gateway] Forwarding DELETE /notifications/${id} to Notification Service`);
    const response = await axios.delete(`${NOTIFICATION_SERVICE_URL}/notifications/${id}`, { timeout: 5000 });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'Notification Service');
  }
});

// ==================== ERROR HANDLING ====================

// Handle service errors
function handleServiceError(error: any, res: Response, serviceName: string): void {
  console.error(`[API Gateway] ${serviceName} Error:`, error.message);

  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    res.status(503).json({
      error: `${serviceName} is unavailable`,
      details: error.message
    });
  } else if (error.response) {
    res.status(error.response.status).json(error.response.data);
  } else {
    res.status(500).json({
      error: `Error communicating with ${serviceName}`,
      details: error.message
    });
  }
}

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[API Gateway] Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

