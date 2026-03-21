
# Todo Application

A comprehensive full-stack todo management application built with React, TypeScript, Express, and MySQL. Features a clean, enterprise-style architecture with type-safe APIs, centralized error handling, comprehensive testing, and containerized deployment.

## 📋 Project Overview

This is a complete MERN-style application (with MySQL instead of MongoDB) that demonstrates modern web development practices including:
- Type-safe frontend and backend code with TypeScript
- Separation of concerns with clear architectural layers
- Comprehensive test coverage (unit + integration tests)
- Docker containerization for easy deployment
- Redux Toolkit for state management
- REST API following best practices
- Custom middleware and utilities for validation and error handling

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
├── docker-compose.yml              # Multi-container orchestration
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
Development: http://localhost:5000/api/todos
Docker: http://backend:5000/api/todos
Production: [your-domain]/api/todos
```

### **Endpoints**

#### **1. Get All Todos**
```
GET /api/todos
```
**Response (200):**
```json
{
  "success": true,
  "message": "Todos retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Learn TypeScript",
      "description": "Complete TypeScript course",
      "completed": false,
      "createdAt": "2026-03-10T15:12:00.000Z",
      "updatedAt": "2026-03-10T15:12:00.000Z"
    }
  ]
}
```

#### **2. Get Todo by ID**
```
GET /api/todos/:id
```
**Parameters:**
- `id` (path, required): Integer ID of todo

**Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "title": "Learn TypeScript",
    "description": "Complete TypeScript course",
    "completed": false,
    "createdAt": "2026-03-10T15:12:00.000Z",
    "updatedAt": "2026-03-10T15:12:00.000Z"
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Todo not found",
  "error": "Todo not found"
}
```

#### **3. Create Todo**
```
POST /api/todos
Content-Type: application/json
```
**Request Body:**
```json
{
  "title": "Learn TypeScript",
  "description": "Complete TypeScript course",
  "completed": false
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Todo created successfully",
  "data": {
    "id": 1,
    "title": "Learn TypeScript",
    "description": "Complete TypeScript course",
    "completed": false,
    "createdAt": "2026-03-10T15:12:00.000Z",
    "updatedAt": "2026-03-10T15:12:00.000Z"
  }
}
```

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

✅ **Type-Safe Development** - Full TypeScript both frontend and backend
✅ **RESTful API** - Clean, documented REST endpoints
✅ **State Management** - Redux Toolkit with async thunks
✅ **Validation** - Custom middleware for input validation
✅ **Error Handling** - Centralized error handling system
✅ **Testing** - Unit and integration tests with coverage reports
✅ **Containerized** - Docker Compose for one-command setup
✅ **Database Migrations** - Sequelize migrations for schema versioning
✅ **Code Quality** - ESLint for consistent code style
✅ **Development Tools** - Nodemon for hot reload, Vite for fast builds
✅ **Async Job Processing** - BullMQ + Redis for background task execution with retry logic

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

## Development

### Database Migrations

```bash
# Run migrations
npx sequelize-cli db:migrate

# Rollback last migration
npx sequelize-cli db:migrate:undo

# Create new migration
npx sequelize-cli migration:generate --name migration-name
```

### Docker Commands

```bash
# Start all services
docker-compose up

# Rebuild and start
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Build for Production

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

