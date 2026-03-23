import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authMiddleware } from '../shared/auth';

dotenv.config();

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 5001;

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[User Service] ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'user-service' });
});

const users: { [key: string]: any } = {
  'john@example.com': { id: 1, name: 'John Doe', email: 'john@example.com', password: 'password123' },
  'jane@example.com': { id: 2, name: 'Jane Smith', email: 'jane@example.com', password: 'password123' }
};

app.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = users[email];
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Return user data (password should not be included)
  const { password: _, ...userWithoutPassword } = user;
  res.json({ 
    user: userWithoutPassword,
    message: 'Login successful'
  });
});

app.get('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Array.isArray(id) ? id[0] : id;
  const users: { [key: string]: any } = {
    '1': { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date() },
    '2': { id: 2, name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date() }
  };
  const user = users[userId];
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

app.get('/users', (req: Request, res: Response) => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date() },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date() }
  ];
  res.json(users);
});

app.post('/users', (req: Request, res: Response) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const newUser = {
    id: Math.floor(Math.random() * 10000),
    name,
    email,
    createdAt: new Date()
  };

  console.log('[User Service] User created:', newUser);
  res.status(201).json(newUser);
});

app.put('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Array.isArray(id) ? id[0] : id;
  const { name, email } = req.body;
  const updatedUser = {
    id: parseInt(userId),
    name: name || 'Unknown',
    email: email || 'unknown@example.com',
    updatedAt: new Date()
  };
  console.log('[User Service] User updated:', updatedUser);
  res.json(updatedUser);
});

app.delete('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  console.log('[User Service] User deleted:', id);
  res.json({ message: `User ${id} deleted successfully` });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[User Service] Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
