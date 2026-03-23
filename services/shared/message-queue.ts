import { Queue, Worker, QueueScheduler } from 'bullmq';
import IORedis from 'ioredis';

/**
 * Message Queue Handler - For asynchronous communication between services
 * Uses BullMQ with Redis as the message broker
 */

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

// Redis connection
const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

/**
 * Service Message Queue
 */
class ServiceMessageQueue {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private schedulers: Map<string, QueueScheduler> = new Map();
  private handlers: Map<string, QueueHandler> = new Map();
  private isConnected: boolean = false;

  /**
   * Initialize and connect to Redis
   */
  public async connect(): Promise<void> {
    try {
      await redisConnection.ping();
      this.isConnected = true;
      console.log('[MessageQueue] Connected to Redis');
    } catch (error) {
      console.error('[MessageQueue] Failed to connect to Redis:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Create a queue for a specific topic
   */
  public createQueue(queueName: string): Queue {
    if (this.queues.has(queueName)) {
      return this.queues.get(queueName)!;
    }

    const queue = new Queue(queueName, {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: {
          age: 3600 // Remove completed jobs after 1 hour
        },
        removeOnFail: {
          age: 86400 // Keep failed jobs for 24 hours
        }
      }
    });

    // Add queue scheduler for delayed jobs
    const scheduler = new QueueScheduler(queueName, {
      connection: redisConnection
    });

    this.queues.set(queueName, queue);
    this.schedulers.set(queueName, scheduler);

    console.log(`[MessageQueue] Queue created: ${queueName}`);
    return queue;
  }

  /**
   * Register a handler for a queue
   */
  public registerHandler(
    queueName: string,
    handler: QueueHandler,
    concurrency: number = 5
  ): void {
    this.handlers.set(queueName, handler);

    // Get or create queue
    let queue = this.queues.get(queueName);
    if (!queue) {
      queue = this.createQueue(queueName);
    }

    // Create worker
    const worker = new Worker(queueName, handler, {
      connection: redisConnection,
      concurrency
    });

    // Attach event listeners
    worker.on('completed', (job) => {
      console.log(`[MessageQueue] Job completed: ${queueName}/${job.id}`);
    });

    worker.on('failed', (job, err) => {
      console.error(
        `[MessageQueue] Job failed: ${queueName}/${job?.id}`,
        err.message
      );
    });

    this.workers.set(queueName, worker);
    console.log(`[MessageQueue] Handler registered for queue: ${queueName}`);
  }

  /**
   * Publish a message to a queue
   */
  public async publish(
    queueName: string,
    message: QueueMessage,
    options?: {
      delay?: number;
      priority?: 'low' | 'normal' | 'high';
    }
  ): Promise<void> {
    try {
      const queue = this.queues.get(queueName);
      if (!queue) {
        throw new Error(`Queue not found: ${queueName}`);
      }

      const jobOptions: any = {
        attempts: message.retries || 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      };

      if (options?.delay) {
        jobOptions.delay = options.delay;
      }

      if (options?.priority) {
        jobOptions.priority =
          options.priority === 'high' ? 10 : options.priority === 'normal' ? 5 : 1;
      }

      await queue.add(message.type, message, jobOptions);
      console.log(`[MessageQueue] Message published to ${queueName}: ${message.type}`);
    } catch (error) {
      console.error(
        '[MessageQueue] Failed to publish message:',
        (error as Error).message
      );
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  public async getQueueStats(queueName: string): Promise<any> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      return { error: 'Queue not found' };
    }

    return {
      name: queueName,
      counts: await queue.getJobCounts(),
      workers: this.workers.has(queueName) ? 1 : 0,
      isPaused: await queue.isPaused()
    };
  }

  /**
   * Get all queues statistics
   */
  public async getAllQueueStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};

    for (const [queueName] of this.queues) {
      stats[queueName] = await this.getQueueStats(queueName);
    }

    return stats;
  }

  /**
   * Close all connections
   */
  public async close(): Promise<void> {
    // Close workers
    for (const [name, worker] of this.workers) {
      await worker.close();
      console.log(`[MessageQueue] Worker closed: ${name}`);
    }

    // Close schedulers
    for (const [name, scheduler] of this.schedulers) {
      await scheduler.close();
      console.log(`[MessageQueue] Scheduler closed: ${name}`);
    }

    // Close queues
    for (const [name, queue] of this.queues) {
      await queue.close();
      console.log(`[MessageQueue] Queue closed: ${name}`);
    }

    // Close Redis connection
    await redisConnection.quit();
    this.isConnected = false;
    console.log('[MessageQueue] Redis connection closed');
  }

  /**
   * Check if connected to Redis
   */
  public isConnected_(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const messageQueue = new ServiceMessageQueue();
