import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios, { AxiosError } from 'axios';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';

// Import shared utilities
import { authMiddleware, optionalAuthMiddleware, generateToken, TokenPayload } from '../shared/auth';
import { serviceRegistry, initializeServiceRegistry } from '../shared/service-registry';

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

// Initialize service registry
initializeServiceRegistry();

console.log('[API Gateway] Starting with service URLs:');
console.log(`  User Service: ${USER_SERVICE_URL}`);
console.log(`  Todo Service: ${TODO_SERVICE_URL}`);
console.log(`  Notification Service: ${NOTIFICATION_SERVICE_URL}`);
console.log('[API Gateway] JWT Authentication enabled');

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

// Service registry status
app.get('/registry/status', (req: Request, res: Response) => {
  const status = serviceRegistry.getStatus();
  const services = serviceRegistry.getAllServices();
  
  res.json({
    status: 'ok',
    registry: status,
    services: Object.entries(services).map(([name, config]) => ({
      name,
      url: config.url,
      healthCheck: config.healthCheckPath,
      lastCheck: config.lastHealthCheck
    }))
  });
});

// ==================== AUTHENTICATION ROUTES ====================

// POST /auth/login - User login (generates JWT)
app.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    console.log('[API Gateway] Forwarding POST /auth/login to User Service');
    const response = await axios.post(`${USER_SERVICE_URL}/auth/login`, { email, password }, { timeout: 5000 });
    
    // Generate JWT token with user data
    const user = response.data.user || { userId: response.data.id, email: response.data.email, name: response.data.name };
    const token = generateToken({
      userId: user.userId || user.id,
      email: user.email,
      name: user.name
    });
    
    res.json({ 
      ...response.data, 
      token,
      user: { ...user, token }
    });
  } catch (error: any) {
    handleServiceError(error, res, 'User Service (Auth)');
  }
});

// POST /auth/logout - User logout (invalidate token client-side)
app.post('/auth/logout', authMiddleware, (req: Request, res: Response) => {
  // Token invalidation would typically be handled on the client
  // For stateless JWT, we just return success
  res.json({ message: 'Logout successful' });
});

// GET /auth/verify - Verify token
app.get('/auth/verify', authMiddleware, (req: Request, res: Response) => {
  res.json({ 
    valid: true, 
    user: req.user 
  });
});

// POST /auth/refresh - Refresh token
app.post('/auth/refresh', (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      res.status(400).json({ error: 'Token is required' });
      return;
    }

    // Verify existing token (will throw if invalid)
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production') as TokenPayload;
    
    // Generate new token
    const newToken = generateToken({
      userId: payload.userId,
      email: payload.email,
      name: payload.name
    });
    
    res.json({ token: newToken });
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid token', details: error.message });
  }
});

// ==================== USER SERVICE ROUTES ====================

// GET /users - Get all users (protected)
app.get('/users', authMiddleware, async (req: Request, res: Response) => {
  try {
    console.log('[API Gateway] Forwarding GET /users to User Service');
    const response = await axios.get(`${USER_SERVICE_URL}/users`, { 
      timeout: 5000,
      headers: { 'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || ''}` }
    });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'User Service');
  }
});

// GET /users/:id - Get user by ID (protected)
app.get('/users/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[API Gateway] Forwarding GET /users/${id} to User Service`);
    const response = await axios.get(`${USER_SERVICE_URL}/users/${id}`, { 
      timeout: 5000,
      headers: { 'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || ''}` }
    });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'User Service');
  }
});

// POST /users - Create user (public registration)
app.post('/users', async (req: Request, res: Response) => {
  try {
    console.log('[API Gateway] Forwarding POST /users to User Service');
    const response = await axios.post(`${USER_SERVICE_URL}/users`, req.body, { timeout: 5000 });
    res.status(201).json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'User Service');
  }
});

// PUT /users/:id - Update user (protected)
app.put('/users/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[API Gateway] Forwarding PUT /users/${id} to User Service`);
    const response = await axios.put(`${USER_SERVICE_URL}/users/${id}`, req.body, { 
      timeout: 5000,
      headers: { 'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || ''}` }
    });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'User Service');
  }
});

// DELETE /users/:id - Delete user (protected)
app.delete('/users/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[API Gateway] Forwarding DELETE /users/${id} to User Service`);
    const response = await axios.delete(`${USER_SERVICE_URL}/users/${id}`, { 
      timeout: 5000,
      headers: { 'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || ''}` }
    });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'User Service');
  }
});

// ==================== TODO SERVICE ROUTES ====================

// GET /todos - Get all todos (protected)
app.get('/todos', authMiddleware, async (req: Request, res: Response) => {
  try {
    console.log('[API Gateway] Forwarding GET /todos to Todo Service');
    const response = await axios.get(`${TODO_SERVICE_URL}/todos`, { 
      timeout: 5000,
      headers: { 'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || ''}` }
    });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'Todo Service');
  }
});

// GET /todos/:id - Get todo by ID (protected)
app.get('/todos/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[API Gateway] Forwarding GET /todos/${id} to Todo Service`);
    const response = await axios.get(`${TODO_SERVICE_URL}/todos/${id}`, { 
      timeout: 5000,
      headers: { 'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || ''}` }
    });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'Todo Service');
  }
});

// POST /todos - Create todo (protected)
app.post('/todos', authMiddleware, async (req: Request, res: Response) => {
  try {
    console.log('[API Gateway] Forwarding POST /todos to Todo Service');
    const response = await axios.post(`${TODO_SERVICE_URL}/todos`, req.body, { 
      timeout: 5000,
      headers: { 'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || ''}` }
    });
    res.status(201).json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'Todo Service');
  }
});

// PUT /todos/:id - Update todo (protected)
app.put('/todos/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[API Gateway] Forwarding PUT /todos/${id} to Todo Service`);
    const response = await axios.put(`${TODO_SERVICE_URL}/todos/${id}`, req.body, { 
      timeout: 5000,
      headers: { 'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || ''}` }
    });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'Todo Service');
  }
});

// DELETE /todos/:id - Delete todo (protected)
app.delete('/todos/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[API Gateway] Forwarding DELETE /todos/${id} to Todo Service`);
    const response = await axios.delete(`${TODO_SERVICE_URL}/todos/${id}`, { 
      timeout: 5000,
      headers: { 'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || ''}` }
    });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'Todo Service');
  }
});

// ==================== NOTIFICATION SERVICE ROUTES ====================

// GET /notifications - Get all notifications (protected)
app.get('/notifications', authMiddleware, async (req: Request, res: Response) => {
  try {
    console.log('[API Gateway] Forwarding GET /notifications to Notification Service');
    const response = await axios.get(`${NOTIFICATION_SERVICE_URL}/notifications`, { 
      timeout: 5000,
      headers: { 'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || ''}` }
    });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'Notification Service');
  }
});

// GET /notifications/:id - Get notification by ID (protected)
app.get('/notifications/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[API Gateway] Forwarding GET /notifications/${id} to Notification Service`);
    const response = await axios.get(`${NOTIFICATION_SERVICE_URL}/notifications/${id}`, { 
      timeout: 5000,
      headers: { 'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || ''}` }
    });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'Notification Service');
  }
});

// POST /notifications - Create notification (service-to-service only)
app.post('/notifications', async (req: Request, res: Response) => {
  try {
    console.log('[API Gateway] Forwarding POST /notifications to Notification Service');
    const response = await axios.post(`${NOTIFICATION_SERVICE_URL}/notifications`, req.body, { timeout: 5000 });
    res.status(201).json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'Notification Service');
  }
});

// POST /notifications/:id/retry - Retry notification (protected)
app.post('/notifications/:id/retry', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[API Gateway] Forwarding POST /notifications/${id}/retry to Notification Service`);
    const response = await axios.post(`${NOTIFICATION_SERVICE_URL}/notifications/${id}/retry`, {}, { 
      timeout: 5000,
      headers: { 'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || ''}` }
    });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'Notification Service');
  }
});

// GET /notifications/user/:userId - Get notifications by user (protected)
app.get('/notifications/user/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    console.log(`[API Gateway] Forwarding GET /notifications/user/${userId} to Notification Service`);
    const response = await axios.get(`${NOTIFICATION_SERVICE_URL}/notifications/user/${userId}`, { 
      timeout: 5000,
      headers: { 'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || ''}` }
    });
    res.json(response.data);
  } catch (error: any) {
    handleServiceError(error, res, 'Notification Service');
  }
});

// DELETE /notifications/:id - Delete notification (protected)
app.delete('/notifications/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[API Gateway] Forwarding DELETE /notifications/${id} to Notification Service`);
    const response = await axios.delete(`${NOTIFICATION_SERVICE_URL}/notifications/${id}`, { 
      timeout: 5000,
      headers: { 'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || ''}` }
    });
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
