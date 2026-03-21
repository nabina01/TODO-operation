# Microservices - Quick Startup Guide

## The Problem

You got an error: `Error: connect ECONNREFUSED 127.0.0.1:6379`

This means Redis is not running. The old backend tries to connect to Redis for the BullMQ queue system, but it's not necessary for the **new microservices**.

## The Solution

You have **THREE OPTIONS**:

---

## Option 1: Run Only Microservices (RECOMMENDED)

The new microservices architecture is **standalone** and doesn't need Redis.

### Step 1: Start API Gateway
```bash
cd services/api-gateway
npm install
npm run dev
```

This will start on **http://localhost:5000**

### Step 2: Start Todo Service (New Terminal)
```bash
cd services/todo-service
npm install
npm run dev
```

This will start on **http://localhost:5002**

### Step 3: Start User Service (New Terminal)
```bash
cd services/user-service
npm install
npm run dev
```

This will start on **http://localhost:5001**

### Step 4: Start Notification Service (New Terminal)
```bash
cd services/notification-service
npm install
npm run dev
```

This will start on **http://localhost:5003**

### Test It
```bash
# Create a user
curl -X POST http://localhost:5000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# Create a todo (triggers notification)
curl -X POST http://localhost:5000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Microservices","userId":1}'

# Check health
curl http://localhost:5000/health/services
```

---

## Option 2: Run Everything with Docker Compose (EASIEST)

```bash
# Start all services at once
docker-compose up -d

# Wait 10 seconds for startup
sleep 10

# Check health
curl http://localhost:5000/health/services

# Create a user
curl -X POST http://localhost:5000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

The old backend will run on port 5010 (without queue) and the microservices on 5000.

---

## Option 3: Run Old Backend WITH Redis

If you want to use the old backend with BullMQ queue system:

### Step 1: Start Redis
```bash
# Using Docker
docker run --name redis -p 6379:6379 redis:7-alpine

# Or if you have Redis installed locally
redis-server
```

### Step 2: Disable Queue in Development
Create `backend/.env`:
```env
QUEUE_ENABLED=false
NODE_ENV=development
```

### Step 3: Start Backend
```bash
cd backend
npm run dev
```

This disables the queue system that requires Redis.

---

## What Each Service Does

### API Gateway (Port 5000)
- Central entry point for all requests
- Routes to User, Todo, or Notification service
- Provides `/health/services` endpoint to check all services

### User Service (Port 5001)
- Manages users
- Endpoints: GET/POST/PUT/DELETE /users

### Todo Service (Port 5002)
- Manages todos
- When a todo is created, it automatically notifies the Notification Service
- Endpoints: GET/POST/PUT/DELETE /todos

### Notification Service (Port 5003)
- Receives notifications from Todo Service
- Logs notifications (simulated email/SMS)
- Endpoints: GET/POST /notifications

---

## Which Option Should I Use?

| Option | Use When | Setup Time | Best For |
|--------|----------|-----------|----------|
| **Option 1 (Microservices only)** | You want to test the new architecture | 2 minutes | Development & testing |
| **Option 2 (Docker Compose)** | You want everything in one command | 3 minutes | Production-like setup |
| **Option 3 (Old backend + Redis)** | You want the queue system | 5 minutes | Testing BullMQ features |

**RECOMMENDED**: Start with **Option 1** (Microservices only) - it's the fastest and cleanest.

---

## Troubleshooting

### Port Already in Use
```bash
# Find what's using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Dependencies Not Installed
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Service Not Responding
```bash
# Check if service is running
curl http://localhost:5001/health

# Should return
# {"status":"ok","service":"user-service"}
```

### Redis Connection Error
If you see `ECONNREFUSED 127.0.0.1:6379`:
- You're trying to use the old backend which needs Redis
- Either: Start Redis with `docker run -p 6379:6379 redis:7-alpine`
- Or: Switch to microservices-only (Option 1)

---

## Next Steps

1. Choose your option above
2. Run the services
3. Test with curl commands
4. Check the full documentation:
   - `MICROSERVICES_ARCHITECTURE.md` - Detailed architecture
   - `MICROSERVICES_TESTING_GUIDE.md` - Testing scenarios
   - `MICROSERVICES_QUICK_START.md` - Quick reference

Good luck! The microservices are ready to use.
