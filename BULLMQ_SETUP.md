# BullMQ Integration Guide

## Overview

This Todo API includes **BullMQ** - a fast, reliable message queue for Node.js backed by Redis. BullMQ handles asynchronous processing of background tasks without blocking API responses.

---

## What Has Been Implemented

### ✅ **1. Dependencies Installed**

```json
{
  "bullmq": "^5.71.0",           // Job queue library
  "ioredis": "^5.10.1",          // Redis client
  "@bull-board/api": "^6.20.6",  // Queue dashboard API
  "@bull-board/express": "^6.20.6" // Express integration for dashboard
}
```

### ✅ **2. Queue System** (`backend/src/queues/todo.queue.ts`)

**Features:**
- Queue name: `taskQueue`
- Redis connection configuration
- Job retry logic: **3 attempts** with exponential backoff
- Automatic job cleanup (100 completed jobs, 200 failed jobs)
- Queue events logging (completed/failed jobs)
- Bull Board dashboard integration

**Key Functions:**
- `enqueueTodoCreatedJob()` - Producer: Adds job when todo is created
- `registerQueueEvents()` - Registers listeners for job lifecycle events
- `registerQueueDashboard()` - Mounts Bull Board at `/admin/queues`
- `getTodoQueue()` - Returns queue instance

**Job Options:**
```typescript
{
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000
  },
  removeOnComplete: 100,  // Keep last 100 completed jobs
  removeOnFail: 200       // Keep last 200 failed jobs
}
```

### ✅ **3. Worker Process** (`backend/src/workers/todo.worker.ts`)

**Features:**
- Processes jobs from `taskQueue`
- Concurrent job processing (configurable, default 5)
- Fake email notification simulation
- Error handling with automatic retries
- Graceful shutdown on SIGINT/SIGTERM
- Detailed logging with job ID and attempt tracking

**Job Processing Flow:**
1. Logs job start with attempt number
2. Simulates 1-second async operation
3. If job marked for failure, throws error (triggers retry)
4. Otherwise, logs successful email notification
5. Returns completion result with timestamp

**Retry Behavior:**
- First attempt fails → Logs and retries after 1000ms
- Second attempt fails → Logs and retries after 2000ms
- Third attempt fails → Logs final failure, job is discarded

### ✅ **4. Controller Integration** (`backend/src/controllers/todo.controllers.ts`)

**What Changed:**
```typescript
export const createTodo = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, completed } = req.body;
  const todo = await Todo.create({ title, description, completed });

  // Queue job asynchronously (fire-and-forget)
  void enqueueTodoCreatedJob({
    id: todo.id,
    title: todo.title,
    description: todo.description,
    completed: todo.completed
  });

  // API responds immediately without waiting for job processing
  sendSuccess(res, todo, 'Todo created successfully', 201);
});
```

**Key Benefit:** API responds in milliseconds, while background job processes asynchronously.

### ✅ **5. Server Setup** (`backend/server.ts`)

**What Changed:**
```typescript
import { registerQueueDashboard, registerQueueEvents } from './src/queues/todo.queue';

// Register queue dashboard at startup
registerQueueDashboard(app);

// Register queue event listeners
registerQueueEvents();
```

**New Endpoints:**
- `GET /admin/queues` - Interactive Bull Board dashboard for queue monitoring

### ✅ **6. Docker Compose Configuration** (`docker-compose.yml`)

**Added Services:**
- **redis** - Redis server for job storage
- **worker** - Separate container running the worker process

**Environment Variables for Queue:**
```yaml
REDIS_HOST=redis
REDIS_PORT=6379
QUEUE_ENABLED=true
WORKER_CONCURRENCY=5
TODO_JOB_DELAY_MS=5000
```

### ✅ **7. NPM Scripts** (`backend/package.json`)

**New Scripts:**
```json
{
  "worker:dev": "nodemon --exec ts-node src/workers/todo.worker.ts",
  "worker": "node dist/src/workers/todo.worker.js"
}
```

**Existing Scripts (with queue support):**
```json
{
  "dev": "nodemon --exec ts-node server.ts",
  "build": "tsc",
  "start": "node dist/server.js"
}
```

---

## How Queues and Workers Work

### Architecture Diagram

```
┌─────────────────┐
│  API Request    │
│  POST /todos    │
└────────┬────────┘
         │
         ├─► Create todo in MySQL (1ms)
         │
         ├─► Enqueue job in Redis (2ms)
         │
         └─► Return 201 response (3ms total)
         
         │
         ├─► Worker polls Redis (background)
         │
         ├─► Process job (1000ms simulation)
         │
         ├─► On failure: Retry with backoff
         │
         └─► On success: Log completion
```

### Job Lifecycle

1. **Created** - Job added to queue by producer
2. **Waiting** - Job waits in queue for worker
3. **Active** - Worker picks up job and starts processing
4. **Completed** - Job processed successfully
5. **Failed** - Job failed, will retry if attempts remain
6. **Discarded** - Job removed after max retries exceeded

### Queue Event Hooks

```typescript
// When job completes successfully
queueEvents.on('completed', ({ jobId }) => {
  console.log(`Job ${jobId} completed`);
});

// When job fails
queueEvents.on('failed', ({ jobId, failedReason, prev }) => {
  console.error(`Job ${jobId} failed: ${failedReason}`);
});

// Queue connection errors
queueEvents.on('error', (error) => {
  console.error('Queue error:', error);
});
```

---

## Running Redis

### Option 1: Docker (Recommended)

**Single Container:**
```bash
docker run --name todo-redis \
  -p 6379:6379 \
  redis:7-alpine
```

**Verify Connection:**
```bash
redis-cli ping
# Output: PONG
```

**Stop Container:**
```bash
docker stop todo-redis
```

### Option 2: Docker Compose

The included `docker-compose.yml` automatically starts Redis:

```bash
docker-compose up
```

### Option 3: Local Installation (macOS with Homebrew)

```bash
# Install
brew install redis

# Start Redis server
redis-server

# Test connection (new terminal)
redis-cli ping
```

### Option 4: Local Installation (Ubuntu/Debian)

```bash
# Install
sudo apt-get update
sudo apt-get install redis-server

# Start service
sudo systemctl start redis-server

# Test connection
redis-cli ping
```

---

## Running the Worker

### Local Development

**Terminal 1 - Start Redis:**
```bash
docker run --name todo-redis -p 6379:6379 redis:7-alpine
```

**Terminal 2 - Start Backend API:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 3 - Start Worker:**
```bash
cd backend
npm run worker:dev
```

**Verify Worker is Listening:**
```
[Worker] Listening for jobs on queue: taskQueue
```

### Docker Compose

```bash
docker-compose up --build
```

The worker service starts automatically with the backend.

### Production Build

```bash
cd backend
npm run build
npm run worker  # Runs compiled JavaScript
```

---

## Testing the Queue

### Test 1: Normal Todo (Successful Job)

```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread"
  }'
```

**Expected Output (API):**
```json
{
  "success": true,
  "message": "Todo created successfully",
  "data": {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "createdAt": "2026-03-21T10:00:00.000Z",
    "updatedAt": "2026-03-21T10:00:00.000Z"
  }
}
```

**Expected Worker Output:**
```
[Worker] Processing job 1 (attempt 1) for todo 1
[Worker] Fake email sent for todo 1: "Buy groceries" (completed=false)
[Worker] Job 1 completed with result: { processedAt: '...', type: 'fake-email-notification' }
[Queue] Job 1 completed
```

### Test 2: Delayed Job

Include `[delay]` tag in title:

```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "[delay] Send follow-up email",
    "description": "Remind user after 5 seconds"
  }'
```

**Expected Worker Output (after 5 second delay):**
```
[Worker] Processing job 2 (attempt 1) for todo 2
[Worker] Fake email sent for todo 2: "[delay] Send follow-up email" (completed=false)
[Worker] Job 2 completed...
```

### Test 3: Failed Job with Retries

Include `[fail]` tag in title:

```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "[fail] Trigger retry demo",
    "description": "This will fail 3 times then stop"
  }'
```

**Expected Worker Output:**
```
[Worker] Processing job 3 (attempt 1) for todo 3
[Worker] Job 3 failed on attempt 1 of 3: Simulated notification failure for todo 3
[Queue] Job 3 failed (prev=null): Simulated notification failure for todo 3

[Worker] Processing job 3 (attempt 2) for todo 3
[Worker] Job 3 failed on attempt 2 of 3: Simulated notification failure for todo 3
[Queue] Job 3 failed (prev=active): Simulated notification failure for todo 3

[Worker] Processing job 3 (attempt 3) for todo 3
[Worker] Job 3 failed on attempt 3 of 3: Simulated notification failure for todo 3
[Queue] Job 3 failed (prev=active): Simulated notification failure for todo 3
```

### Test 4: Bull Board Dashboard

Open browser to: **http://localhost:5000/admin/queues**

**Features:**
- View all jobs in queue
- See job status (waiting, active, completed, failed)
- Filter by status
- View job details and attempt history
- Retry failed jobs
- Clear jobs

---

## Environment Variables

**Create `backend/.env`:**

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=todo_db
DB_USER=root
DB_PASSWORD=root1234

# Server
NODE_ENV=development
PORT=5000

# Frontend
FRONTEND_URL=http://localhost:5173

# Redis (BullMQ)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# Queue Settings
QUEUE_ENABLED=true
WORKER_CONCURRENCY=5
TODO_JOB_DELAY_MS=5000
```

**Environment Variable Documentation:**

| Variable | Default | Description |
|----------|---------|-------------|
| `QUEUE_ENABLED` | `true` | Enable/disable queue system |
| `REDIS_HOST` | `127.0.0.1` | Redis server hostname |
| `REDIS_PORT` | `6379` | Redis server port |
| `REDIS_PASSWORD` | (empty) | Redis password if required |
| `WORKER_CONCURRENCY` | `5` | Number of jobs processed in parallel |
| `TODO_JOB_DELAY_MS` | `5000` | Default delay for `[delay]` jobs in milliseconds |

---

## Monitoring and Logging

### Console Output

The application logs all queue events:

**API:**
```
[Queue] Failed to enqueue todo-created job: <error>
```

**Worker:**
```
[Worker] Processing job X (attempt N) for todo Y
[Worker] Fake email sent for todo Y: "title" (completed=false)
[Worker] Job X completed with result: {...}
[Worker] Job X failed on attempt N of 3: error message
[Worker] Graceful shutdown started...
```

**Queue Events:**
```
[Queue] Job X completed
[Queue] Job X failed (prev=<state>): error message
[Queue] Queue event listener error: <error>
```

### Bull Board Dashboard

Access at **http://localhost:5000/admin/queues**

**Provides:**
- Real-time queue statistics
- Job list with filtering
- Job details and history
- Retry/discard controls
- Queue health status

---

## Real-World Use Cases Implemented

### 1. Fake Email Notification
When a todo is created, a background job simulates sending an email:
- Real use case: Send actual emails via SendGrid, AWS SES, Mailgun
- Current: Logs `Fake email sent for todo X`

### 2. Activity Logging
Job processing is logged with:
- Job ID and attempt number
- Success/failure status
- Completion time and result

### 3. Asynchronous Data Processing
Todos are processed without blocking API:
- Real use case: Resize images, generate PDFs, process data
- Current: Simulates 1-second processing time

### 4. Fault Tolerance with Retries
Failed jobs retry automatically:
- Real use case: Network failures, temporary service outages
- Implementation: 3 attempts with exponential backoff (1s → 2s)

---

## Advanced Configuration

### Scaling Workers

Run multiple worker instances to process more jobs in parallel:

```bash
# Worker 1
npm run worker:dev &

# Worker 2
npm run worker:dev &

# Worker 3
npm run worker:dev &
```

All workers share the same Redis queue automatically.

### Custom Job Handlers

To add new job types, modify `backend/src/workers/todo.worker.ts`:

```typescript
const worker = new Worker<TodoCreatedJobData>(
  TODO_QUEUE_NAME,
  async (job) => {
    if (job.name === 'todo-created') {
      // Handle todo creation
    } else if (job.name === 'todo-deleted') {
      // Handle todo deletion
    }
    // Add more job types as needed
  },
  { connection: redisConnection }
);
```

### Custom Retry Strategy

Modify backoff strategy in `backend/src/queues/todo.queue.ts`:

```typescript
backoff: {
  type: 'fixed',      // 'exponential' | 'fixed'
  delay: 2000         // Fixed delay of 2 seconds
}
```

---

## Troubleshooting

### Issue: "Redis connection refused"

**Solution:**
```bash
# Check if Redis is running
redis-cli ping

# If not, start Redis
docker run -p 6379:6379 redis:7-alpine
```

### Issue: "Worker not processing jobs"

**Check:**
1. Is worker process running? (`npm run worker:dev`)
2. Is Redis connected? (check console output)
3. Is `QUEUE_ENABLED=true`? (check `.env`)
4. Are there errors in worker logs?

### Issue: "Jobs stuck in queue"

**Solution:**
```bash
# Clear all jobs from queue
redis-cli FLUSHALL

# Or restart Redis
docker restart todo-redis
```

### Issue: "Bull Board dashboard not loading"

**Check:**
- Is backend running on port 5000?
- Is dashboard enabled in `server.ts`?
- Check browser console for errors

---

## Files Modified/Created

### New Files Created:
- `backend/src/queues/todo.queue.ts` - Queue configuration and producer
- `backend/src/workers/todo.worker.ts` - Worker processor
- `backend/.env.example` - Environment variables template
- `BULLMQ_SETUP.md` - This documentation

### Files Modified:
- `backend/package.json` - Added BullMQ dependencies and npm scripts
- `backend/server.ts` - Added queue dashboard and events
- `backend/src/controllers/todo.controllers.ts` - Added job enqueueing
- `docker-compose.yml` - Added Redis and Worker services
- `README.md` - Added BullMQ feature highlight

---

## Next Steps

### To Extend This Implementation:

1. **Add More Job Types** - Create jobs for todo updates, deletions
2. **Real Email Integration** - Replace fake emails with SendGrid
3. **Database Logging** - Store job history in database
4. **Webhooks** - Notify external systems when jobs complete
5. **Scheduled Jobs** - Use BullMQ Repeatable jobs for cron-like tasks
6. **Job Priorities** - Process urgent jobs first
7. **Dead Letter Queue** - Handle permanently failed jobs

---

## Resources

- **BullMQ Documentation:** https://docs.bullmq.io/
- **Bull Board Documentation:** https://github.com/felixmosh/bull-board
- **Redis Documentation:** https://redis.io/docs/
- **Node.js Best Practices:** https://nodejs.org/en/docs/

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs in terminal output
3. Check Bull Board dashboard for job details
4. Review BullMQ official documentation
