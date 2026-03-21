# BullMQ Quick Reference Guide

## 🚀 Start Everything in 5 Minutes

### Prerequisites
- Node.js 18+
- Docker (for Redis)

### Commands

**Terminal 1: Start Redis**
```bash
docker run --name todo-redis -p 6379:6379 redis:7-alpine
```

**Terminal 2: Start Backend**
```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

**Terminal 3: Start Worker**
```bash
cd backend
npm run worker:dev
```

**Terminal 4: Start Frontend (Optional)**
```bash
cd frontend
npm install
npm run dev
```

### ✅ Verify Everything Works

Test API call:
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test job"}'
```

Monitor jobs:
- Open: http://localhost:5000/admin/queues
- Check worker terminal for logs

---

## 📋 Test Scenarios

### 1. Normal Job (Succeeds)
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk","description":"2% milk"}'
```
**Expected:** Job processes and completes in 1 second

### 2. Delayed Job (Waits 5 Seconds)
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"[delay] Send reminder"}'
```
**Expected:** Job waits 5 seconds, then processes

### 3. Failed Job (Retries 3 Times)
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"[fail] Test retry"}'
```
**Expected:** Job fails, retries at 1s, 2s, 4s intervals, then gives up

---

## 📊 Job Lifecycle

```
User creates todo
    ↓
API creates record in MySQL
    ↓
API returns 201 immediately
    ↓
Job enqueued in Redis (fire-and-forget)
    ↓
Worker polls Redis
    ↓
Worker processes job
    ↓
✓ Success → Log completion → Job removed
✗ Failure → Retry after backoff → Repeat up to 3 times
```

---

## 🔧 Configuration Cheat Sheet

### .env File Location & Variables

File: `backend/.env`

```env
# Essential for queue
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
QUEUE_ENABLED=true

# Optional
WORKER_CONCURRENCY=5
TODO_JOB_DELAY_MS=5000
REDIS_PASSWORD=
```

---

## 📁 Key Files

| File | Purpose | What to Edit |
|------|---------|-------------|
| `backend/src/queues/todo.queue.ts` | Queue config & producer | Change retry attempts, delay duration |
| `backend/src/workers/todo.worker.ts` | Job processor | Change what job does (email, logging, etc) |
| `backend/src/controllers/todo.controllers.ts` | API endpoint | Where job is enqueued |
| `docker-compose.yml` | Container setup | Add more services, change ports |
| `backend/.env` | Configuration | Redis connection, queue settings |

---

## 🐛 Troubleshooting

### Problem: "Redis connection refused"
**Solution:**
```bash
docker run -p 6379:6379 redis:7-alpine
redis-cli ping
# Should print: PONG
```

### Problem: "Worker not running"
**Check:**
1. Is `npm run worker:dev` running in terminal?
2. Check for errors in worker output
3. Verify `QUEUE_ENABLED=true` in .env

### Problem: "Jobs not processing"
**Check:**
1. Redis running? (`redis-cli ping`)
2. Backend running? (check port 5000)
3. Worker running? (check terminal)
4. Check Bull Board: http://localhost:5000/admin/queues

### Problem: "Jobs stuck in queue"
**Solution:**
```bash
redis-cli FLUSHALL
# Then restart services
```

---

## 📈 Monitoring Commands

### Check Redis Status
```bash
redis-cli ping          # Should return PONG
redis-cli INFO         # Full Redis info
redis-cli DBSIZE       # Number of keys
redis-cli FLUSHALL     # Clear everything
```

### Check Worker Logs
```bash
# In worker terminal, you'll see:
[Worker] Processing job X (attempt Y) for todo Z
[Worker] Fake email sent for todo...
[Worker] Job X completed with result...
[Worker] Job X failed on attempt...
```

### Check Queue Status
Visit: **http://localhost:5000/admin/queues**

---

## 🎯 Common Tasks

### Add New Job Type
1. Edit `backend/src/workers/todo.worker.ts`
2. Add new handler for job type
3. Edit `backend/src/queues/todo.queue.ts` to add job

### Change Retry Attempts
File: `backend/src/queues/todo.queue.ts` (line 31)
```typescript
attempts: 5,  // Change from 3 to 5
```

### Change Worker Concurrency
File: `backend/.env`
```env
WORKER_CONCURRENCY=10  # Change from 5 to 10
```

### Change Delay Duration
File: `backend/.env`
```env
TODO_JOB_DELAY_MS=10000  # 10 seconds instead of 5
```

### Monitor Without Dashboard
```bash
# Watch worker terminal output
npm run worker:dev

# Or use redis-cli to watch keys
redis-cli MONITOR
```

---

## 🌐 Important URLs

| URL | Purpose |
|-----|---------|
| http://localhost:5000/api/todos | API endpoint |
| http://localhost:5000/admin/queues | Bull Board dashboard |
| http://localhost:5173 | Frontend UI |

---

## 📊 Environment Variables Reference

```env
# Database (existing)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=todo_db
DB_USER=root
DB_PASSWORD=root1234

# Server (existing)
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Redis (NEW - for BullMQ)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# Queue (NEW)
QUEUE_ENABLED=true
WORKER_CONCURRENCY=5
TODO_JOB_DELAY_MS=5000
```

---

## 🔄 Docker Compose Commands

```bash
# Start everything
docker-compose up --build

# Start specific service
docker-compose up redis
docker-compose up backend
docker-compose up worker

# View logs
docker-compose logs -f backend
docker-compose logs -f worker

# Stop everything
docker-compose down

# Clean everything
docker-compose down -v
```

---

## 📱 API Quick Reference

### Create Todo (with background job)
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My todo",
    "description": "Optional description",
    "completed": false
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Todo created successfully",
  "data": {
    "id": 1,
    "title": "My todo",
    "completed": false,
    "createdAt": "2026-03-21T10:00:00.000Z"
  }
}
```

Job is now processing in background! ✅

---

## 🎓 Understanding the Queue

### What is a Queue?
A queue is a FIFO (First In First Out) storage that holds jobs waiting to be processed.

### Why Use Redis?
Redis is fast, persistent, and reliable for storing job data.

### How Does BullMQ Work?
```
1. Producer (API) → Add job to Redis queue
2. Redis queue → Stores job data
3. Worker → Polls queue for jobs
4. Worker → Processes job
5. Queue events → Notifies about completion/failure
```

### What is a Job?
A job is a unit of work with:
- Unique ID
- Data (title, description, etc)
- Retry count
- Status (waiting, active, completed, failed)
- Timestamps

---

## 📚 Need More Info?

- **Detailed Setup:** Read `BULLMQ_SETUP.md`
- **Implementation Details:** Read `IMPLEMENTATION_SUMMARY.md`
- **Official Docs:** https://docs.bullmq.io/
- **Bull Board:** https://github.com/felixmosh/bull-board

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Redis is running: `redis-cli ping` → PONG
- [ ] Backend started: Check port 5000
- [ ] Worker started: Check worker terminal logs
- [ ] API works: Create a todo via curl
- [ ] Job processed: Check worker logs for "Fake email sent"
- [ ] Dashboard works: Visit http://localhost:5000/admin/queues
- [ ] Retry works: Create todo with `[fail]` tag, see 3 retries
- [ ] Delay works: Create todo with `[delay]` tag, see 5-second wait

**All ✅? You're ready to go! 🚀**

