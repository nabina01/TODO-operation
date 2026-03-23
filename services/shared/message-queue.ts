import { Queue, Worker, Job, JobsOptions } from 'bullmq';

export interface QueueMessage {
  type: string;
  payload: any;
  timestamp: Date;
  retries?: number;
  priority?: 'low' | 'normal' | 'high';
}

export interface QueueHandler {
  (message: QueueMessage): Promise<void>;
}


const redisConnectionOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null as any,
  enableReadyCheck: false,
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
};

class ServiceMessageQueue {
  private queues = new Map<string, Queue>();
  private workers = new Map<string, Worker<QueueMessage>>();
  private handlers = new Map<string, QueueHandler>();
  private isConnected = false;

  public async connect(): Promise<void> {
    // Test connection using BullMQ's Queue
    try {
      const testQueue = new Queue('test-connection', { connection: redisConnectionOptions });
      await testQueue.waitUntilReady();
      await testQueue.close();
      this.isConnected = true;
      console.log('[MessageQueue] Connected to Redis');
    } catch (error) {
      console.error('[MessageQueue] Redis connection failed:', (error as Error).message);
      throw error;
    }
  }

  public createQueue(queueName: string): Queue {
    if (this.queues.has(queueName)) return this.queues.get(queueName)!;

    const queue = new Queue(queueName, {
      connection: redisConnectionOptions,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
      } as JobsOptions,
    });

    this.queues.set(queueName, queue);
    console.log(`[MessageQueue] Queue created: ${queueName}`);
    return queue;
  }

  public registerHandler(queueName: string, handler: QueueHandler, concurrency = 5): void {
    this.handlers.set(queueName, handler);

    if (!this.queues.has(queueName)) this.createQueue(queueName);

    const worker = new Worker<QueueMessage>(
      queueName,
      async (job: Job<QueueMessage>) => {
        await handler(job.data);
      },
      {
        connection: redisConnectionOptions,
        concurrency,
      }
    );

    worker.on('completed', (job: Job) => {
      console.log(`[MessageQueue] Job completed: ${queueName}/${job.id}`);
    });

    worker.on('failed', (job: Job | undefined, err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[MessageQueue] Job failed: ${queueName}/${job?.id}`, errorMessage);
    });

    worker.on('error', (err: Error) => {
      console.error(`[MessageQueue] Worker error (${queueName}):`, err.message);
    });

    this.workers.set(queueName, worker);
    console.log(`[MessageQueue] Handler registered for queue: ${queueName}`);
  }

  public async publish(
    queueName: string,
    message: QueueMessage,
    options?: { delay?: number;
     priority?: 'low' | 'normal' | 'high' }
  ): Promise<void> {
    const queue = this.createQueue(queueName);

    const jobOptions: JobsOptions = {
      attempts: message.retries ?? 3,
      backoff: { type: 'exponential', delay: 2000 },
    };

    if (options?.delay) jobOptions.delay = options.delay;
    if (options?.priority)
      jobOptions.priority =
        options.priority === 'high' ? 10 : options.priority === 'normal' ? 5 : 1;

    await queue.add(message.type, message, jobOptions);

    console.log(`[MessageQueue] Message published: ${queueName} → ${message.type}`);
  }

  public async getQueueStats(queueName: string) {
    const queue = this.queues.get(queueName);
    if (!queue) return { error: 'Queue not found' };

    return {
      name: queueName,
      counts: await queue.getJobCounts(),
      workers: this.workers.has(queueName) ? 1 : 0,
      isPaused: await queue.isPaused(),
    };
  }

  public async getAllQueueStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};
    for (const queueName of this.queues.keys()) {
      stats[queueName] = await this.getQueueStats(queueName);
    }
    return stats;
  }

  public async close(): Promise<void> {
    for (const [name, worker] of this.workers) {
      await worker.close();
      console.log(`[MessageQueue] Worker closed: ${name}`);
    }

    for (const [name, queue] of this.queues) {
      await queue.close();
      console.log(`[MessageQueue] Queue closed: ${name}`);
    }

    this.isConnected = false;
    console.log('[MessageQueue] Redis connection closed');
  }

  public isConnected_(): boolean {
    return this.isConnected;
  }
}

export const messageQueue = new ServiceMessageQueue();