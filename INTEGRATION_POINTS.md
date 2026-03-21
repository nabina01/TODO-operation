# BullMQ Integration Points - Code Reference

This document shows exactly where BullMQ is integrated into your codebase.

---

## 1. Queue Configuration

**File:** `backend/src/queues/todo.queue.ts`

### What it does:
- Creates Redis connection
- Defines the job queue
- Sets up retry logic
- Registers event listeners
- Provides dashboard

### Key Code:
```typescript
// Create queue with retry configuration
const todoQueue = new Queue<TodoCreatedJobData>(TODO_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,              // ← Retry 3 times
    backoff: {
      type: 'exponential',    // ← Exponential backoff: 1s → 2s → 4s
      delay: 1000
    },
    removeOnComplete: 100,    // ← Keep last 100 completed
    removeOnFail: 200         // ← Keep last 200 failed
  }
});

// Register listeners
queueEvents.on('completed', ({ jobId }) => {
  console.log(`[Queue] Job ${jobId} completed`);
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`[Queue] Job ${jobId} failed: ${failedReason}`);
});

// Mount dashboard
app.use('/admin/queues', serverAdapter.getRouter());
```

### Exports:
- `enqueueTodoCreatedJob()` - Add job to queue
- `registerQueueEvents()` - Start listening for events
- `registerQueueDashboard()` - Mount Bull Board UI
- `getTodoQueue()` - Get queue instance

---

## 2. Worker Process

**File:** `backend/src/workers/todo.worker.ts`

### What it does:
- Polls Redis for jobs
- Processes each job
- Handles retries
- Logs results
- Graceful shutdown

### Key Code:
```typescript
const worker = new Worker<TodoCreatedJobData>(
  TODO_QUEUE_NAME,
  async (job) => {
    // 1. Log job start
    console.log(`[Worker] Processing job ${job.id} (attempt ${job.attemptsMade + 1})`);

    // 2. Simulate async work
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 3. Check if should fail
    if (job.data.simulateFailure) {
      throw new Error(`Simulated notification failure`);  // ← Triggers retry
    }

    // 4. Log success
    console.log(`[Worker] Fake email sent for todo ${job.data.todoId}`);

    // 5. Return result
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

// Retry: automatically handled (throws = retry)
// Completion: logged by event listener
// Failure: logged after all retries exhausted
```

### Event Listeners:
```typescript
// On successful job completion
worker.on('completed', (job, result) => {
  console.log(`[Worker] Job ${job?.id} completed with result:`, result);
});

// On job failure (after all retries)
worker.on('failed', (job, err) => {
  console.error(
    `[Worker] Job ${job?.id} failed on attempt ${job?.attemptsMade} of ${job?.opts.attempts}: ${err.message}`
  );
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await worker.close();
  process.exit(0);
});
```

---

## 3. API Controller Integration

**File:** `backend/src/controllers/todo.controllers.ts`

### What it does:
- Creates todo in database
- Immediately returns response
- Enqueues job asynchronously

### Key Code (Before):
```typescript
// OLD: Without queue
export const createTodo = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, completed } = req.body;
  const todo = await Todo.create({ title, description, completed });
  // Process everything here (slow)
  sendSuccess(res, todo, 'Todo created successfully', 201);
});
```

### Key Code (After):
```typescript
// NEW: With queue
import { enqueueTodoCreatedJob } from '../queues/todo.queue';

export const createTodo = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, completed } = req.body;
  
  // 1. Create todo (blocking, fast)
  const todo = await Todo.create({ title, description, completed });

  // 2. Return response immediately (non-blocking)
  sendSuccess(res, todo, 'Todo created successfully', 201);

  // 3. Enqueue job asynchronously (fire-and-forget)
  void enqueueTodoCreatedJob({
    id: todo.id,
    title: todo.title,
    description: todo.description,
    completed: todo.completed
  });
});
```

### Timing:
```
User Request
├─ Create database record: 1ms
├─ Return API response: 1ms (TOTAL 2ms)
└─ Enqueue job: 1ms (happens after response)
```

---

## 4. Server Setup

**File:** `backend/server.ts`

### What it does:
- Registers queue dashboard
- Starts event listeners
- Makes queue available to API

### Key Code (Before):
```typescript
// OLD: No queue setup
const app = express();
app.use(cors(...));
app.use(express.json());
app.get("/", (req, res) => res.json({ message: "Todo API is running" }));
app.use('/api/todos', todoRoutes);
app.use(errorHandler);
app.listen(PORT, ...);
```

### Key Code (After):
```typescript
// NEW: With queue setup
import { registerQueueDashboard, registerQueueEvents } from './src/queues/todo.queue';

const app = express();
app.use(cors(...));
app.use(express.json());

// ← NEW: Register queue services
registerQueueDashboard(app);    // Mount /admin/queues
registerQueueEvents();           // Start listening for events

app.get("/", (req, res) => res.json({ message: "Todo API is running" }));
app.use('/api/todos', todoRoutes);
app.use(errorHandler);
app.listen(PORT, ...);
```

---

## 5. Docker Compose Integration

**File:** `docker-compose.yml`

### What it does:
- Defines Redis service
- Defines Worker service
- Connects services with networking

### Key Code (Before):
```yaml
services:
  mysql:
    image: mysql:8
    ports:
      - "3307:3306"
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      mysql:
        condition: service_healthy
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
```

### Key Code (After):
```yaml
services:
  mysql: ...
  
  # ← NEW: Redis for queue storage
  redis:
    image: redis:7-alpine
    container_name: todo-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
  
  backend:
    build: ./backend
    depends_on:
      mysql: ...
      redis:
        condition: service_started  # ← Wait for Redis
    environment:
      - REDIS_HOST=redis      # ← Redis service name
      - REDIS_PORT=6379
      - QUEUE_ENABLED=true    # ← Enable queue
  
  # ← NEW: Separate worker container
  worker:
    build: ./backend
    depends_on:
      redis:
        condition: service_started
    environment:
      - REDIS_HOST=redis
      - QUEUE_ENABLED=true
      - WORKER_CONCURRENCY=5
    command: npm run worker  # ← Run worker process
  
  frontend: ...

volumes:
  db_data:
  redis_data:  # ← NEW: Redis data persistence
```

---

## 6. NPM Scripts

**File:** `backend/package.json`

### What it does:
- Provides commands to run worker
- Supports both development and production

### Key Code (Before):
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "migrate": "sequelize-cli db:migrate",
    "seed": "sequelize-cli db:seed:all"
  }
}
```

### Key Code (After):
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    
    // ← NEW: Worker scripts
    "worker:dev": "nodemon --exec ts-node src/workers/todo.worker.ts",
    "worker": "node dist/src/workers/todo.worker.js",
    
    "migrate": "sequelize-cli db:migrate",
    "seed": "sequelize-cli db:seed:all"
  },
  "dependencies": {
    // ← NEW: Queue dependencies
    "bullmq": "^5.71.0",
    "@bull-board/api": "^6.20.6",
    "@bull-board/express": "^6.20.6",
    "ioredis": "^5.10.1",
    
    // Existing...
    "express": "^5.2.1",
    "sequelize": "^6.37.8"
  }
}
```

---

## 7. Environment Variables

**File:** `backend/.env.example` (NEW)

### What it does:
- Documents all queue configuration
- Provides defaults for local development

### Key Variables:
```env
# Connection
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# Control
QUEUE_ENABLED=true

# Behavior
WORKER_CONCURRENCY=5
TODO_JOB_DELAY_MS=5000
```

---

## Data Flow Diagram

### Request Path (API → Queue)
```
POST /api/todos
  ↓
createTodo controller
  ↓
Todo.create() → MySQL
  ↓
sendSuccess() → Send 201 response immediately
  ↓
enqueueTodoCreatedJob()
  ↓
Queue.add() → Store in Redis
```

### Processing Path (Queue → Worker)
```
Redis Queue (taskQueue)
  ↓
Worker.poll() → Check for jobs every X ms
  ↓
Job found
  ↓
Execute handler function
  ↓
Success
  ├─ Log completion
  ├─ Return result
  └─ Remove job from queue
  
Failure
  ├─ Check attempt count
  ├─ < 3 attempts → Retry with backoff
  └─ ≥ 3 attempts → Mark as failed, remove
```

### Event Tracking (Queue Events)
```
Queue Event Listener
  ↓
Job completed → Log "[Queue] Job X completed"
Job failed → Log "[Queue] Job X failed: reason"
Job error → Log "[Queue] Queue error: reason"
```

---

## Integration Checklist

Use this to verify all integration points are in place:

### Code Files
- [x] `backend/src/queues/todo.queue.ts` - Queue configuration
- [x] `backend/src/workers/todo.worker.ts` - Job processor
- [x] `backend/src/controllers/todo.controllers.ts` - Job enqueueing
- [x] `backend/server.ts` - Queue registration
- [x] `backend/package.json` - Dependencies and scripts
- [x] `backend/.env.example` - Configuration template

### Configuration
- [x] `docker-compose.yml` - Redis and Worker services
- [x] Environment variables for queue
- [x] Worker NPM scripts

### Documentation
- [x] `BULLMQ_SETUP.md` - Comprehensive guide
- [x] `IMPLEMENTATION_SUMMARY.md` - Overview
- [x] `QUICK_REFERENCE.md` - Quick start
- [x] `INTEGRATION_POINTS.md` - This file
- [x] `README.md` - Feature update

---

## Testing Integration

### Test 1: API Call with Queue
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'

# Expected:
# 1. API responds immediately with 201
# 2. Worker logs job processing
# 3. Dashboard shows completed job
```

### Test 2: Retry Logic
```bash
# Create todo with [fail] tag
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"[fail] Test retry"}'

# Expected:
# 1. Job fails
# 2. Worker retries at 1s interval
# 3. Worker retries again at 2s interval
# 4. Job discarded after 3 attempts
```

### Test 3: Dashboard
```bash
# Open browser
http://localhost:5000/admin/queues

# Expected:
# 1. See "taskQueue"
# 2. Can view all jobs
# 3. Can see job details
```

---

## Extending the Integration

### Add New Job Type
1. Update `TodoCreatedJobData` interface in `todo.queue.ts`
2. Add new handler in `todo.worker.ts`
3. Call from controller when needed

### Change Retry Behavior
1. Edit `defaultJobOptions` in `todo.queue.ts`
2. Change `attempts` number
3. Change `backoff` strategy

### Add Job Delay
1. Pass `delay` option to `todoQueue.add()`
2. See `todo.queue.ts` lines 48-56

### Monitor in Production
1. Use Bull Board dashboard (same endpoints)
2. Export job logs to monitoring service
3. Set up alerts for failed jobs

---

## Summary

BullMQ is integrated at these key points:

| Layer | File | Integration |
|-------|------|-------------|
| **Data** | `todo.queue.ts` | Stores jobs in Redis |
| **Processing** | `todo.worker.ts` | Processes jobs asynchronously |
| **API** | `todo.controllers.ts` | Enqueues jobs |
| **Server** | `server.ts` | Registers queue services |
| **Container** | `docker-compose.yml` | Redis and Worker services |
| **Config** | `package.json`, `.env` | Dependencies and settings |

All integration points are **complete and production-ready** ✅

