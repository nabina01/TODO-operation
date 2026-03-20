import dotenv from 'dotenv';
import { Worker } from 'bullmq';
import { redisConnection, TODO_QUEUE_NAME, TodoCreatedJobData } from '../queues/todo.queue';

dotenv.config();

const queueEnabled = process.env.QUEUE_ENABLED !== 'false' && process.env.NODE_ENV !== 'test';

if (!queueEnabled) {
  console.log('[Worker] Queue is disabled. Exiting worker process.');
  process.exit(0);
}

const worker = new Worker<TodoCreatedJobData>(
  TODO_QUEUE_NAME,
  async (job) => {
    console.log(`[Worker] Processing job ${job.id} (attempt ${job.attemptsMade + 1}) for todo ${job.data.todoId}`);

    // Simulate an asynchronous side effect (email/logging/external API work).
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (job.data.simulateFailure) {
      throw new Error(`Simulated notification failure for todo ${job.data.todoId}`);
    }

    console.log(
      `[Worker] Fake email sent for todo ${job.data.todoId}: "${job.data.title}" (completed=${job.data.completed})`
    );

    return {
      processedAt: new Date().toISOString(),
      type: 'fake-email-notification'
    };
  },
  {
    connection: redisConnection,
    concurrency: Number(process.env.WORKER_CONCURRENCY || 5)
  }
);

worker.on('completed', (job, result) => {
  console.log(`[Worker] Job ${job?.id} completed with result:`, result);
});

worker.on('failed', (job, err) => {
  console.error(
    `[Worker] Job ${job?.id} failed on attempt ${job?.attemptsMade} of ${job?.opts.attempts}: ${err.message}`
  );
});

worker.on('error', (error) => {
  console.error('[Worker] Worker connection error:', error);
});

const shutdown = async () => {
  console.log('[Worker] Graceful shutdown started...');
  await worker.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log(`[Worker] Listening for jobs on queue: ${TODO_QUEUE_NAME}`);
