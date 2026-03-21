import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 5003;

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());

// Middleware for request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[Notification Service] ${req.method} ${req.path}`);
  next();
});

// In-memory notification storage
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

let notifications: Notification[] = [];
let notificationIdCounter = 1;

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'notification-service' });
});

// Get all notifications
app.get('/notifications', (req: Request, res: Response) => {
  console.log(`[Notification Service] Retrieved ${notifications.length} notifications`);
  res.json(notifications);
});

// Get notification by ID
app.get('/notifications/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const notification = notifications.find(n => n.id === parseInt(id));

  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  res.json(notification);
});

// Create notification (called by other services)
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
      createdAt: new Date()
    };

    console.log(`[Notification Service] Processing ${type} notification for user ${userId}`);

    // Simulate sending notification (fake email, SMS, push, etc.)
    try {
      await sendNotification(newNotification);
      newNotification.status = 'sent';
      newNotification.sentAt = new Date();
      console.log(`[Notification Service] Notification sent: ${newNotification.message}`);
    } catch (sendError: any) {
      newNotification.status = 'failed';
      console.error(`[Notification Service] Failed to send notification:`, sendError.message);
    }

    notifications.push(newNotification);

    // Return quickly to caller
    res.status(201).json(newNotification);
  } catch (error: any) {
    console.error('[Notification Service] Error creating notification:', error.message);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Retry failed notification
app.post('/notifications/:id/retry', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = notifications.find(n => n.id === parseInt(id));

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    console.log(`[Notification Service] Retrying notification ${id}`);

    try {
      await sendNotification(notification);
      notification.status = 'sent';
      notification.sentAt = new Date();
      console.log(`[Notification Service] Notification sent on retry: ${notification.message}`);
    } catch (sendError: any) {
      notification.status = 'failed';
      console.error(`[Notification Service] Failed to send notification on retry:`, sendError.message);
    }

    res.json(notification);
  } catch (error: any) {
    console.error('[Notification Service] Error retrying notification:', error.message);
    res.status(500).json({ error: 'Failed to retry notification' });
  }
});

// Get notifications by user ID
app.get('/notifications/user/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const userNotifications = notifications.filter(n => n.userId === parseInt(userId));
  console.log(`[Notification Service] Retrieved ${userNotifications.length} notifications for user ${userId}`);
  res.json(userNotifications);
});

// Get notifications by status
app.get('/notifications/status/:status', (req: Request, res: Response) => {
  const { status } = req.params;
  const statusNotifications = notifications.filter(n => n.status === status);
  console.log(`[Notification Service] Retrieved ${statusNotifications.length} ${status} notifications`);
  res.json(statusNotifications);
});

// Delete notification
app.delete('/notifications/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = notifications.findIndex(n => n.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  const deleted = notifications.splice(index, 1)[0];
  console.log('[Notification Service] Notification deleted:', deleted);
  res.json({ message: `Notification ${id} deleted successfully` });
});

// Helper function to simulate sending notification
async function sendNotification(notification: Notification): Promise<void> {
  return new Promise((resolve, reject) => {
    // Simulate processing time
    setTimeout(() => {
      // 90% success rate for demo purposes
      if (Math.random() < 0.9) {
        console.log(`[Notification Service] Sending ${notification.type} to user ${notification.userId}:`, notification.message);
        resolve();
      } else {
        reject(new Error('Random notification failure for demo'));
      }
    }, 100);
  });
}

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Notification Service] Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});
