# Bonus Features Implementation Guide

## Overview

This document covers the four bonus features implemented in the microservices architecture:

1. **Docker Containerization** - Each service runs in its own container
2. **Asynchronous Communication with Message Queue** - Using BullMQ and Redis
3. **Service Registry & Config Management** - Centralized service discovery
4. **JWT Authentication** - Shared authentication across all services

---

## 1. Docker Containerization

### What It Does

Each microservice runs in its own Docker container, ensuring isolation and scalability. Services can be deployed independently and communicate over the network.

### Architecture

```
Docker Containers:
├── api-gateway:5000       (Reverse proxy, routing, auth)
├── user-service:5001      (User management)
├── todo-service:5002      (Todo management)
├── notification-service:5003 (Notifications)
├── mysql:3307             (Database)
└── redis:6379             (Message broker)
```

### How to Use Docker

#### Start All Services

```bash
docker-compose up -d
```

This starts:
- API Gateway on port 5000
- User Service on port 5001
- Todo Service on port 5002
- Notification Service on port 5003
- MySQL database
- Redis message broker

#### View Logs

```bash
docker-compose logs -f api-gateway
docker-compose logs -f todo-service
```

#### Stop Services

```bash
docker-compose down
```

### Docker Files Structure

Each service has its own Dockerfile:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

---

## 2. Asynchronous Communication with Message Queue

### What It Does

Services communicate asynchronously using BullMQ (a job queue library) with Redis as the message broker. This enables:
- Non-blocking operations (API returns immediately)
- Retry logic for failed messages
- Delayed message processing
- Message persistence and monitoring

### How It Works

#### Flow

```
Todo Service (POST /todos)
    ↓
1. Create todo in memory/database
2. Publish to Redis queue: "todo-created"
3. Return 201 response immediately
    ↓
Background Worker
    ↓
1. Monitor "todo-created" queue
2. Retrieve message from queue
3. Send notification via Notification Service
4. Mark job as completed
5. If fails, retry (3x with exponential backoff)
```

### Implementation

#### 1. Message Queue Initialization (shared/message-queue.ts)

```typescript
// Create and register a queue
messageQueue.createQueue('todo-created');

// Register handler for messages
messageQueue.registerHandler('todo-created', async (job) => {
  const { title, userId } = job.data.payload;
  console.log(`Processing todo: ${title}`);
  
  // Send notification
  await notifyUser(userId, title);
});
```

#### 2. Publishing Messages (Todo Service)

```typescript
// Publish message to queue
await messageQueue.publish('todo-created', {
  type: 'todo-created',
  payload: {
    title,
    userId,
    todoId: newTodo.id
  },
  timestamp: new Date()
}, {
  delay: 1000,      // Process after 1 second
  priority: 'normal'
});
```

#### 3. Handling Messages (Background Worker)

The registered handler automatically processes messages:

```typescript
// Handler registered in server initialization
messageQueue.registerHandler('todo-created', async (job) => {
  // This runs automatically when message is published
  console.log('Processing:', job.data);
});
```

### Queue Configuration

Located in `services/shared/message-queue.ts`:

- **Attempts**: 3 retries on failure
- **Backoff**: Exponential (2 seconds between attempts)
- **Cleanup**: Completed jobs removed after 1 hour
- **Failed Jobs**: Kept for 24 hours for debugging

### Monitoring

Get queue statistics:

```bash
curl http://localhost:5000/queue/stats
```

Response:
```json
{
  "todo-created": {
    "waiting": 5,
    "active": 2,
    "completed": 100,
    "failed": 3
  }
}
```

---

## 3. Service Registry & Config Management

### What It Does

A centralized registry that:
- Tracks all running services and their URLs
- Performs periodic health checks
- Reports service status
- Provides automatic failover information

### How It Works

#### Service Registration

Services are registered on API Gateway startup:

```typescript
// In api-gateway/server.ts
initializeServiceRegistry();

// Registers:
// - user-service at http://localhost:5001
// - todo-service at http://localhost:5002
// - notification-service at http://localhost:5003
```

#### Health Checking

```typescript
// Automatic health checks every 30 seconds
serviceRegistry.startHealthChecks(30000);

// Manual health check
const isHealthy = await serviceRegistry.checkHealth('todo-service');

// Check all services
const allStatus = await serviceRegistry.checkAllHealth();
```

#### Registry Status Endpoint

```bash
curl http://localhost:5000/registry/status
```

Response:
```json
{
  "status": "ok",
  "registry": {
    "user-service": "up",
    "todo-service": "up",
    "notification-service": "up"
  },
  "services": [
    {
      "name": "user-service",
      "url": "http://localhost:5001",
      "healthCheck": "/health",
      "lastCheck": "2024-01-15T10:30:45.123Z"
    },
    // ... more services
  ]
}
```

### Service Configuration

Environment variables control service URLs:

```env
# services/.env
USER_SERVICE_URL=http://localhost:5001
TODO_SERVICE_URL=http://localhost:5002
NOTIFICATION_SERVICE_URL=http://localhost:5003
```

For Docker:
```env
USER_SERVICE_URL=http://user-service:5001
TODO_SERVICE_URL=http://todo-service:5002
NOTIFICATION_SERVICE_URL=http://notification-service:5003
```

### Service Registry Interface

```typescript
interface ServiceConfig {
  name: string;
  url: string;
  port: number;
  timeout: number;
  retries: number;
  healthCheckPath: string;
  status?: 'up' | 'down' | 'unknown';
  lastHealthCheck?: Date;
}
```

---

## 4. JWT Authentication

### What It Does

Implements stateless JWT-based authentication shared across all microservices:
- Users authenticate once (get token)
- Token is sent with each request
- Each service validates the token independently
- No session storage needed

### How It Works

#### Authentication Flow

```
1. User Login
   POST /auth/login
   Body: { email: "user@example.com", password: "password" }
   ↓
2. User Service validates credentials
   ↓
3. API Gateway generates JWT token
   Token contains: { userId, email, name, exp }
   ↓
4. Return token to client
   Response: { user: {...}, token: "eyJhbGc..." }
   ↓
5. Client stores token (localStorage/sessionStorage)
   ↓
6. Subsequent Requests
   Header: Authorization: Bearer eyJhbGc...
   ↓
7. API Gateway validates token
   ↓
8. API Gateway forwards to service with token
   ↓
9. Service validates token independently
   ↓
10. Return protected resource
```

### Implementation

#### 1. JWT Utilities (services/shared/auth.ts)

```typescript
// Generate token
const token = generateToken({
  userId: 1,
  email: 'user@example.com',
  name: 'John Doe'
});

// Verify token
const payload = verifyToken(token);

// Middleware - require authentication
app.get('/protected', authMiddleware, (req, res) => {
  console.log(req.user); // { userId: 1, email: '...', name: '...' }
  res.json({ message: 'Access granted' });
});

// Optional authentication
app.get('/public', optionalAuthMiddleware, (req, res) => {
  if (req.user) {
    res.json({ message: 'Welcome back', user: req.user });
  } else {
    res.json({ message: 'Welcome guest' });
  }
});
```

#### 2. Login Endpoint (User Service)

```typescript
app.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // Validate credentials
  const user = validateUser(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Return user (API Gateway will generate JWT)
  res.json({ 
    user: { id: user.id, name: user.name, email: user.email },
    message: 'Login successful'
  });
});
```

#### 3. Token Verification (API Gateway)

```typescript
// POST /auth/login
app.post('/auth/login', async (req, res) => {
  // Forward to user service
  const response = await axios.post(`${USER_SERVICE_URL}/auth/login`, req.body);
  
  // Generate JWT
  const token = generateToken({
    userId: response.data.user.id,
    email: response.data.user.email,
    name: response.data.user.name
  });
  
  // Return with token
  res.json({ ...response.data, token });
});

// Verify token
app.get('/auth/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Refresh token
app.post('/auth/refresh', (req, res) => {
  const { token } = req.body;
  const payload = jwt.verify(token, JWT_SECRET);
  
  const newToken = generateToken({
    userId: payload.userId,
    email: payload.email,
    name: payload.name
  });
  
  res.json({ token: newToken });
});
```

#### 4. Protected Routes (All Services)

```typescript
// In API Gateway
app.get('/todos', authMiddleware, async (req, res) => {
  // Forward request with Authorization header
  const response = await axios.get(`${TODO_SERVICE_URL}/todos`, {
    headers: { 'Authorization': req.headers.authorization }
  });
  res.json(response.data);
});

// In Todo Service
app.get('/todos', authMiddleware, (req, res) => {
  // req.user is set by middleware
  const userId = req.user.userId;
  const userTodos = todos.filter(t => t.userId === userId);
  res.json(userTodos);
});
```

### Token Format

JWT contains three parts (header.payload.signature):

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "userId": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "iat": 1705316400,
  "exp": 1705402800
}
```

**Configuration:**
- **Secret**: `JWT_SECRET` environment variable
- **Expiry**: 24 hours (configurable)
- **Algorithm**: HS256 (HMAC with SHA-256)

### Security Configuration

```env
# services/.env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=24h
```

**Important**: Change the default JWT_SECRET in production!

### API Endpoints

#### Public Endpoints (No Auth Required)
- `POST /auth/login` - User login
- `POST /users` - User registration
- `POST /notifications` - Internal service only

#### Protected Endpoints (Auth Required)
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /todos` - List todos
- `POST /todos` - Create todo
- `PUT /todos/:id` - Update todo
- `DELETE /todos/:id` - Delete todo
- `GET /notifications` - List notifications
- `POST /notifications/:id/retry` - Retry notification

### Testing Authentication

#### 1. Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Response:
# {
#   "user": { "id": 1, "name": "John Doe", "email": "john@example.com" },
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "message": "Login successful"
# }
```

#### 2. Store Token
```javascript
// In browser
const token = response.data.token;
localStorage.setItem('authToken', token);
```

#### 3. Use Token in Requests
```bash
curl -X GET http://localhost:5000/todos \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Or with JavaScript
fetch('http://localhost:5000/todos', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

#### 4. Verify Token
```bash
curl -X GET http://localhost:5000/auth/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Response:
# {
#   "valid": true,
#   "user": {
#     "userId": 1,
#     "email": "john@example.com",
#     "name": "John Doe"
#   }
# }
```

#### 5. Refresh Token
```bash
curl -X POST http://localhost:5000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'

# Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# }
```

---

## Complete Integration Example

### Register and Create Todo

```bash
# 1. Register user
curl -X POST http://localhost:5000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com"
  }'

# 2. Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }' > login.json

# Extract token
TOKEN=$(jq -r '.token' login.json)

# 3. Create todo (protected - requires auth)
curl -X POST http://localhost:5000/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Learn Microservices",
    "userId": 1
  }'

# 4. Get todos (protected)
curl -X GET http://localhost:5000/todos \
  -H "Authorization: Bearer $TOKEN"

# 5. Verify token
curl -X GET http://localhost:5000/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

---

## Troubleshooting

### Issue: Service Not Found (ECONNREFUSED)

**Cause**: Service is not running or wrong port

**Solution**:
```bash
# Check running services
docker ps

# Check service health
curl http://localhost:5000/health/services

# Check registry status
curl http://localhost:5000/registry/status
```

### Issue: Redis Connection Error

**Cause**: Redis is not running

**Solution**:
```bash
# Start Redis
docker run -p 6379:6379 redis:7-alpine

# Or via docker-compose
docker-compose up redis -d
```

### Issue: Invalid Token

**Cause**: Token expired or malformed

**Solution**:
```bash
# Refresh token
curl -X POST http://localhost:5000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"token": "expired_token"}'

# Or login again
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

### Issue: Queue Jobs Not Processing

**Cause**: Message queue not initialized

**Solution**:
```bash
# Check queue status
curl http://localhost:5000/queue/stats

# Verify Redis is running
docker logs todo-redis

# Check todo service logs
docker logs todo-service
```

---

## Summary

The four bonus features provide:

1. **Docker**: Isolated, scalable, deployment-ready containers
2. **Message Queue**: Non-blocking async communication with reliability
3. **Service Registry**: Automatic service discovery and monitoring
4. **JWT Auth**: Stateless, secure, cross-service authentication

Together, these features make the microservices architecture production-ready and enterprise-grade.
