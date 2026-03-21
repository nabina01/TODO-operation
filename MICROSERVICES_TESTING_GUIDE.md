# Microservices Testing Guide

Complete guide to testing the microservices architecture.

## Table of Contents
1. [Unit Testing](#unit-testing)
2. [Service Testing](#service-testing)
3. [Integration Testing](#integration-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [Troubleshooting](#troubleshooting)

## Unit Testing

### Testing API Gateway Routes

**Test file**: `services/api-gateway/server.test.ts`

```typescript
import axios from 'axios';

describe('API Gateway', () => {
  const gateway = 'http://localhost:5000';

  test('should return health status', async () => {
    const response = await axios.get(`${gateway}/health`);
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('ok');
  });

  test('should forward user requests to User Service', async () => {
    const response = await axios.get(`${gateway}/users`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });
});
```

### Testing User Service

**Test file**: `services/user-service/server.test.ts`

```typescript
import axios from 'axios';

describe('User Service', () => {
  const service = 'http://localhost:5001';

  test('should create a user', async () => {
    const response = await axios.post(`${service}/users`, {
      name: 'Test User',
      email: 'test@example.com'
    });
    
    expect(response.status).toBe(201);
    expect(response.data.id).toBeDefined();
    expect(response.data.name).toBe('Test User');
  });

  test('should get user by id', async () => {
    const response = await axios.get(`${service}/users/1`);
    expect(response.status).toBe(200);
    expect(response.data.id).toBe(1);
  });

  test('should reject invalid user creation', async () => {
    try {
      await axios.post(`${service}/users`, { name: 'Invalid' });
      fail('Should have thrown error');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });
});
```

### Testing Todo Service

**Test file**: `services/todo-service/server.test.ts`

```typescript
import axios from 'axios';

describe('Todo Service', () => {
  const service = 'http://localhost:5002';

  test('should create a todo', async () => {
    const response = await axios.post(`${service}/todos`, {
      title: 'Test Todo',
      userId: 1,
      description: 'Test Description'
    });
    
    expect(response.status).toBe(201);
    expect(response.data.id).toBeDefined();
    expect(response.data.completed).toBe(false);
  });

  test('should get all todos', async () => {
    const response = await axios.get(`${service}/todos`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('should update todo completion', async () => {
    const response = await axios.put(`${service}/todos/1`, {
      completed: true
    });
    
    expect(response.status).toBe(200);
    expect(response.data.completed).toBe(true);
  });

  test('should delete todo', async () => {
    const response = await axios.delete(`${service}/todos/1`);
    expect(response.status).toBe(200);
  });
});
```

### Testing Notification Service

**Test file**: `services/notification-service/server.test.ts`

```typescript
import axios from 'axios';

describe('Notification Service', () => {
  const service = 'http://localhost:5003';

  test('should create a notification', async () => {
    const response = await axios.post(`${service}/notifications`, {
      type: 'todo-created',
      message: 'New todo created',
      todoId: 1,
      userId: 1
    });
    
    expect(response.status).toBe(201);
    expect(response.data.id).toBeDefined();
    expect(['sent', 'failed', 'pending']).toContain(response.data.status);
  });

  test('should retry failed notification', async () => {
    const response = await axios.post(`${service}/notifications/1/retry`);
    expect(response.status).toBe(200);
    expect(response.data.status).toBeDefined();
  });

  test('should get user notifications', async () => {
    const response = await axios.get(`${service}/notifications/user/1`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });
});
```

## Service Testing

### 1. Test Individual Service Startup

**In separate terminals**:

```bash
# Terminal 1: User Service
cd services/user-service
npm install
npm run dev

# Terminal 2: Verify startup
curl http://localhost:5001/health
# Expected: {"status":"ok","service":"user-service"}

# Terminal 3: Notification Service
cd services/notification-service
npm install
npm run dev

# Terminal 4: Verify startup
curl http://localhost:5003/health

# Terminal 5: Todo Service
cd services/todo-service
npm install
npm run dev

# Terminal 6: Verify startup
curl http://localhost:5002/health

# Terminal 7: API Gateway
cd services/api-gateway
npm install
npm run dev

# Terminal 8: Verify startup
curl http://localhost:5000/health
```

### 2. Test Service Endpoints

**Health Checks**:
```bash
# Individual service health
curl http://localhost:5000/health       # API Gateway
curl http://localhost:5001/health       # User Service
curl http://localhost:5002/health       # Todo Service
curl http://localhost:5003/health       # Notification Service

# All services health from gateway
curl http://localhost:5000/health/services
```

**Expected Response**:
```json
{
  "userService": {
    "status": "ok",
    "service": "user-service"
  },
  "todoService": {
    "status": "ok",
    "service": "todo-service"
  },
  "notificationService": {
    "status": "ok",
    "service": "notification-service"
  }
}
```

### 3. Test CRUD Operations

**User Service CRUD**:
```bash
# Create user
USER=$(curl -X POST http://localhost:5001/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}' 2>/dev/null | jq -r '.id')

echo "Created user: $USER"

# Get user
curl http://localhost:5001/users/$USER

# Update user
curl -X PUT http://localhost:5001/users/$USER \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"johndoe@example.com"}'

# Get all users
curl http://localhost:5001/users

# Delete user
curl -X DELETE http://localhost:5001/users/$USER
```

**Todo Service CRUD**:
```bash
# Create todo
TODO=$(curl -X POST http://localhost:5002/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Microservices","userId":1}' 2>/dev/null | jq -r '.id')

echo "Created todo: $TODO"

# Get todo
curl http://localhost:5002/todos/$TODO

# Update todo
curl -X PUT http://localhost:5002/todos/$TODO \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Get all todos
curl http://localhost:5002/todos

# Delete todo
curl -X DELETE http://localhost:5002/todos/$TODO
```

## Integration Testing

### 1. Service-to-Service Communication

**Test Scenario**: Create todo → Triggers notification

```bash
# Step 1: Verify Notification Service is running
curl http://localhost:5003/health

# Step 2: Get initial notification count
INIT_COUNT=$(curl http://localhost:5003/notifications 2>/dev/null | jq 'length')
echo "Initial notifications: $INIT_COUNT"

# Step 3: Create a todo (triggers notification)
curl -X POST http://localhost:5002/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Communication","userId":1}'

# Step 4: Wait a moment for notification to be processed
sleep 1

# Step 5: Check notifications increased
NEW_COUNT=$(curl http://localhost:5003/notifications 2>/dev/null | jq 'length')
echo "New notifications: $NEW_COUNT"

# Verify
if [ "$NEW_COUNT" -gt "$INIT_COUNT" ]; then
  echo "✓ Service communication works!"
else
  echo "✗ Service communication failed"
fi
```

### 2. API Gateway Routing

**Test all routes through gateway**:

```bash
# User endpoints through gateway
curl -X POST http://localhost:5000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Gateway Test","email":"gateway@test.com"}'

# Todo endpoints through gateway
curl -X POST http://localhost:5000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Gateway Test","userId":1}'

# Notification endpoints through gateway
curl http://localhost:5000/notifications

# Verify all responses come through gateway
curl http://localhost:5000/health/services
```

### 3. Error Handling Between Services

**Test when Notification Service is down**:

```bash
# 1. Stop notification service
docker-compose stop notification-service
# OR kill the process in local development

# 2. Create a todo
curl -X POST http://localhost:5002/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Error Handling","userId":1}'

# Expected: 201 Created (todo created despite notification failure)

# 3. Check todo was created
curl http://localhost:5002/todos

# 4. Check logs show graceful degradation
# Should see warning about notification service unreachable
```

### 4. Service Timeouts

**Test timeout handling**:

Create a slow endpoint in Notification Service and verify timeout:

```bash
# Add this to notification service for testing
app.post('/slow', async (req, res) => {
  await new Promise(resolve => setTimeout(resolve, 6000));
  res.json({ ok: true });
});

# Try to trigger slow endpoint from Todo Service
# Should timeout after 5 seconds
```

## End-to-End Testing

### 1. Docker Compose Test

```bash
# Start all services
docker-compose up -d

# Wait for services to start
sleep 10

# Test health
curl http://localhost:5000/health/services

# Create user
USER_ID=$(curl -X POST http://localhost:5000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"E2E Test","email":"e2e@test.com"}' 2>/dev/null | jq -r '.id')

echo "User ID: $USER_ID"

# Create todo
TODO_ID=$(curl -X POST http://localhost:5000/todos \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"E2E Test Todo\",\"userId\":$USER_ID}" 2>/dev/null | jq -r '.id')

echo "Todo ID: $TODO_ID"

# Verify notifications
NOTIFICATIONS=$(curl http://localhost:5000/notifications 2>/dev/null | jq 'length')
echo "Notifications: $NOTIFICATIONS"

# Update todo
curl -X PUT http://localhost:5000/todos/$TODO_ID \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Verify another notification
NOTIFICATIONS=$(curl http://localhost:5000/notifications 2>/dev/null | jq 'length')
echo "Notifications after update: $NOTIFICATIONS"

# Get user notifications
curl http://localhost:5000/notifications/user/$USER_ID

# Cleanup
docker-compose down
```

### 2. Load Testing

**Simple load test with wrk**:

```bash
# Install wrk (HTTP load testing tool)
brew install wrk  # macOS
apt-get install wrk  # Linux

# Test API Gateway
wrk -t4 -c100 -d30s http://localhost:5000/todos

# Test Todo Service directly
wrk -t4 -c100 -d30s http://localhost:5002/todos

# Test with concurrent requests
for i in {1..10}; do
  curl -X POST http://localhost:5000/todos \
    -H "Content-Type: application/json" \
    -d '{"title":"Load Test '$i'","userId":1}' &
done
wait

# Verify all todos created
curl http://localhost:5000/todos | jq 'length'
```

### 3. Chaos Engineering

**Test resilience**:

```bash
# 1. Kill a service randomly
docker-compose kill notification-service

# 2. Try to create todos
for i in {1..5}; do
  curl -X POST http://localhost:5000/todos \
    -H "Content-Type: application/json" \
    -d '{"title":"Chaos Test '$i'","userId":1}'
  echo ""
done

# 3. Verify todos still created
curl http://localhost:5000/todos

# 4. Restart service
docker-compose up -d notification-service

# 5. Check notifications can be sent now
curl -X POST http://localhost:5000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"After Recovery","userId":1}'
```

## Performance Testing

### Latency Measurement

```bash
# Single request latency
time curl http://localhost:5000/health

# Multiple requests
time for i in {1..100}; do
  curl http://localhost:5000/todos > /dev/null
done
```

### Throughput Testing

```bash
# Requests per second with Apache Bench
ab -n 1000 -c 10 http://localhost:5000/health

# With different concurrency levels
ab -n 1000 -c 50 http://localhost:5000/health
ab -n 1000 -c 100 http://localhost:5000/health
```

## Troubleshooting

### Service Won't Start

```bash
# Check port is available
lsof -i :5000
lsof -i :5001
lsof -i :5002
lsof -i :5003

# Kill conflicting process
kill -9 <PID>

# Check Node.js version
node --version  # Should be 18+

# Check npm packages installed
npm ls
```

### Connection Refused

```bash
# Verify service is running
curl http://localhost:5001/health

# Check service logs
docker-compose logs user-service

# Verify environment variables
echo $USER_SERVICE_URL
echo $TODO_SERVICE_URL
echo $NOTIFICATION_SERVICE_URL
```

### Notification Not Sent

```bash
# Check Notification Service is running
curl http://localhost:5003/health

# Check logs for errors
docker-compose logs -f notification-service

# Verify Todo Service can reach Notification Service
curl -X POST http://localhost:5002/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","userId":1}'

# Check notification was created
curl http://localhost:5003/notifications
```

### Timeout Issues

```bash
# Increase timeout in service config
# (default is 5000ms)

# Check network latency
ping localhost

# Use longer timeout for testing
curl --max-time 10 http://localhost:5000/todos
```

## Test Results Checklist

- [ ] All services start without errors
- [ ] Health checks pass for all services
- [ ] API Gateway routes to correct services
- [ ] User CRUD operations work
- [ ] Todo CRUD operations work
- [ ] Notifications are created when todos are created
- [ ] Service-to-service communication works
- [ ] Error handling works (service fails gracefully)
- [ ] Docker Compose deployment works
- [ ] Load testing shows acceptable latency
- [ ] Timeouts are handled correctly
- [ ] Logs show appropriate messages

## Next Steps

After testing:
1. Add unit tests to each service
2. Set up CI/CD pipeline
3. Deploy to staging environment
4. Run smoke tests in staging
5. Deploy to production
6. Monitor in production

Happy testing!
