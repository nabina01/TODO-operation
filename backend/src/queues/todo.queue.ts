import 'dotenv/config';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { Queue, QueueEvents, JobsOptions } from 'bullmq';
import type { Express } from 'express';

export const TODO_QUEUE_NAME = 'taskQueue';

export interface TodoCreatedJobData {
  todoId: number;
  title: string;
  description?: string;
  completed: boolean;
  simulateFailure: boolean;
}

const queueEnabled = process.env.QUEUE_ENABLED !== 'false' && process.env.NODE_ENV !== 'test';

export const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || undefined
};

const todoQueue = queueEnabled
  ? new Queue<TodoCreatedJobData>(TODO_QUEUE_NAME, {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        },
        removeOnComplete: 100,
        removeOnFail: 200
      }
    })
  : null;

let queueEvents: QueueEvents | null = null;

export const enqueueTodoCreatedJob = async (todo: {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
}): Promise<void> => {
  if (!queueEnabled || !todoQueue) return;

  const normalizedTitle = todo.title.toLowerCase();
  const shouldDelay = normalizedTitle.includes('[delay]');
  const shouldFail = normalizedTitle.includes('[fail]');

  const options: JobsOptions = {
    delay: shouldDelay ? Number(process.env.TODO_JOB_DELAY_MS || 5000) : 0
  };

  try {
    await todoQueue.add(
      'todo-created',
      {
        todoId: todo.id,
        title: todo.title,
        description: todo.description,
        completed: todo.completed,
        simulateFailure: shouldFail
      },
      options
    );
  } catch (error) {
    console.error('[Queue] Failed to enqueue todo-created job:', error);
  }
};

export const registerQueueEvents = (): void => {
  if (!queueEnabled || !todoQueue || queueEvents) return;

  queueEvents = new QueueEvents(TODO_QUEUE_NAME, { connection: redisConnection });

  queueEvents.on('completed', ({ jobId }) => {
    console.log(`[Queue] Job ${jobId} completed`);
  });

  queueEvents.on('failed', ({ jobId, failedReason, prev }) => {
    console.error(`[Queue] Job ${jobId} failed (prev=${prev}): ${failedReason}`);
  });

  queueEvents.on('error', (error) => {
    console.error('[Queue] Queue event listener error:', error);
  });
};

export const registerQueueDashboard = (app: Express): void => {
  if (!queueEnabled || !todoQueue) return;

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  createBullBoard({
    queues: [new BullMQAdapter(todoQueue)],
    serverAdapter
  });

  app.use('/admin/queues', serverAdapter.getRouter());
};

export const getTodoQueue = (): Queue<TodoCreatedJobData> | null => todoQueue;
