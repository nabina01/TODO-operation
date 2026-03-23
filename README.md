
# Todo Application

A comprehensive full-stack todo management application built with React, TypeScript, Express, and MySQL. Features a clean, enterprise-style architecture with type-safe APIs, centralized error handling, comprehensive testing, and containerized deployment.

## 📋 Project Overview

A full-stack microservices-based Todo application demonstrating enterprise architectural patterns:

**What's Included:**
- 4 independent microservices (User, Todo, Notification, API Gateway)
- JWT-based authentication across all services
- BullMQ message queue for async job processing with retries
- Service registry with automated health monitoring
- Complete Docker containerization with docker-compose
- Type-safe TypeScript codebase (frontend + backend)
- Redux Toolkit for state management
- Comprehensive test coverage
- Production-ready error handling and logging

**Quick Start:**
```bash
# Start everything
docker-compose up -d
sleep 10

# Login
TOKEN=$(curl -s -X POST http://localhost:5000/auth/login \
  -d '{"email":"john@example.com","password":"password123"}' | jq -r '.token')

# Create a todo (triggers async notification)
curl -X POST http://localhost:5000/todos \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Learn Microservices","userId":1}'

# Check service health
curl http://localhost:5000/health/services
```

---

## 🛠 Tech Stack

### **Frontend**
- **React 19** - Modern UI library with latest features
- **TypeScript** - Type-safe JavaScript for better code quality
- **Redux Toolkit** - Predictable state management with async thunks
- **Vite** - Lightning-fast build tool and dev server
- **Axios** - Promise-based HTTP client for API calls
- **React Redux** - Official React bindings for Redux
- **ESLint** - Code quality and style checking

**Frontend Dependencies:**
- @reduxjs/toolkit ^2.11.2
- react ^19.2.0
- react-dom ^19.2.0
- react-redux ^9.2.0
- axios ^1.13.6

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js 5.2** - Fast, minimalist web framework
- **TypeScript** - Type-safe backend development
- **Sequelize 6.37** - Promise-based ORM for MySQL
- **MySQL 8.0** - Relational database
- **Nodemon** - Auto-restart development server on file changes
- **Jest** - Testing framework with coverage reports
- **Supertest** - HTTP assertion library for API testing

**Backend Dependencies:**
- express ^5.2.1
- sequelize ^6.37.8
- mysql2 ^3.19.0
- cors ^2.8.6
- dotenv ^17.3.1

**Backend Dev Dependencies:**
- typescript ^5.3.0
- ts-node ^10.9.0
- ts-jest ^29.4.6
- jest ^30.3.0
- nodemon ^3.0.0
- sequelize-cli ^6.6.5
- supertest ^7.2.2
- @types/express ^5.0.6
- @types/jest ^30.0.0
- @types/node ^25.3.5

### **Infrastructure**
- **Docker & Docker Compose** - Containerization and orchestration
- **MySQL 8.0** - Database server in container
- **Environment-based configuration** - Flexible deployment settings

---

## 📁 Project Structure

```
TODO-operation/
├── backend/                          # Express API server
│   ├── src/
│   │   ├── __tests__/               # Test suites
│   │   │   ├── unit/                # Unit tests for individual functions
│   │   │   │   └── validation.test.ts
│   │   │   └── integration/         # Integration tests for API endpoints
│   │   │       └── todo.api.test.ts
│   │   ├── controllers/             # Request handlers for routes
│   │   │   └── todo.controllers.ts  # CRUD operations for todos
│   │   ├── middleware/              # Custom middleware functions
│   │   │   └── validation.ts        # Input validation for requests
│   │   ├── routes/                  # API route definitions
│   │   │   └── todo.routes.ts       # Todo resource routes
│   │   └── utils/                   # Helper utilities
│   │       ├── errorhandler.ts      # Custom error classes and handlers
│   │       └── responsehandler.ts   # Standardized response formatting
│   ├── models/                      # Sequelize ORM models
│   │   ├── index.ts                 # Model initialization and export
│   │   └── todo.ts                  # Todo model definition
│   ├── migrations/                  # Database schema versions
│   │   ├── 20260309070935-create-todo.js      # Initial schema creation
│   │   └── 20260310000002-add-priority-and-duedate.js  # Schema enhancement
│   ├── seeders/                     # Database seed data
│   │   └── 20260310000001-demo-todos.js  # Demo data for testing
│   ├── scripts/                     # Utility scripts
│   │   ├── create-dump.sh           # Linux/Mac database backup script
│   │   └── create-dump.bat          # Windows database backup script
│   ├── coverage/                    # Test coverage reports
│   │   ├── coverage-final.json      # Coverage metrics JSON
│   │   ├── lcov.info               # LCOV coverage format
│   │   ├── clover.xml              # Clover coverage format
│   │   └── lcov-report/            # HTML coverage report
│   ├── dumps/                       # Database backups
│   │   └── todo_db_backup_*.sql    # SQL dump files
│   ├── config/
│   │   └── config.js                # Sequelize CLI configuration
│   ├── server.ts                    # Express app initialization and startup
│   ├── jest.config.js               # Jest testing configuration
│   ├── package.json                 # Backend dependencies and scripts
│   ├── tsconfig.json                # TypeScript compiler configuration
│   └── Dockerfile                   # Container image definition
│
├── frontend/                        # React UI application
│   ├── src/
│   │   ├── __tests__/              # (Test directory for future tests)
│   │   ├── components/             # Reusable React components
│   │   │   ├── TodoForm.tsx        # Form for creating/editing todos
│   │   │   ├── TodoItem.tsx        # Individual todo item display
│   │   │   └── TodoList.tsx        # List of all todos with loading states
│   │   ├── services/               # API communication layer
│   │   │   └── todoService.ts      # Axios-based API client for todos
│   │   ├── store/                  # Redux state management
│   │   │   ├── store.ts            # Redux store configuration
│   │   │   ├── todoSlice.ts        # Redux slice with async thunks
│   │   │   └── hooks.ts            # Typed Redux hooks
│   │   ├── main.tsx                # React application entry point
│   │   ├── App.tsx                 # Root component
│   │   ├── App.css                 # Application styles
│   │   ├── index.css               # Global styles
│   │   └── vite-env.d.ts           # Vite environment declarations
│   ├── public/                     # Static assets (favicon, etc)
│   ├── index.html                  # HTML template
│   ├── package.json                # Frontend dependencies and scripts
│   ├── tsconfig.json               # TypeScript configuration
│   ├── tsconfig.app.json           # App-specific TypeScript config
│   ├── tsconfig.node.json          # Node-specific TypeScript config
│   ├── vite.config.ts              # Vite build configuration
│   ├── eslint.config.js            # ESLint linting rules
│   └── Dockerfile                  # Container image definition
│
├── services/                        # Microservices architecture
│   ├── shared/
│   │   ├── auth.ts                 # JWT utilities (generate, verify, middleware)
│   │   ├── service-registry.ts     # Service discovery & health checks
│   │   └── message-queue.ts        # BullMQ message queue wrapper
│   ├── api-gateway/
│   │   ├── server.ts               # Central request router with auth
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   ├── user-service/
│   │   ├── server.ts               # User CRUD & authentication
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   ├── todo-service/
│   │   ├── server.ts               # Todo CRUD & queue publishing
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   ├── notification-service/
│   │   ├── server.ts               # Notification handling
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   └── .env.example                # Environment variables template
│
├── docker-compose.yml              # Multi-container orchestration (4 microservices + legacy services)
├── BONUS_FEATURES_DOCUMENTATION.md # Complete bonus features guide
├── BONUS_FEATURES_QUICK_START.md   # 5-minute bonus features setup
├── MICROSERVICES_ARCHITECTURE.md   # Detailed architecture documentation
├── MICROSERVICES_QUICK_START.md    # Microservices quick start guide
└── README.md                        # This file
```

---

## 📊 Detailed Component Documentation

### **Backend - src/controllers/todo.controllers.ts**
Handles all CRUD operations for todo items:
- `createTodo()` - Creates a new todo with validation
- `getTodos()` - Retrieves all todos sorted by creation date (newest first)
- `getTodoById()` - Fetches a single todo by ID
- `updateTodo()` - Updates todo properties (title, description, completed status)
- `deleteTodo()` - Removes a todo from the database

All controller functions use the `asyncHandler` utility for automatic error catching.

### **Backend - src/routes/todo.routes.ts**
Defines REST API endpoints:
- `POST /` - Create todo (validates with `validateCreateTodo`)
- `GET /` - Fetch all todos
- `GET /:id` - Fetch specific todo (validates ID format)
- `PUT /:id` - Update todo (validates ID and request body)
- `DELETE /:id` - Delete todo (validates ID format)

### **Backend - src/middleware/validation.ts**
Custom input validation middleware:
- `validateCreateTodo` - Ensures title is non-empty string, validates optional description and completed fields
- `validateUpdateTodo` - Validates partial updates (all fields optional but must be correct types)
- `validateTodoId` - Ensures ID parameter is a valid positive integer
- `validate()` helper function - Reusable validation logic

### **Backend - src/utils/errorhandler.ts**
Custom error handling system:
- `AppError` - Base error class with status codes
- `TodoNotFoundError` - 404 error when todo doesn't exist
- `ValidationError` - 400 error for validation failures
- `DatabaseError` - 500 error for database operations
- `asyncHandler()` - Wrapper for automatic try-catch in controllers
- `errorHandler()` - Global error handling middleware

### **Backend - src/utils/responsehandler.ts**
Standardized API response formatting:
- `sendSuccess()` - Returns success response with data and optional custom message
- `sendValidationError()` - Returns formatted validation errors
- `sendError()` - Returns error response with status code (not in provided snippet but referenced)

### **Backend - models/todo.ts**
Sequelize ORM model for Todo:
- **Fields:**
  - `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
  - `title` (STRING, NOT NULL) - Todo task name
  - `description` (STRING, NULLABLE) - Optional detailed description
  - `completed` (BOOLEAN, DEFAULT: false) - Completion status
  - `createdAt` (TIMESTAMP, AUTO) - Auto-generated creation time
  - `updatedAt` (TIMESTAMP, AUTO) - Auto-updated modification time

### **Frontend - src/components/TodoForm.tsx**
Component for creating new todos:
- Input fields for title and description
- Dispatches Redux create action
- Form validation before submission
- Error/success feedback

### **Frontend - src/components/TodoItem.tsx**
Individual todo display component:
- Shows todo title and description
- Completed status checkbox
- Edit/delete buttons
- Update functionality on change

### **Frontend - src/components/TodoList.tsx**
Master list component:
- Fetches todos on component mount using Redux
- Displays loading state
- Shows error messages if API fails
- Renders TodoItem components for each todo
- Shows "No todos" message when empty
- Displays todo count

### **Frontend - src/services/todoService.ts**
API service layer using Axios:
- `getAll()` - Fetch all todos
- `getById(id)` - Get specific todo
- `create(todo)` - Create new todo
- `update(id, updates)` - Update existing todo
- `delete(id)` - Delete todo
- Handles API responses and error cases

**Todo Interface:**
```typescript
interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### **Frontend - src/store/todoSlice.ts**
Redux Toolkit slice for todo state:
- **State shape:**
  - `todos: Todo[]` - Array of all todos
  - `loading: boolean` - Request in progress flag
  - `error: string | null` - Error message if any
- **Async Thunks:**
  - `fetchTodos()` - Load all todos from API
  - `createTodo()` - Create new todo via API
  - `updateTodo()` - Update todo via API
  - `deleteTodo()` - Delete todo via API
- Handles pending, fulfilled, and rejected states for each operation

### **Frontend - src/store/hooks.ts**
Typed Redux hooks for type safety in components

---

## 🗄 Database Schema

### **Todo Table**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| title | VARCHAR(255) | NOT NULL | Todo task name |
| description | VARCHAR(255) | NULLABLE | Additional details |
| completed | BOOLEAN | DEFAULT: false | Completion status |
| createdAt | TIMESTAMP | AUTO | Creation datetime |
| updatedAt | TIMESTAMP | AUTO | Last modified datetime |

### **Migrations**
- **20260309070935-create-todo.js** - Creates initial Todos table structure with basic fields
- **20260310000002-add-priority-and-duedate.js** - (Prepared for) Adds priority and dueDate columns

---

## 🧪 Testing

### **Test Structure**
- **Unit Tests** (`src/__tests__/unit/validation.test.ts`) - Tests for individual validation functions
- **Integration Tests** (`src/__tests__/integration/todo.api.test.ts`) - Tests for complete API endpoints
- **Coverage Reports** - Generated in `coverage/` directory with HTML report in `coverage/lcov-report/`

### **Jest Configuration**
- Preset: ts-jest (TypeScript support)
- Environment: Node.js
- Test match pattern: `**/__tests__/**/*.test.ts`
- Coverage threshold: 100% for validation middleware
- Reporters: text, html (lcov), xml (clover)

### **Test Scripts**
- `npm test` - Run all tests with coverage
- `npm run test:unit` - Unit tests only
- `npm run test:integration` - Integration tests only
- `npm run test:watch` - Watch mode for development

---

## 🔌 API Documentation

### **Base URL**
```
API Gateway:  http://localhost:5000
User Service: http://localhost:5001
Todo Service: http://localhost:5002
Notification Service: http://localhost:5003
```

### **Endpoints - Authentication (Public)**

#### **1. Login**
```
POST /auth/login
```
**Request:**
```json
{ "email": "john@example.com", "password": "password123" }
```
**Response (200):**
```json
{
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### **2. Verify Token**
```
GET /auth/verify
Authorization: Bearer <token>
```
**Response (200):**
```json
{ "valid": true, "user": { "userId": 1, "email": "john@example.com", "name": "John Doe" } }
```

#### **3. Refresh Token**
```
POST /auth/refresh
```
**Request:** `{ "token": "<existing_token>" }`
**Response (200):** `{ "token": "<new_token>" }`

#### **4. Logout**
```
POST /auth/logout
Authorization: Bearer <token>
```
**Response (200):** `{ "message": "Logout successful" }`

### **Endpoints - System (Public)**

#### **1. Health Check - All Services**
```
GET /health/services
```
**Response (200):**
```json
{
  "userService": { "status": "ok", "service": "user-service" },
  "todoService": { "status": "ok", "service": "todo-service" },
  "notificationService": { "status": "ok", "service": "notification-service" }
}
```

#### **2. Service Registry Status**
```
GET /registry/status
```
**Response (200):**
```json
{
  "status": "ok",
  "registry": { "lastCheck": "2026-03-23T10:30:00Z", "healthy": true },
  "services": [
    { "name": "user-service", "url": "http://localhost:5001", "lastCheck": "2026-03-23T10:30:00Z" }
  ]
}
```

### **Endpoints - Todos (Protected)**

#### **1. Get All Todos**
```
GET /todos
Authorization: Bearer <token>
```
**Response (200):**
```json
{
  "success": true,
  "message": "Todos retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Learn Microservices",
      "description": "Understand microservices architecture",
      "completed": false,
      "createdAt": "2026-03-23T10:30:00.000Z",
      "updatedAt": "2026-03-23T10:30:00.000Z"
    }
  ]
}
```

#### **2. Get Todo by ID**
```
GET /todos/:id
Authorization: Bearer <token>
```
**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "title": "Learn Microservices",
    "description": "Understand microservices architecture",
    "completed": false,
    "createdAt": "2026-03-23T10:30:00.000Z",
    "updatedAt": "2026-03-23T10:30:00.000Z"
  }
}
```

#### **3. Create Todo**
```
POST /todos
Authorization: Bearer <token>
Content-Type: application/json
```
**Request:**
```json
{
  "title": "Learn Microservices",
  "description": "Understand distributed architecture",
  "userId": 1
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Todo created successfully",
  "data": {
    "id": 5,
    "title": "Learn Microservices",
    "description": "Understand distributed architecture",
    "completed": false,
    "createdAt": "2026-03-23T10:30:00.000Z",
    "updatedAt": "2026-03-23T10:30:00.000Z"
  }
}
```
**Note:** Creating a todo publishes a message to the queue. The API returns immediately while background workers process notifications asynchronously.

**Validation Errors (400):**
```json
{
  "success": false,
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

#### **4. Update Todo**
```
PUT /api/todos/:id
Content-Type: application/json
```
**Request Body (all fields optional):**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "completed": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Todo updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Title",
    "description": "Updated description",
    "completed": true,
    "createdAt": "2026-03-10T15:12:00.000Z",
    "updatedAt": "2026-03-10T15:15:00.000Z"
  }
}
```

#### **5. Delete Todo**
```
DELETE /api/todos/:id
```
**Response (200):**
```json
{
  "success": true,
  "message": "Todo deleted successfully",
  "data": null
}
```

### **Error Responses**

| Status | Description | Example |
|--------|-------------|---------|
| 400 | Validation error - invalid input | Invalid ID format, missing required fields |
| 404 | Resource not found | Todo with given ID doesn't exist |
| 500 | Server error | Database connection failure, unexpected error |

---

## 🚀 Quick Start

### **Using Docker (Recommended)**

Prerequisites: Docker & Docker Compose installed

```bash
# Clone the repository
git clone <repository-url>
cd TODO-operation

# Start all services (MySQL, Backend, Frontend)
docker-compose up --build

# On first run, wait for database to initialize (about 30 seconds)
# Access the application
```

**Access Points:**
- Frontend UI: http://localhost:5173
- Backend API: http://localhost:5000
- API Endpoint: http://localhost:5000/api/todos
- MySQL: localhost:3307 (port 3307, not standard 3306)

### **Local Development**

**Prerequisites:** 
- Node.js 18+ 
- MySQL 8.0 installed and running
- npm or yarn

**Setup:**

1. **Backend Setup**
```bash
cd backend

# Install dependencies
npm install

# Configure environment (create .env file)
# Copy from docker-compose for reference or create with:
# DB_HOST=localhost
# DB_NAME=todo_db
# DB_USER=root
# DB_PASSWORD=root1234
# PORT=5000

# Run migrations on first setup
npm run migrate

# Seed demo data (optional)
npm run seed

# Start development server
npm run dev
```

Server runs on http://localhost:5000

2. **Frontend Setup (in new terminal)**
```bash
cd frontend

# Install dependencies
npm install

# Configure environment (create .env.local)
# VITE_API_URL=http://localhost:5000/api/todos

# Start development server
npm run dev
```

Application runs on http://localhost:5173

---

## 📦 Available Scripts

### **Backend Scripts**

**Development:**
- `npm run dev` - Start with nodemon (auto-reload on file changes)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled JavaScript (production)

**Database:**
- `npm run migrate` - Run pending migrations
- `npm run migrate:undo` - Rollback last migration
- `npm run migrate:status` - Check migration status
- `npm run seed` - Populate database with demo data
- `npm run seed:undo` - Remove seeded data
- `npm run db:dump` - Create SQL backup of database
- `npm run db:reset` - Clear and reinitialize database

**Testing:**
- `npm test` - Run all tests with coverage report
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run API integration tests
- `npm run test:watch` - Watch mode (re-run on changes)

### **Frontend Scripts**

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

---

## 🐳 Docker Configuration

### **Services Defined**

**MySQL Service** (`todo-mysql`)
- Image: mysql:8
- Port: 3307:3306 (external:internal)
- Default Database: todo_db
- Default User: root
- Health Check: Every 10 seconds, 20s timeout
- Volume: `db_data` (persistent storage)

**Backend Service** (`todo-backend`)
- Builds from: `./backend/Dockerfile`
- Port: 5000
- Dependencies: MySQL (waits for healthy status)
- Auto-runs migrations and starts in dev mode
- Volume-mounts source code (hot reload)
- Volume-mounts node_modules separately

**Frontend Service** (`todo-frontend`)
- Builds from: `./frontend/Dockerfile`
- Port: 5173
- Dependencies: Backend service
- Source code volume-mounted for dev
- Environment: `VITE_API_URL=http://backend`

### **Environment Variables (docker-compose.yml)**

```env
# Database
DB_NAME=todo_db
DB_USER=root
DB_PASSWORD=root1234
DB_HOST=mysql (in Docker), localhost (local dev)
DB_PORT=3306

# Server
PORT=5000
NODE_ENV=docker

# CORS
FRONTEND_URL=http://frontend

# Frontend
VITE_API_URL=http://backend/api/todos (Docker)
VITE_API_URL=http://localhost:5000/api/todos (Local)
```

---

## 🔐 Environment Configuration

### **Backend .env Example**
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=todo_db
DB_USER=root
DB_PASSWORD=root1234
FRONTEND_URL=http://localhost:5173
```

### **Frontend .env.local Example**
```
VITE_API_URL=http://localhost:5000/api/todos
```

---

## 📊 File Summary

| File/Folder | Purpose | Key Details |
|-------------|---------|-------------|
| **backend/server.ts** | Express app initialization | CORS setup, route mounting, error handling, server startup |
| **backend/tsconfig.json** | TypeScript config | ES2019 target, CommonJS modules, strict mode |
| **backend/jest.config.js** | Testing config | ts-jest preset, 100% coverage for validation |
| **frontend/vite.config.ts** | Build config | React plugin, optimization settings |
| **frontend/tsconfig.json** | TypeScript config | DOM lib, strict checks, React types |
| **docker-compose.yml** | Container orchestration | 3 services, dependencies, networking, volumes |
| **docker-compose.yml** | Backup scripts | Linux (sh) and Windows (bat) versions for DB dumps |

---

## 📋 Summary of Technologies Used

**Languages:** TypeScript, JavaScript, HTML, CSS
**Frameworks:** React, Express.js
**State Management:** Redux Toolkit
**Database:** MySQL 8.0
**ORM:** Sequelize
**HTTP Client:** Axios
**Build Tools:** Vite, TypeScript Compiler (tsc)
**Testing:** Jest, Supertest
**Code Quality:** ESLint
**Containerization:** Docker, Docker Compose
**Development:** Nodemon, ts-node
**CLI:** Sequelize-CLI

---

## 🎯 Key Features

✅ **Microservices Architecture** - Independent services with API Gateway (User, Todo, Notification, Gateway)
✅ **Type-Safe Development** - Full TypeScript both frontend and backend
✅ **REST APIs** - Clean endpoints with proper routing and error handling
✅ **JWT Authentication** - Secure token-based auth across all services
✅ **Message Queue** - BullMQ + Redis for async job processing with auto-retry
✅ **Service Registry** - Automatic service discovery with health checks
✅ **State Management** - Redux Toolkit with async thunks
✅ **Testing** - Unit and integration tests with coverage reports
✅ **Docker & Docker Compose** - Full containerization with orchestration
✅ **Database Migrations** - Sequelize migrations for schema management
✅ **Error Handling** - Centralized error handling with graceful degradation

---

## 📝 Notes

- Database backups are stored in `backend/dumps/` directory
- Test coverage reports are generated in `backend/coverage/` directory
- Frontend components use React Hooks and Redux Hooks for state management
- All API responses follow a consistent format with success, message, and data fields
- Validation errors include field-specific error messages
- The application supports graceful error handling with custom error classes

{
  "title": "Complete project",
  "description": "Finish the todo app",
  "completed": false
}
```

**Response**
```json
{
  "success": true,
  "message": "Todo created successfully",
  "data": {
    "id": 1,
    "title": "Complete project",
    "description": "Finish the todo app",
    "completed": false,
    "createdAt": "2026-03-10T10:00:00.000Z",
    "updatedAt": "2026-03-10T10:00:00.000Z"
  }
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Validation Error
- `404` - Not Found
- `500` - Server Error

## Database Schema

**todos**

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | NULLABLE |
| completed | BOOLEAN | DEFAULT false |
| createdAt | TIMESTAMP | NOT NULL |
| updatedAt | TIMESTAMP | NOT NULL |

## Architecture

### Microservices Design

The application follows a microservices architecture with four independent services:

| Service | Port | Responsibility |
|---------|------|-----------------|
| **API Gateway** | 5000 | Request routing, authentication, service orchestration |
| **User Service** | 5001 | User management, authentication endpoints |
| **Todo Service** | 5002 | Todo CRUD operations, queue publishing |
| **Notification Service** | 5003 | Notification handling and delivery |

Each service:
- Runs independently in its own container
- Has its own server and configuration
- Communicates via HTTP with proper error handling
- Validates JWT tokens for protected endpoints
- Uses environment variables for configuration

### Service Communication Flow

```
Client Request
    ↓
API Gateway (5000)
    ├→ POST /auth/login → User Service (5001)
    ├→ GET/POST /todos → Todo Service (5002)
    │   └→ Publishes to Message Queue (Redis)
    │       └→ Message Queue Worker
    │           └→ POST /notifications → Notification Service (5003)
    └→ GET/POST /notifications → Notification Service (5003)
```

**Communication Patterns:**
- **Synchronous**: Gateway ↔ Services (HTTP with 5s timeout)
- **Asynchronous**: Services → Queue → Workers (fire-and-forget with retries)
- **Authentication**: JWT token passed in Authorization header

---

## Authentication

### JWT Implementation

All protected endpoints require Bearer token authentication. Tokens are issued on login and validated across services.

**Token Flow:**
1. User logs in: `POST /auth/login` → Returns JWT token
2. Client stores token (e.g., localStorage)
3. Each request includes: `Authorization: Bearer <token>`
4. API Gateway validates token and forwards to services
5. Services verify token before processing protected actions

**Login Example:**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Response
{
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Using Token:**
```bash
curl -X GET http://localhost:5000/todos \
  -H "Authorization: Bearer <your_token_here>"
```

---

## CI/CD Pipeline

### Build & Deployment Strategy

**Development Branch (dev):**
- Runs on PR creation
- Linting: ESLint
- Testing: Jest (unit + integration, 100% coverage for critical paths)
- Docker build validation

**Staging Branch (staging):**
- Runs on merge to staging
- All dev checks plus:
- Build backend and frontend
- Push images to registry
- Deploy to staging environment

**Production Branch (main):**
- Manual approval required
- All staging checks plus:
- Versioning and tagging
- Push to production registry
- Blue-green deployment
- Smoke tests

### Automated Checks

**Pre-commit:**
```bash
npm run lint              # ESLint checks
npm run test              # Unit tests
npm run build             # Build verification
```

**GitHub Actions (Recommended):**
- Lint on PR: `npx eslint .`
- Test on PR: `npm test -- --coverage`
- Build check: `npm run build`
- Docker build: `docker build .`

### Docker Image Registry

Services are containerized and ready for deployment:

```bash
# Build images locally
docker build -t user-service:latest services/user-service/
docker build -t todo-service:latest services/todo-service/
docker build -t notification-service:latest services/notification-service/
docker build -t api-gateway:latest services/api-gateway/

# Push to registry (e.g., Docker Hub, ECR, GCR)
docker tag user-service:latest myregistry/user-service:latest
docker push myregistry/user-service:latest
```

### Health Checks for Deployment

All services expose health endpoints for load balancers:

```bash
# Service health
GET http://localhost:5000/health/services
GET http://localhost:5001/health
GET http://localhost:5002/health
GET http://localhost:5003/health

# Service registry
GET http://localhost:5000/registry/status
```

### Monitoring & Logging

**Application Logs:**
- All services log to stdout (captured by Docker)
- Use `docker-compose logs` for development
- Production: Use centralized logging (CloudWatch, ELK, Datadog)

**Health Monitoring:**
```bash
# Continuous health check
watch -n 5 'curl -s http://localhost:5000/health/services | jq'
```

---

## Message Queue & Asynchronous Processing

### BullMQ + Redis

The system uses BullMQ for async job processing. When a todo is created, a message is published to the queue instead of blocking the API response.

**Queue Flow:**
1. Todo created → Published to `todo-created` queue
2. API returns 201 immediately (2-3ms response time)
3. Background worker processes message asynchronously
4. Notification sent after 1-second delay
5. Failed jobs auto-retry (3 attempts with exponential backoff)

**Job Format:**
```json
{
  "type": "todo-created",
  "payload": {
    "title": "Learn Microservices",
    "userId": 1,
    "todoId": 5
  },
  "timestamp": "2026-03-23T10:30:00.000Z"
}
```

**Retry Logic:**
- Attempt 1: Immediate
- Attempt 2: After 2 seconds
- Attempt 3: After 4 seconds
- Failed: Logged and marked as failed

---

## Getting Started

### Prerequisites
- Docker & Docker Compose OR Node.js 18+
- Redis (if running locally without Docker)
- MySQL 8.0 (if running without Docker)

### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/nabina01/TODO-operation.git
cd TODO-operation

# Start all services
docker-compose up -d

# Wait for services to start (10-15 seconds)
sleep 15

# Verify all services are running
curl http://localhost:5000/health/services

# View logs
docker-compose logs -f
```

**Stopping Services:**
```bash
docker-compose down          # Stop containers
docker-compose down -v       # Stop and remove volumes
```

### Option 2: Local Development

**Terminal 1: Redis**
```bash
docker run --name todo-redis -p 6379:6379 redis:7-alpine
```

**Terminal 2: User Service**
```bash
cd services/user-service
npm install
npm run dev
```

**Terminal 3: Todo Service**
```bash
cd services/todo-service
npm install
npm run dev
```

**Terminal 4: Notification Service**
```bash
cd services/notification-service
npm install
npm run dev
```

**Terminal 5: API Gateway**
```bash
cd services/api-gateway
npm install
npm run dev
```

**Terminal 6: Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## Service Registry & Health Checks

The API Gateway automatically monitors service health every 30 seconds.

**Check service status:**
```bash
curl http://localhost:5000/health/services
```

**Response:**
```json
{
  "status": "ok",
  "gateway": { "status": "ok" },
  "userService": { "status": "ok", "lastCheck": "2026-03-23T10:30:00Z" },
  "todoService": { "status": "ok", "lastCheck": "2026-03-23T10:30:00Z" },
  "notificationService": { "status": "ok", "lastCheck": "2026-03-23T10:30:00Z" }
}
```

**View service registry:**
```bash
curl http://localhost:5000/registry/status
```

---

## Common Tasks

### Running Tests
```bash
cd backend
npm test                    # All tests with coverage
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests only
npm run test:watch        # Watch mode
```

### Database Migrations
```bash
cd backend

# Run migrations
npm run migrate

# Rollback
npm run migrate:undo

# Generate new migration
npx sequelize-cli migration:generate --name add-new-field
```

### Building for Production
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

---

## Environment Configuration

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

# Service Ports
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

---

## Troubleshooting

**Services not starting:**
```bash
# Check if ports are in use
lsof -i :5000   # Gateway
lsof -i :5001   # User Service
lsof -i :5002   # Todo Service
lsof -i :5003   # Notification Service
lsof -i :6379   # Redis
```

**Redis connection error:**
```bash
# Verify Redis is running
redis-cli ping   # Should return "PONG"

# If Docker container:
docker ps | grep redis
docker logs todo-redis
```

**Service not responding:**
```bash
# Check service logs
docker-compose logs todo-service
docker-compose logs user-service

# Or in terminal where service is running
# Service should log all requests
```

**JWT token errors:**
- Ensure token is in `Authorization: Bearer <token>` format
- Tokens expire after 24h (check JWT_EXPIRY)
- All services must use same JWT_SECRET

---

## Deployment

### Local Development Workflow

1. Clone repository: `git clone https://github.com/nabina01/TODO-operation.git`
2. Create feature branch: `git checkout -b feature/your-feature`
3. Install dependencies: `npm install` (root and each service)
4. Start services: `docker-compose up -d` (or run locally)
5. Make changes and test
6. Run tests: `npm test`
7. Commit: `git commit -am "Describe changes"`
8. Push: `git push origin feature/your-feature`
9. Create Pull Request

### Docker Deployment

**Production deployment with docker-compose:**

```bash
# Set production environment variables
export JWT_SECRET=your-production-secret-key
export DB_PASSWORD=your-secure-password

# Build and start services
docker-compose -f docker-compose.yml up -d

# Scale services if needed
docker-compose up -d --scale todo-service=2 --scale notification-service=2

# View logs
docker-compose logs -f api-gateway

# Stop and cleanup
docker-compose down
docker-compose down -v  # Remove volumes
```

### Kubernetes Deployment

Services are containerized and ready for Kubernetes. Each service has:
- Health check endpoints
- Environment-based configuration
- Stateless design for horizontal scaling

**Example deployment approach:**
1. Build and push images to registry
2. Create ConfigMaps for environment variables
3. Create Secrets for sensitive data (JWT_SECRET, DB_PASSWORD)
4. Deploy using manifests or Helm charts
5. Use Ingress for external access
6. Deploy Redis separately or use managed service

### Cloud Deployment (AWS/GCP/Azure)

**Recommended approach:**
- API Gateway → Application Load Balancer
- Microservices → ECS/Cloud Run/App Service
- Redis → ElastiCache/Cloud Memory Store/Azure Cache
- MySQL → RDS/Cloud SQL/Azure Database
- Monitoring → CloudWatch/Stackdriver/Monitor
- Logging → ELK/Cloud Logging

---

## Contributing

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Make** changes with tests
4. **Ensure** all tests pass: `npm test`
5. **Commit** with clear message: `git commit -m "Add amazing feature"`
6. **Push** to branch: `git push origin feature/amazing-feature`
7. **Open** Pull Request with description

**Code Standards:**
- TypeScript strict mode
- ESLint compliance
- Minimum 80% test coverage for new code
- Meaningful commit messages
- Clear PR descriptions

---

## Support

**Issues & Questions:**
- GitHub Issues: [nabina01/TODO-operation/issues](https://github.com/nabina01/TODO-operation/issues)
- Documentation: See detailed guides in `/MICROSERVICES_*.md` files

**Documentation Files:**
- `MICROSERVICES_QUICK_START.md` - Quick setup guide (5 minutes)
- `MICROSERVICES_ARCHITECTURE.md` - Detailed architecture (1+ hour)
- `BONUS_FEATURES_DOCUMENTATION.md` - JWT, queues, service registry
- `BONUS_FEATURES_QUICK_START.md` - Bonus features setup

## Features

- ✅ Full CRUD operations for todos
- ✅ Real-time state management with Redux Toolkit
- ✅ Type-safe API with TypeScript
- ✅ Custom validation middleware
- ✅ Centralized error handling
- ✅ CORS security configured for specific origin
- ✅ Environment-based configuration
- ✅ Docker containerization
- ✅ Database migrations with Sequelize
- ✅ Responsive UI design

## CI/CD Pipeline (GitHub Actions)

This project uses GitHub Actions to run Continuous Integration checks automatically when code is pushed.

### Workflow Trigger

- Runs on every push to any branch

### Pipeline Jobs

1. Backend - Test and Build
- Installs backend dependencies
- Runs backend unit tests (`npm run test:unit`)
- Builds backend TypeScript (`npm run build`)

2. Frontend - Build
- Installs frontend dependencies
- Builds frontend app (`npm run build`)

3. Bonus - Docker Build
- Optional job for Docker image build
- Runs only on manual workflow dispatch

### Why this pipeline is useful

- Detects failures quickly after each push
- Ensures tests pass before code is considered healthy
- Verifies that both backend and frontend build successfully
- Prevents broken code from moving forward because failed tests/builds fail the pipeline

### Workflow file

- `.github/workflows/ci.yml`

## Task 5: BullMQ Message Queue Integration

This project now includes asynchronous processing with BullMQ + Redis for background task execution when a new Todo is created.

### What was integrated

- BullMQ queue named `taskQueue`
- Redis-backed job storage and delivery
- Background worker that processes jobs asynchronously
- Retries with exponential backoff (`attempts: 3`)
- Optional delayed jobs
- Job lifecycle logging for completed and failed states
- Optional Bull Board dashboard at `http://localhost:5000/admin/queues`

### Queue flow in this project

1. Client calls `POST /api/todos`.
2. Backend creates the Todo in MySQL.
3. Backend immediately returns API success response.
4. Backend enqueues a `todo-created` job in `taskQueue`.
5. Worker consumes and processes job in the background.

### How jobs are simulated

- Successful background task:
  - Create normal title, example: `Buy groceries`
- Delayed job:
  - Include `[delay]` in title, example: `[delay] Send follow-up`
- Failed job with retries:
  - Include `[fail]` in title, example: `[fail] Trigger retry demo`

### New backend files

- `backend/src/queues/todo.queue.ts`
  - Queue configuration
  - Producer (`enqueueTodoCreatedJob`)
  - Queue events logging
  - Bull Board registration
- `backend/src/workers/todo.worker.ts`
  - Worker processor and retry/failure behavior

### New backend scripts

- `npm run worker:dev` - starts worker in development mode
- `npm run worker` - starts compiled worker in production mode

### Environment variables for queue

Add these in `backend/.env`:

```env
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
QUEUE_ENABLED=true
WORKER_CONCURRENCY=5
TODO_JOB_DELAY_MS=5000
```

### Running locally

1. Start Redis
```bash
docker run --name todo-redis -p 6379:6379 redis:7-alpine
```

2. Start backend API
```bash
cd backend
npm run dev
```

3. Start worker (new terminal)
```bash
cd backend
npm run worker:dev
```

4. Test queue quickly
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"[fail] retry check","description":"Queue demo"}'
```

### Running with Docker Compose

The compose stack now includes:
- `mysql`
- `redis`
- `backend`
- `worker`
- `frontend`

Notes:
- `backend` runs compiled output via `npm start`
- `worker` runs compiled output via `npm run worker`
- This avoids dev-only runtime dependencies in containers (like `nodemon`/`ts-node`)

Start all services:

```bash
docker-compose up --build
```

