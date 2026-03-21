import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 5003;

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  })
);
app.use(express.json());

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[Notification Service] ${req.method} ${req.path}`);
  next();
});

// ---- Types ----
interface Notification {
  id: number;
  type: string;
  message: string;
  todoId?: number;
  userId?: number;
  status: 'pending' | 'sent' | 'failed';
  createdAt: Date;
  sentAt?: Date;
}

// ✅ Param types
interface IdParams {
  id: string;
}

interface UserParams {
  userId: string;
}

interface StatusParams {
  status: string;
}

// ---- Storage ----
let notifications: Notification[] = [];
let notificationIdCounter = 1;

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'notification-service' });
});

// Get all notifications
app.get('/notifications', (req: Request, res: Response) => {
  res.json(notifications);
});

// Get notification by ID
app.get('/notifications/:id', (req: Request<IdParams>, res: Response) => {
  const id = parseInt(req.params.id);

  const notification = notifications.find((n) => n.id === id);
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  res.json(notification);
});

// Create notification
app.post('/notifications', async (req: Request, res: Response) => {
  try {
    const { type, message, todoId, userId } = req.body;

    if (!type || !message) {
      return res.status(400).json({ error: 'Type and message are required' });
    }

    const newNotification: Notification = {
      id: notificationIdCounter++,
      type,
      message,
      todoId,
      userId,
      status: 'pending',
      createdAt: new Date(),
    };

    try {
      await sendNotification(newNotification);
      newNotification.status = 'sent';
      newNotification.sentAt = new Date();
    } catch (err: any) {
      newNotification.status = 'failed';
      console.error(err.message);
    }

    notifications.push(newNotification);
    res.status(201).json(newNotification);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Retry notification
app.post('/notifications/:id/retry', async (req: Request<IdParams>, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const notification = notifications.find((n) => n.id === id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    try {
      await sendNotification(notification);
      notification.status = 'sent';
      notification.sentAt = new Date();
    } catch (err: any) {
      notification.status = 'failed';
    }

    res.json(notification);
  } catch {
    res.status(500).json({ error: 'Failed to retry notification' });
  }
});

// Get notifications by user
app.get('/notifications/user/:userId', (req: Request<UserParams>, res: Response) => {
  const userId = parseInt(req.params.userId);

  const userNotifications = notifications.filter(
    (n) => n.userId === userId
  );

  res.json(userNotifications);
});

// Get notifications by status
app.get('/notifications/status/:status', (req: Request<StatusParams>, res: Response) => {
  const { status } = req.params;

  const result = notifications.filter((n) => n.status === status);
  res.json(result);
});

// Delete notification
app.delete('/notifications/:id', (req: Request<IdParams>, res: Response) => {
  const id = parseInt(req.params.id);

  const index = notifications.findIndex((n) => n.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  notifications.splice(index, 1);
  res.json({ message: 'Notification deleted successfully' });
});

// Simulate sending
async function sendNotification(notification: Notification): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.9) resolve();
      else reject(new Error('Random failure'));
    }, 100);
  });
}

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});