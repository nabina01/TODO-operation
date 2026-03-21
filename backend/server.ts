import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import todoRoutes from "./src/routes/todo.routes";
import { errorHandler } from "./src/utils/errorhandler";
import { registerQueueDashboard, registerQueueEvents } from './src/queues/todo.queue';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Only register queue if explicitly enabled
if (process.env.QUEUE_ENABLED === 'true') {
  try {
    registerQueueDashboard(app);
    registerQueueEvents();
    console.log('[Queue] Queue system enabled');
  } catch (error) {
    console.warn('[Queue] Failed to initialize queue system:', (error as Error).message);
    console.warn('[Queue] Continuing without queue support');
  }
} else {
  console.log('[Queue] Queue system disabled');
}

app.get("/", (req, res) => res.json({ message: "Todo API is running" }));
app.use('/api/todos', todoRoutes);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
