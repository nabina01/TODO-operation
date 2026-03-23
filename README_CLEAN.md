# Todo Application - Microservices Architecture

Full-stack microservices todo app with JWT auth, message queues, and async job processing.

## Quick Start

```bash
# Docker (recommended)
docker-compose up -d && sleep 10

# Login
TOKEN=$(curl -s -X POST http://localhost:5000/auth/login \
  -d '{"email":"john@example.com","password":"password123"}' | jq -r '.token')

# Create todo (async notification)
curl -X POST http://localhost:5000/todos \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Learn Microservices","userId":1}'

# Check health
curl http://localhost:5000/health/services
```

## Architecture

| Component | Port | Purpose |
|-----------|------|---------|
| API Gateway | 5000 | Request routing, JWT validation, orchestration |
| User Service | 5001 | User CRUD, authentication |
| Todo Service | 5002 | Todo CRUD, queue publishing |
| Notification Service | 5003 | Async notifications |
| Redis | 6379 | Message queue, caching |
| MySQL | 3306 | Data persistence |

**Communication:**
- Sync: HTTP with 5s timeout (API → Services)
- Async: BullMQ queue with 3x retry, exponential backoff (Services → Queue → Workers)
- Auth: JWT tokens in Authorization header

## Tech Stack

**Frontend:** React 19, TypeScript, Redux Toolkit, Vite  
**Backend:** Node.js, Express 5, Sequelize ORM, MySQL 8  
**Infrastructure:** Docker, docker-compose, Redis, BullMQ  
**Auth:** JWT (jsonwebtoken)  
**Testing:** Jest, Supertest  

## Getting Started

### Prerequisites
- Docker & Docker Compose OR Node.js 18+
- Redis (if local setup)
- MySQL 8.0 (if local setup)

### Docker (1 command)
```bash
docker-compose up -d
```

### Local Development
```bash
# Terminal 1: Redis
docker run -p 6379:6379 redis:7-alpine

# Terminal 2: User Service
cd services/user-service && npm install && npm run dev

# Terminal 3: Todo Service
cd services/todo-service && npm install && npm run dev

# Terminal 4: Notification Service
cd services/notification-service && npm install && npm run dev

# Terminal 5: API Gateway
cd services/api-gateway && npm install && npm run dev

# Terminal 6: Frontend
cd frontend && npm install && npm run dev
```

## Services

### API Gateway (5000)
Central request router with JWT validation. Forwards requests to appropriate services and handles errors gracefully.

**Key Endpoints:**
- `POST /auth/login` - Generate JWT token
- `GET /auth/verify` - Verify token
- `POST /auth/refresh` - Refresh token
- `GET /health/services` - Service status
- `GET /registry/status` - Service registry

### User Service (5001)
User management with authentication. Returns user data for token generation.

**Endpoints:**
- `POST /auth/login` - User login
- `GET/POST/PUT/DELETE /users` - User CRUD

### Todo Service (5002)
Todo management with queue integration. Creates todos and publishes `todo-created` events to message queue.

**Endpoints:**
- `GET /todos` - List todos
- `POST /todos` - Create todo (publishes to queue)
- `GET/PUT/DELETE /todos/:id` - Todo CRUD

**Queue Flow:**
1. Todo created → Published to queue (fire-and-forget)
2. API returns 201 immediately (2-3ms)
3. Background worker processes message
4. Notification sent after 1s delay
5. Failed jobs auto-retry (3x with backoff: 1s → 2s → 4s)

### Notification Service (5003)
Notification handling. Receives messages from queue and todo service.

**Endpoints:**
- `GET /notifications` - List notifications
- `POST /notifications` - Create notification
- `POST /notifications/:id/retry` - Retry failed notification
- `DELETE /notifications/:id` - Delete notification

## Authentication (JWT)

**Login:**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Response:**
```json
{
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Use Token (all protected endpoints):**
```bash
curl -X GET http://localhost:5000/todos \
  -H "Authorization: Bearer <token>"
```

**Token Expiry:** 24 hours  
**Protected Endpoints:** 28 total (users, todos, notifications)  
**Test Credentials:** john@example.com / password123 or jane@example.com / password123

## Message Queue (BullMQ + Redis)

When todo is created:
1. Message published to `todo-created` queue
2. API returns immediately (non-blocking)
3. Background worker processes asynchronously
4. Notification sent to notification service
5. Failed jobs auto-retry (max 3 attempts)

**Job Format:**
```json
{
  "type": "todo-created",
  "payload": { "title": "Task", "userId": 1, "todoId": 5 },
  "timestamp": "2026-03-23T10:30:00.000Z"
}
```

**Retry Strategy:**
- Attempt 1: Immediate
- Attempt 2: After 2 seconds
- Attempt 3: After 4 seconds
- Failed: Logged and marked as failed

## Service Registry & Health Checks

API Gateway monitors all services every 30 seconds.

**Check Status:**
```bash
curl http://localhost:5000/health/services
```

**Service Registry:**
```bash
curl http://localhost:5000/registry/status
```

## Configuration

### services/.env
```env
# Service URLs
USER_SERVICE_URL=http://localhost:5001
TODO_SERVICE_URL=http://localhost:5002
NOTIFICATION_SERVICE_URL=http://localhost:5003

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=24h

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Ports
GATEWAY_PORT=5000
USER_SERVICE_PORT=5001
TODO_SERVICE_PORT=5002
NOTIFICATION_SERVICE_PORT=5003
```

### backend/.env
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=todo_db
DB_USER=root
DB_PASSWORD=root1234
PORT=5010
QUEUE_ENABLED=false
```

## Project Structure

```
TODO-operation/
├── services/                          # Microservices
│   ├── shared/
│   │   ├── auth.ts                   # JWT utilities
│   │   ├── service-registry.ts       # Service discovery
│   │   └── message-queue.ts          # BullMQ wrapper
│   ├── api-gateway/                  # Central router
│   ├── user-service/                 # User management
│   ├── todo-service/                 # Todo CRUD + queue
│   ├── notification-service/         # Notifications
│   └── .env.example
│
├── backend/                           # Legacy Express server
│   ├── src/
│   │   ├── controllers/              # Request handlers
│   │   ├── routes/                   # API routes
│   │   ├── middleware/               # Validation, error handling
│   │   ├── utils/                    # Helpers
│   │   └── __tests__/                # Unit + integration tests
│   ├── models/                       # Sequelize ORM
│   ├── migrations/                   # Schema versions
│   ├── seeders/                      # Demo data
│   └── config/
│
├── frontend/                          # React app
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   ├── services/                 # API client
│   │   ├── store/                    # Redux state
│   │   ├── pages/                    # Page components
│   │   └── __tests__/                # Tests
│   └── vite.config.ts
│
├── docker-compose.yml                # Multi-container orchestration
├── .gitignore
└── README.md
```

## Development Commands

**Backend:**
```bash
cd backend
npm install
npm run dev              # Start dev server
npm test                 # Run tests with coverage
npm run migrate          # Run migrations
npm run seed             # Seed database
npm run build            # Compile TypeScript
npm start                # Run compiled
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm test                 # Run tests
```

**Services:**
```bash
cd services/api-gateway
npm install && npm run dev

cd services/user-service
npm install && npm run dev

cd services/todo-service
npm install && npm run dev

cd services/notification-service
npm install && npm run dev
```

## Deployment

### Docker Compose
```bash
docker-compose up -d              # Start all services
docker-compose logs -f api-gateway # View logs
docker-compose down               # Stop services
docker-compose down -v            # Stop and remove volumes
```

### Production Build
```bash
# Set environment
export JWT_SECRET=your-production-secret
export DB_PASSWORD=your-secure-password

# Start
docker-compose -f docker-compose.yml up -d

# Scale services if needed
docker-compose up -d --scale todo-service=2
```

### Kubernetes Ready
All services are containerized with health checks and environment-based config. Deploy using manifests or Helm charts with proper ConfigMaps and Secrets.

## API Endpoints

### Authentication (Public)
- `POST /auth/login` - Login, get JWT token
- `GET /auth/verify` - Verify token validity
- `POST /auth/refresh` - Get new token
- `POST /auth/logout` - Logout (client-side removal)

### System (Public)
- `GET /health/services` - All service health
- `GET /registry/status` - Service registry status

### Users (Protected)
- `GET /users` - List users
- `POST /users` - Create user
- `GET /users/:id` - Get user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Todos (Protected)
- `GET /todos` - List todos
- `POST /todos` - Create todo
- `GET /todos/:id` - Get todo
- `PUT /todos/:id` - Update todo
- `DELETE /todos/:id` - Delete todo

### Notifications (Protected)
- `GET /notifications` - List notifications
- `GET /notifications/:id` - Get notification
- `POST /notifications/:id/retry` - Retry notification
- `DELETE /notifications/:id` - Delete notification

## Troubleshooting

**Port already in use:**
```bash
lsof -i :5000   # Check port usage
kill -9 <PID>   # Kill process
```

**Redis connection error:**
```bash
redis-cli ping          # Test Redis connection
docker ps | grep redis  # Check container
docker logs todo-redis  # View logs
```

**Service not responding:**
```bash
docker-compose logs todo-service      # Docker logs
# Or check terminal where service is running
curl http://localhost:5002/health     # Test endpoint
```

**JWT token issues:**
- Format: `Authorization: Bearer <token>`
- Expires after 24 hours
- All services must use same JWT_SECRET

## Testing

```bash
# Backend tests
cd backend
npm test                 # All tests with coverage
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests
npm run test:watch      # Watch mode
```

## Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/name`
3. Make changes and test
4. Run: `npm test && npm run lint`
5. Commit: `git commit -m "Add feature"`
6. Push: `git push origin feature/name`
7. Create Pull Request

**Code Standards:**
- TypeScript strict mode
- ESLint compliance
- Minimum 80% test coverage
- Meaningful commit messages

## CI/CD Pipeline

**Development:** Lint, test, build check on PR  
**Staging:** Build images, deploy to staging, run smoke tests  
**Production:** Manual approval, versioning, blue-green deployment  

Each branch has automated checks. Services are containerized and ready for deployment to any environment.

## Support & Documentation

- **Issues:** GitHub Issues
- **Quick Start:** This README
- **Detailed Guides:**
  - `MICROSERVICES_ARCHITECTURE.md` - Complete architecture details
  - `MICROSERVICES_QUICK_START.md` - 5-minute setup guide
  - `BONUS_FEATURES_DOCUMENTATION.md` - Auth, queues, service registry
  - `TROUBLESHOOTING.md` - Common issues and solutions

## License

MIT
