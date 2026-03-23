# Bonus Features - Quick Start Guide

## What Was Added

### 1. Docker Containerization ✓
Each microservice runs in a container. Start all with:
```bash
docker-compose up -d
```

### 2. Asynchronous Message Queue ✓
Services communicate via Redis/BullMQ. Todo creation triggers async notifications:
- Non-blocking (API responds in 2-3ms)
- Automatic retry (3 attempts)
- Delayed processing (1-5 seconds)

### 3. Service Registry & Config Management ✓
Centralized service discovery with health checks:
```bash
curl http://localhost:5000/registry/status
```

### 4. JWT Authentication ✓
Stateless auth across all services:

```bash
# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Use token
curl -X GET http://localhost:5000/todos \
  -H "Authorization: Bearer TOKEN_HERE"
```

---

## Feature Comparison

| Feature | Without | With |
|---------|---------|------|
| **Docker** | Manual setup per service | One command: `docker-compose up` |
| **Messaging** | HTTP only (blocking) | Queue + HTTP (non-blocking) |
| **Registry** | Hardcoded URLs | Auto-discovery + health checks |
| **Auth** | None | JWT + token validation |

---

## File Structure Added

```
services/
├── shared/
│   ├── auth.ts                 (JWT utilities)
│   ├── service-registry.ts     (Service discovery)
│   └── message-queue.ts        (BullMQ wrapper)
├── api-gateway/
│   ├── server.ts               (Updated with auth + registry)
│   └── package.json            (Added jsonwebtoken)
├── user-service/
│   ├── server.ts               (Added /auth/login endpoint)
│   └── package.json            (Added jsonwebtoken)
├── todo-service/
│   ├── server.ts               (Added message queue integration)
│   └── package.json            (Added bullmq, ioredis, jsonwebtoken)
├── notification-service/
│   └── package.json            (Added jsonwebtoken)
└── .env                         (Service configuration)

Documentation/
├── BONUS_FEATURES_DOCUMENTATION.md    (Complete guide - 689 lines)
└── BONUS_FEATURES_QUICK_START.md      (This file)
```

---

## Quick Start (5 minutes)

### Option 1: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# Wait 10 seconds for services to be ready
sleep 10

# Check health
curl http://localhost:5000/health/services

# Login
TOKEN=$(curl -s -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' | jq -r '.token')

# Create todo
curl -X POST http://localhost:5000/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Learn Bonus Features","userId":1}'

# Get todos
curl -X GET http://localhost:5000/todos \
  -H "Authorization: Bearer $TOKEN"
```

### Option 2: Local Development

```bash
# Terminal 1: Redis
docker run -p 6379:6379 redis:7-alpine

# Terminal 2: User Service
cd services/user-service && npm install && npm run dev

# Terminal 3: Todo Service (publishes to queue)
cd services/todo-service && npm install && npm run dev

# Terminal 4: Notification Service (consumes from queue)
cd services/notification-service && npm install && npm run dev

# Terminal 5: API Gateway (routes + auth)
cd services/api-gateway && npm install && npm run dev

# Terminal 6: Test
curl http://localhost:5000/health/services
```

---

## Testing Each Feature

### 1. Docker

```bash
# Start all
docker-compose up -d

# Check running
docker ps

# View logs
docker-compose logs -f api-gateway
```

### 2. Message Queue

```bash
# Monitor queue (logs in terminal)
docker logs todo-service

# Expected output when creating todo:
# [Todo Service] Todo-created event published to queue
# [Todo Service] Processing todo-created queue: ...
# [Todo Service] Notification sent via queue
```

### 3. Service Registry

```bash
# Check all services
curl http://localhost:5000/registry/status

# Response shows: user-service: "up", todo-service: "up", etc.

# Stop a service and check again
docker stop todo-service
curl http://localhost:5000/registry/status
# Now shows: todo-service: "down"
```

### 4. JWT Authentication

```bash
# Test protected endpoint without token
curl http://localhost:5000/todos
# Returns: 401 Unauthorized

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Response includes token

# Use token
curl http://localhost:5000/todos \
  -H "Authorization: Bearer eyJ..."
# Returns: todos data

# Verify token
curl http://localhost:5000/auth/verify \
  -H "Authorization: Bearer eyJ..."
# Returns: valid: true, user data
```

---

## Configuration

### Environment Variables (services/.env)

```env
# Service URLs (local dev)
USER_SERVICE_URL=http://localhost:5001
TODO_SERVICE_URL=http://localhost:5002
NOTIFICATION_SERVICE_URL=http://localhost:5003

# Service URLs (Docker)
USER_SERVICE_URL=http://user-service:5001
TODO_SERVICE_URL=http://todo-service:5002
NOTIFICATION_SERVICE_URL=http://notification-service:5003

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRY=24h

# Redis (for message queue)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Change JWT Secret

For production, change the secret:

```bash
# Edit services/.env
JWT_SECRET=your-own-secure-random-key-min-32-chars
```

---

## API Endpoints Summary

### Auth Endpoints
- `POST /auth/login` - Login (public)
- `GET /auth/verify` - Verify token (protected)
- `POST /auth/refresh` - Refresh token (public)
- `POST /auth/logout` - Logout (protected)

### User Endpoints
- `POST /users` - Register (public)
- `GET /users` - List (protected)
- `GET /users/:id` - Get (protected)
- `PUT /users/:id` - Update (protected)
- `DELETE /users/:id` - Delete (protected)

### Todo Endpoints
- `GET /todos` - List (protected)
- `POST /todos` - Create (protected, triggers queue)
- `GET /todos/:id` - Get (protected)
- `PUT /todos/:id` - Update (protected)
- `DELETE /todos/:id` - Delete (protected)

### Notification Endpoints
- `GET /notifications` - List (protected)
- `GET /notifications/:id` - Get (protected)
- `POST /notifications/:id/retry` - Retry (protected)
- `DELETE /notifications/:id` - Delete (protected)

### System Endpoints
- `GET /health` - Gateway health
- `GET /health/services` - All services health
- `GET /registry/status` - Service registry status
- `GET /queue/stats` - Message queue stats (if enabled)

---

## Monitoring

### Service Health

```bash
# All services
curl http://localhost:5000/health/services

# Individual service
curl http://localhost:5001/health
curl http://localhost:5002/health
curl http://localhost:5003/health
```

### Service Status

```bash
curl http://localhost:5000/registry/status
```

### Queue Stats

```bash
# When message queue is enabled
curl http://localhost:5000/queue/stats
```

---

## Common Tasks

### Generate Test Data

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' | jq -r '.token')

# Create 5 todos
for i in {1..5}; do
  curl -X POST http://localhost:5000/todos \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"title\":\"Todo $i\",\"userId\":1}"
  sleep 1
done
```

### Check Message Queue

```bash
# View todo-service logs
docker logs todo-service | grep -i queue

# Expected: "Todo-created event published to queue"
```

### Refresh Expired Token

```bash
# Get new token
curl -X POST http://localhost:5000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"token":"OLD_TOKEN"}'
```

---

## Troubleshooting

### Docker Services Won't Start

```bash
# Check Docker is running
docker ps

# Check logs
docker-compose logs api-gateway
docker-compose logs todo-service

# Rebuild images
docker-compose down
docker-compose build
docker-compose up -d
```

### Can't Login

```bash
# Check user-service is running
curl http://localhost:5001/health

# Try default credentials
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Check user-service logs
docker logs user-service
```

### Token Issues

```bash
# Verify token format
echo $TOKEN | jq . 2>/dev/null || echo "Invalid token"

# Check token is in header
curl -i http://localhost:5000/todos \
  -H "Authorization: Bearer $TOKEN"

# Check expiry
curl http://localhost:5000/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

### Message Queue Not Working

```bash
# Check Redis is running
docker ps | grep redis

# Start Redis if needed
docker run -d -p 6379:6379 redis:7-alpine

# Check todo-service logs
docker logs todo-service | grep -i queue

# Verify BullMQ is installed
npm list bullmq
```

---

## Next Steps

1. **Read Full Documentation**
   → `BONUS_FEATURES_DOCUMENTATION.md`

2. **Deploy to Production**
   → Configure JWT_SECRET and service URLs
   → Use environment-specific .env files
   → Enable HTTPS for all endpoints

3. **Add More Services**
   → Follow same pattern as existing services
   → Register in service registry
   → Create queue handlers if needed

4. **Monitor & Scale**
   → Set up logging (Winston, Morgan)
   → Add metrics (Prometheus)
   → Use Kubernetes for orchestration

---

## Key Differences from Before

| Before | After |
|--------|-------|
| No authentication | JWT auth on all endpoints |
| HTTP only | HTTP + Message Queue |
| Manual service URLs | Auto-discovery + registry |
| No health monitoring | Health checks every 30s |
| No retry logic | Auto-retry with backoff |
| No async processing | Queue-based async |

---

## Support

For detailed information:
- **Architecture**: See `BONUS_FEATURES_DOCUMENTATION.md`
- **API Reference**: See `MICROSERVICES_ARCHITECTURE.md`
- **Testing**: See `MICROSERVICES_TESTING_GUIDE.md`

For issues:
1. Check service health: `curl http://localhost:5000/health/services`
2. Check logs: `docker logs SERVICE_NAME`
3. Check registry: `curl http://localhost:5000/registry/status`
4. Read troubleshooting section above
