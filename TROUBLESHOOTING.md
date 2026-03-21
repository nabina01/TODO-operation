# Troubleshooting Guide

## Error: ECONNREFUSED 127.0.0.1:6379

### What This Means
Redis is not running, and you're trying to connect to port 6379 (Redis default port).

### How to Fix It

#### Solution 1: Disable Queue (Fastest)
If you don't need the BullMQ queue system, disable it:

1. Edit `backend/.env`:
```env
QUEUE_ENABLED=false
```

2. Restart the backend:
```bash
cd backend
npm run dev
```

#### Solution 2: Start Redis with Docker
If you want to use the queue system:

```bash
docker run --name redis -p 6379:6379 redis:7-alpine
```

Then start the backend:
```bash
cd backend
npm run dev
```

#### Solution 3: Use Microservices Instead
The new microservices don't need Redis. Just run:

```bash
cd services/api-gateway && npm run dev
cd services/todo-service && npm run dev
cd services/user-service && npm run dev
cd services/notification-service && npm run dev
```

---

## Error: EADDRINUSE (Port Already in Use)

### What This Means
Another process is using the port you're trying to start on (e.g., 5000, 5001, etc.)

### How to Fix It

#### Find and Kill Process
```bash
# Find what's using port 5000
lsof -i :5000

# Kill the process (replace PID with the actual process ID)
kill -9 <PID>
```

#### Use a Different Port
```bash
# Microservices - edit services/.env
GATEWAY_PORT=5005  # Changed from 5000

# Backend - edit backend/.env
PORT=5015  # Changed from 5010

# Then start the service
npm run dev
```

---

## Error: Cannot Find Module / Module Not Found

### What This Means
Dependencies are not installed.

### How to Fix It

```bash
# Navigate to the service directory
cd services/api-gateway

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Start the service
npm run dev
```

---

## Error: Service Not Responding / Connection Refused

### When Creating Todos (Service-to-Service Communication)

If Todo Service can't reach Notification Service:

```bash
# 1. Make sure all services are running
# Terminal 1
cd services/api-gateway && npm run dev

# Terminal 2
cd services/todo-service && npm run dev

# Terminal 3
cd services/notification-service && npm run dev

# 2. Check if services are up
curl http://localhost:5000/health/services

# Should return:
# {
#   "timestamp": "2024-03-21T10:30:45.123Z",
#   "services": {
#     "user-service": "ok",
#     "todo-service": "ok",
#     "notification-service": "ok"
#   }
# }
```

### Check Individual Service Health
```bash
# User Service
curl http://localhost:5001/health

# Todo Service
curl http://localhost:5002/health

# Notification Service
curl http://localhost:5003/health

# Each should return: {"status":"ok","service":"<name>"}
```

---

## Error: Cannot Migrate Database / DB_HOST Invalid

### What This Means
The database server is not running or not accessible.

### How to Fix It

#### Option 1: Start MySQL with Docker
```bash
docker run --name mysql \
  -e MYSQL_ROOT_PASSWORD=root1234 \
  -e MYSQL_DATABASE=todo_db \
  -p 3306:3306 \
  mysql:8

# Wait for MySQL to start (30 seconds)
sleep 30

# Then run migrations
cd backend
npm run migrate
npm run seed
```

#### Option 2: Use Docker Compose (Starts Everything)
```bash
docker-compose up -d

# Wait for services to start
sleep 15

# Check health
curl http://localhost:5000/health/services
```

#### Option 3: Skip Database (Microservices Only)
The microservices don't use a database. Run them without migrations:

```bash
cd services/api-gateway && npm run dev
```

---

## Error: ENOTFOUND (DNS Resolution Failed)

### When Service URLs Are Wrong

If you see errors like `ENOTFOUND todo-service` in the Todo Service logs:

1. Check `services/.env` has correct URLs:
```env
TODO_SERVICE_URL=http://localhost:5002
NOTIFICATION_SERVICE_URL=http://localhost:5003
```

2. Or if using Docker, use service names:
```env
TODO_SERVICE_URL=http://todo-service:5002
NOTIFICATION_SERVICE_URL=http://notification-service:5003
```

3. Restart the service:
```bash
npm run dev
```

---

## Error: CORS (Cross-Origin Resource Sharing)

### What This Means
Frontend can't connect to backend due to CORS policy.

### How to Fix It

1. Check the API Gateway has correct origins:
Edit `services/api-gateway/server.ts`:
```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080'
];
```

2. Or edit `services/.env`:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

3. Restart the API Gateway:
```bash
cd services/api-gateway
npm run dev
```

---

## Error: Timeout / Service Response Took Too Long

### What This Means
A service is taking longer than expected to respond (usually 5 seconds).

### How to Fix It

#### Check Service Logs
```bash
# Make sure the service is actually running
# Look for: "Server running on port XXXX"

# If not running, start it:
cd services/todo-service
npm run dev
```

#### Increase Timeout
Edit the service file that's calling another service (e.g., `services/todo-service/server.ts`):

```typescript
// Change timeout from 5000ms to 10000ms
axios.post(url, data, {
  timeout: 10000  // Changed from 5000
});
```

#### Check System Resources
If services are running but slow:
```bash
# Check CPU and memory usage
top

# Or on macOS
Activity Monitor
```

---

## Error: Docker Container Not Starting

### What This Means
A Docker container exited unexpectedly.

### How to Fix It

```bash
# Check logs for the container
docker logs api-gateway
docker logs todo-service
docker logs user-service
docker logs notification-service

# Or check all services
docker-compose logs

# Restart services
docker-compose down
docker-compose up -d
```

---

## Error: npm ERR! missing script: "dev"

### What This Means
The package.json doesn't have a "dev" script defined.

### How to Fix It

Make sure you're in the right directory:
```bash
# Wrong - missing services/
npm run dev

# Correct
cd services/api-gateway
npm run dev
```

Or check that package.json has the scripts section:
```json
{
  "scripts": {
    "dev": "ts-node server.ts",
    "start": "npm run build && node dist/server.js",
    "build": "tsc"
  }
}
```

---

## Checklist: Everything Working?

Run this to verify everything is set up correctly:

```bash
# 1. Check if services start without errors
# Terminal 1
cd services/api-gateway && npm install && npm run dev
# Expected: "Server running on port 5000"

# 2. Check health in another terminal
curl http://localhost:5000/health
# Expected: {"status":"ok","service":"api-gateway"}

# 3. Check all services health
curl http://localhost:5000/health/services
# Expected: All services showing "ok"

# 4. Create a user
curl -X POST http://localhost:5000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'
# Expected: 201 Created with user data

# 5. Create a todo
curl -X POST http://localhost:5000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Todo","userId":1}'
# Expected: 201 Created with todo data

# 6. Check notification was created
curl http://localhost:5000/notifications
# Expected: See the notification from step 5
```

If all these work, your microservices are set up correctly!

---

## Still Having Issues?

1. **Read the full documentation**:
   - `MICROSERVICES_QUICK_START.md` - Quick start guide
   - `MICROSERVICES_ARCHITECTURE.md` - Architecture details
   - `MICROSERVICES_STARTUP.md` - Startup instructions

2. **Check the logs**:
   - Look at the terminal where you started the service
   - Check for error messages
   - Look for port conflicts or connection errors

3. **Verify prerequisites**:
   - Node.js 16+ installed
   - npm installed
   - Ports 5000-5003 available (or change in .env)
   - Docker (if using Docker Compose)

4. **Try Docker Compose** (simplest approach):
   ```bash
   docker-compose up -d
   sleep 15
   curl http://localhost:5000/health/services
   ```

Most issues can be fixed by ensuring all services are running and ports are available!
