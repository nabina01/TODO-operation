# Microservices Architecture Guide

## Overview

This document outlines the refactored microservices-based architecture for the Todo application. The system has been designed to separate concerns into independent, scalable services that communicate via HTTP.

## Architecture Diagram

```
┌─────────────────┐
│    Frontend     │
│   (React)       │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────┐
│     API Gateway (Port 5000)      │
│  - Routes traffic to services    │
│  - Request/Response handling     │
│  - Error handling & logging      │
└──────────────────────────────────┘
         │
    ┌────┼────────┬────────────┐
    │    │        │            │
    ▼    ▼        ▼            ▼
┌──────────────────┐  ┌──────────────────┐
│ User Service     │  │ Todo Service     │
│ (Port 5001)      │  │ (Port 5002)      │
│ - User CRUD      │  │ - Todo CRUD      │
│ - User lookup    │  │ - Trigger notify │
└──────────────────┘  └──────────────────┘
                      │
                      ▼
                 ┌──────────────────────┐
                 │Notification Service  │
                 │ (Port 5003)          │
                 │ - Send notifications │
                 │ - Track events       │
                 └──────────────────────┘
```

## Services Overview

### 1. API Gateway (Port 5000)

**Purpose**: Single entry point for all client requests. Routes traffic to appropriate microservices.

**Responsibilities**:
- Route incoming requests to correct service
- Handle error responses from services
- Provide unified logging
- Health checks for all services
- CORS handling

**Key Endpoints**:
```
GET    /health              - Gateway health status
GET    /health/services     - All services health status
GET    /users               - Forward to User Service
POST   /users               - Forward to User Service
GET    /todos               - Forward to Todo Service
POST   /todos               - Forward to Todo Service
GET    /notifications       - Forward to Notification Service
```

**Environment Variables**:
```
GATEWAY_PORT=5000
USER_SERVICE_URL=http://localhost:5001
TODO_SERVICE_URL=http://localhost:5002
NOTIFICATION_SERVICE_URL=http://localhost:5003
ALLOWED_ORIGINS=http://localhost:5173,http://frontend
```

### 2. User Service (Port 5001)

**Purpose**: Manages user data and operations.

**Responsibilities**:
- Create, read, update, delete users
- User validation
- User lookup (for other services)

**API Endpoints**:
```
GET    /health              - Service health status
GET    /users               - Get all users
GET    /users/:id           - Get specific user
POST   /users               - Create new user
PUT    /users/:id           - Update user
DELETE /users/:id           - Delete user
```

**Request/Response Examples**:
```bash
# Create user
curl -X POST http://localhost:5001/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# Get user
curl http://localhost:5001/users/1
```

**Environment Variables**:
```
USER_SERVICE_PORT=5001
ALLOWED_ORIGINS=http://localhost:5000,http://api-gateway
```

### 3. Todo Service (Port 5002)

**Purpose**: Manages todo items and orchestrates notifications.

**Responsibilities**:
- Create, read, update, delete todos
- Trigger notifications when todos change
- Service-to-service communication with Notification Service
- Error handling for notification failures

**API Endpoints**:
```
GET    /health              - Service health status
GET    /todos               - Get all todos
GET    /todos/:id           - Get specific todo
POST   /todos               - Create new todo
PUT    /todos/:id           - Update todo
DELETE /todos/:id           - Delete todo
```

**Service-to-Service Communication**:
The Todo Service communicates with the Notification Service via HTTP POST requests.

```typescript
// When a todo is created
await axios.post(`${NOTIFICATION_SERVICE_URL}/notifications`, {
  type: 'todo-created',
  message: `New todo: "${title}"`,
  todoId: newTodo.id,
  userId: newTodo.userId
});
```

**Request/Response Examples**:
```bash
# Create todo
curl -X POST http://localhost:5002/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","userId":1,"description":"Milk, bread, eggs"}'

# Update todo
curl -X PUT http://localhost:5002/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

**Environment Variables**:
```
TODO_SERVICE_PORT=5002
NOTIFICATION_SERVICE_URL=http://localhost:5003
ALLOWED_ORIGINS=http://localhost:5000,http://api-gateway
```

### 4. Notification Service (Port 5003)

**Purpose**: Handles all notification operations.

**Responsibilities**:
- Receive notifications from other services
- Process and log notifications
- Simulate sending emails/SMS/push notifications
- Track notification status (pending/sent/failed)
- Provide retry mechanism

**API Endpoints**:
```
GET    /health                    - Service health status
GET    /notifications             - Get all notifications
GET    /notifications/:id         - Get specific notification
POST   /notifications             - Create/receive notification
POST   /notifications/:id/retry   - Retry failed notification
GET    /notifications/user/:userId - Get user notifications
GET    /notifications/status/:status - Get notifications by status
DELETE /notifications/:id         - Delete notification
```

**Request/Response Examples**:
```bash
# Create notification (called by Todo Service)
curl -X POST http://localhost:5003/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "type":"todo-created",
    "message":"New todo created",
    "todoId":1,
    "userId":1
  }'

# Retry failed notification
curl -X POST http://localhost:5003/notifications/1/retry

# Get user notifications
curl http://localhost:5003/notifications/user/1
```

**Environment Variables**:
```
NOTIFICATION_SERVICE_PORT=5003
ALLOWED_ORIGINS=http://localhost:5000,http://api-gateway
```

## Service-to-Service Communication

### Communication Pattern

Services communicate via HTTP using Axios library. This provides:
- Reliability: TCP/IP connection
- Timeout handling: 5 second timeout by default
- Error handling: Graceful degradation if services are unavailable
- Logging: All requests logged for debugging

### Error Handling

Each service implements error handling for outbound requests:

```typescript
try {
  await axios.post(`${NOTIFICATION_SERVICE_URL}/notifications`, {
    type: 'todo-created',
    message: `New todo: "${title}"`,
    todoId: newTodo.id,
    userId: newTodo.userId
  }, {
    timeout: 5000
  });
} catch (error) {
  console.warn('Notification service unreachable, continuing anyway');
  // Don't block the main operation if notification fails
}
```

### Service Dependency Graph

```
API Gateway
├── User Service (independent)
├── Todo Service
│   └── Notification Service (async, non-blocking)
└── Notification Service (independent)
```

Note: Todo Service depends on Notification Service for async notifications, but failures don't block todo operations.

## Running the Microservices

### Option 1: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- API Gateway: http://localhost:5000
- User Service: http://localhost:5001
- Todo Service: http://localhost:5002
- Notification Service: http://localhost:5003

### Option 2: Local Development

#### Terminal 1: User Service
```bash
cd services/user-service
npm install
npm run dev
# Runs on port 5001
```

#### Terminal 2: Notification Service
```bash
cd services/notification-service
npm install
npm run dev
# Runs on port 5003
```

#### Terminal 3: Todo Service
```bash
cd services/todo-service
npm install
npm run dev
# Runs on port 5002
```

#### Terminal 4: API Gateway
```bash
cd services/api-gateway
npm install
npm run dev
# Runs on port 5000
```

#### Terminal 5: Frontend (Optional)
```bash
cd frontend
npm install
npm run dev
# Runs on port 5173
```

## Testing the Services

### Health Check
```bash
# Check all services
curl http://localhost:5000/health/services

# Response:
# {
#   "userService": { "status": "ok", "service": "user-service" },
#   "todoService": { "status": "ok", "service": "todo-service" },
#   "notificationService": { "status": "ok", "service": "notification-service" }
# }
```

### Create and Trigger Notifications

```bash
# 1. Create a user
curl -X POST http://localhost:5000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com"}'

# Response: {"id":1,"name":"Alice","email":"alice@example.com","createdAt":"2026-03-21T..."}

# 2. Create a todo (will trigger notification)
curl -X POST http://localhost:5000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Microservices","userId":1,"description":"Study service patterns"}'

# Response: {"id":1,"title":"Learn Microservices","userId":1,...}

# 3. Check notifications (some will be sent, some might fail)
curl http://localhost:5000/notifications

# 4. Update todo (triggers another notification)
curl -X PUT http://localhost:5000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# 5. Check notifications again
curl http://localhost:5000/notifications

# 6. Retry failed notifications
curl -X POST http://localhost:5000/notifications/1/retry
```

## Environment Configuration

### .env Files

Each service needs an `.env` file. Copy from `.env.example`:

```bash
# In services directory
cp .env.example .env
```

Then update for your environment:
```env
# API Gateway
GATEWAY_PORT=5000
USER_SERVICE_URL=http://localhost:5001
TODO_SERVICE_URL=http://localhost:5002
NOTIFICATION_SERVICE_URL=http://localhost:5003

# User Service
USER_SERVICE_PORT=5001

# Todo Service
TODO_SERVICE_PORT=5002
NOTIFICATION_SERVICE_URL=http://localhost:5003

# Notification Service
NOTIFICATION_SERVICE_PORT=5003

# All Services
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Monitoring and Logging

### Logging

All services log their operations:
```
[API Gateway] Forwarding GET /todos to Todo Service
[Todo Service] Todo created: { id: 1, title: "..." }
[Notification Service] Processing todo-created notification for user 1
```

Monitor logs with:
```bash
# Docker
docker-compose logs -f

# Local
# Each service logs to its own terminal
```

### Health Checks

The API Gateway provides health status for all services:
```bash
curl http://localhost:5000/health/services
```

## Scaling Considerations

### Current Architecture
- Each service runs independently
- No load balancing (single instance per service)
- In-memory storage (perfect for demo)

### For Production
- Use database for persistent storage
- Implement load balancing (Nginx, HAProxy)
- Add message queue (RabbitMQ, Kafka) for async communication
- Implement circuit breaker pattern for resilience
- Add distributed tracing (Jaeger, Zipkin)
- Container orchestration (Kubernetes)

## Adding New Services

To add a new microservice:

1. Create service directory:
```bash
mkdir services/new-service
cd services/new-service
```

2. Copy structure from existing service:
```bash
cp -r ../user-service/* .
```

3. Update `package.json` with service name and dependencies

4. Update `server.ts` with service-specific endpoints

5. Create `Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5004
CMD ["npm", "start"]
```

6. Update `docker-compose.yml`:
```yaml
new-service:
  build: ./services/new-service
  container_name: new-service
  ports:
    - "5004:5004"
  environment:
    - NEW_SERVICE_PORT=5004
  command: npm start
```

7. Update API Gateway to route to new service

8. Set environment variables for new service URL

## Troubleshooting

### Service Connection Issues

**Problem**: "Cannot connect to Todo Service"

**Solution**:
1. Check service is running: `curl http://localhost:5002/health`
2. Check environment variables in API Gateway
3. Check firewall/network settings
4. View service logs: `docker-compose logs todo-service`

### Notification Service Unreachable

**Problem**: Todos created but notifications not sent

**Solution**:
1. Verify Notification Service is running
2. Check connection string in Todo Service environment
3. Check for timeout issues (increase timeout in axios call)
4. Verify CORS settings allow cross-service communication

### Port Already in Use

**Problem**: "Port 5000 already in use"

**Solution**:
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port in .env
GATEWAY_PORT=5001
```

### Docker Build Issues

**Problem**: "Build failed for api-gateway"

**Solution**:
1. Check Dockerfile syntax
2. Verify package.json exists
3. Try building locally first:
```bash
cd services/api-gateway
npm install
npm run build
```

## Summary

This microservices architecture provides:
- **Separation of Concerns**: Each service has a single responsibility
- **Independent Deployment**: Services can be deployed separately
- **Scalability**: Services can be scaled independently
- **Resilience**: Service failures don't cascade
- **Easy Testing**: Services can be tested in isolation
- **Clear Communication**: HTTP-based service-to-service communication

For more details on individual services, see their respective documentation files.
