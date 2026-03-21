import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';


import todoRoutes from "./src/routes/todo.routes";
import { errorHandler } from "./src/utils/errorhandler";
import {getTodoQueue } from './src/queues/todo.queue';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());


const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(getTodoQueue()!)],
  serverAdapter: serverAdapter,
});


app.use('/admin/queues', serverAdapter.getRouter());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Todo API is running", dashboard: "/admin/queues" });
});

app.use('/api/todos', todoRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Job Dashboard available at http://localhost:${PORT}/admin/queues`);
});