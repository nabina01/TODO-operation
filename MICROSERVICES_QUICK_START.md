# Microservices Quick Start Guide

Get the microservices up and running in 5 minutes!

## Option 1: Docker Compose (Fastest)

### Prerequisites
- Docker installed
- Docker Compose installed

### Steps

1. **Start all services**
```bash
docker-compose up -d
```

2. **Verify services are running**
```bash
# Wait 10 seconds for services to start
sleep 10

# Check health
curl http://localhost:5000/health/services
```

3. **Test the system**
```bash
# Create a user
curl -X POST http://localhost:5000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'

# Create a todo (this will trigger a notification)
curl -X POST http://localhost:5000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"First Todo","userId":1,"description":"Testing microservices"}'

# View todos
curl http://localhost:5000/todos

# View notifications
curl http://localhost:5000/notifications
```

4. **View logs**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway
docker-compose logs -f todo-service
```

5. **Stop services**
```bash
docker-compose down
```

## Option 2: Local Development (More Control)

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Steps

**Terminal 1: User Service**
```bash
cd services/user-service
npm install
npm run dev
# Runs on http://localhost:5001
```

**Terminal 2: Notification Service**
```bash
cd services/notification-service
npm install
npm run dev
# Runs on http://localhost:5003
```

**Terminal 3: Todo Service**
```bash
cd services/todo-service
npm install
npm run dev
# Runs on http://localhost:5002
```

**Terminal 4: API Gateway**
```bash
cd services/api-gateway
npm install
npm run dev
# Runs on http://localhost:5000
```

**Terminal 5: Test**
```bash
# Create user
curl -X POST http://localhost:5000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'

# Create todo
curl -X POST http://localhost:5000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Microservices","userId":1}'

# View notifications
curl http://localhost:5000/notifications
```

## Service Ports Reference

| Service | Port | URL |
|---------|------|-----|
| API Gateway | 5000 | http://localhost:5000 |
| User Service | 5001 | http://localhost:5001 |
| Todo Service | 5002 | http://localhost:5002 |
| Notification Service | 5003 | http://localhost:5003 |

## Health Checks

### Gateway Health
```bash
curl http://localhost:5000/health
# {"status":"ok","service":"api-gateway"}
```

### All Services Health
```bash
curl http://localhost:5000/health/services
# {
#   "userService": {"status":"ok","service":"user-service"},
#   "todoService": {"status":"ok","service":"todo-service"},
#   "notificationService": {"status":"ok","service":"notification-service"}
# }
```

## Common Tasks

### Create User
```bash
curl -X POST http://localhost:5000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com"}'
```

### Create Todo
```bash
curl -X POST http://localhost:5000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","userId":1}'
```

### Get All Todos
```bash
curl http://localhost:5000/todos
```

### Update Todo
```bash
curl -X PUT http://localhost:5000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

### Delete Todo
```bash
curl -X DELETE http://localhost:5000/todos/1
```

### Get Notifications
```bash
curl http://localhost:5000/notifications
```

### Get User Notifications
```bash
curl http://localhost:5000/notifications/user/1
```

### Retry Failed Notification
```bash
curl -X POST http://localhost:5000/notifications/1/retry
```

## Architecture Overview

```
Client → API Gateway → User/Todo/Notification Services
                       ├── User Service (independent)
                       ├── Todo Service
                       │   └─→ Notification Service (async)
                       └── Notification Service (independent)
```

## Key Features

- **Separate Services**: Each service runs independently on its own port
- **Service Discovery**: API Gateway routes to services via environment variables
- **Error Handling**: Services handle failures gracefully
- **Logging**: All requests logged for debugging
- **Async Communication**: Todo Service notifies Notification Service asynchronously
- **Scalable**: Services can be deployed and scaled independently

## Next Steps

1. Read `MICROSERVICES_ARCHITECTURE.md` for detailed documentation
2. Explore service endpoints with curl or Postman
3. Check logs to see service-to-service communication
4. Modify services and rebuild with Docker
5. Add persistence with databases
6. Deploy to production environment

## Troubleshooting

### Services won't start
```bash
# Check if ports are in use
lsof -i :5000
lsof -i :5001

# Kill process and retry
kill -9 <PID>
```

### Can't reach services
```bash
# Check service is running
curl http://localhost:5001/health

# Check network connectivity
docker network ls
docker inspect <network-name>
```

### Notification not sent
- Check Notification Service is running
- Check logs: `docker-compose logs notification-service`
- Notification Service has 90% success rate (demo)
- Retry failed notifications with `/notifications/:id/retry`

## Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f todo-service

# Stop services
docker-compose down

# Remove volumes (reset data)
docker-compose down -v

# Rebuild services
docker-compose build --no-cache

# View running containers
docker-compose ps
```

## Environment Variables

Create `services/.env` to override defaults:

```env
GATEWAY_PORT=5000
USER_SERVICE_PORT=5001
TODO_SERVICE_PORT=5002
NOTIFICATION_SERVICE_PORT=5003

USER_SERVICE_URL=http://localhost:5001
TODO_SERVICE_URL=http://localhost:5002
NOTIFICATION_SERVICE_URL=http://localhost:5003

NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

For Docker, services communicate via container names:
```env
USER_SERVICE_URL=http://user-service:5001
TODO_SERVICE_URL=http://todo-service:5002
NOTIFICATION_SERVICE_URL=http://notification-service:5003
```

## Performance Tips

1. **Parallel Requests**: Call multiple services in parallel when possible
2. **Timeout Handling**: Set appropriate timeouts for service calls (default 5s)
3. **Logging**: Disable verbose logging in production
4. **Database**: Add persistence layer for scalability
5. **Caching**: Cache responses when data doesn't change frequently

## Production Considerations

- Use load balancer (Nginx, HAProxy)
- Implement retry logic with exponential backoff
- Add circuit breaker pattern
- Use message queue (RabbitMQ, Kafka) for async
- Implement distributed tracing
- Add monitoring and alerting
- Use API versioning (/api/v1/todos)
- Implement rate limiting
- Add authentication/authorization

Happy microservices hacking!
