

# Todo Application

A full-stack todo management application built with React, TypeScript, Express, and MySQL. Features a clean architecture with type-safe APIs, centralized error handling, and containerized deployment.

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Redux Toolkit for state management
- Vite for fast development and optimized builds
- Axios for HTTP client

**Backend**
- Node.js + Express + TypeScript
- Sequelize ORM with MySQL
- Custom validation middleware
- Centralized error handling with utility functions

**Infrastructure**
- Docker & Docker Compose
- MySQL 8.0
- Environment-based configuration

## Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd TODO-operation

# Start all services
docker-compose up --build
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- MySQL: localhost:3307

### Local Development

**Prerequisites:** Node.js 18+, MySQL 8.0, npm/yarn

```bash
# Backend setup
cd backend
npm install
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
npm run dev
```

## Architecture

```
todo-operation/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/        # Validation middleware
│   │   ├── routes/           # API routes
│   │   └── utils/            # Response & error handlers
│   ├── models/               # Sequelize models
│   ├── migrations/           # Database migrations
│   └── server.ts             # Express app entry
├── frontend/
│   └── src/
│       ├── components/       # React components
│       ├── services/         # API service layer
│       ├── store/            # Redux toolkit store
│       └── config/           # Environment config
└── docker-compose.yml
```

## Environment Configuration

### Backend `.env`

```env
DB_HOST=127.0.0.1
DB_PORT=3307
DB_NAME=todo_db
DB_USER=root
DB_PASSWORD=root1234
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api/todos
```

### Root `.env` (Docker Compose)

```env
DB_NAME=todo_db
DB_USER=root
DB_PASSWORD=root1234
```

## API Documentation

### Endpoints

| Method | Endpoint | Description | 
|--------|----------|-------------|
| GET | `/api/todos` | Retrieve all todos |
| GET | `/api/todos/:id` | Retrieve a specific todo |
| POST | `/api/todos` | Create a new todo |
| PUT | `/api/todos/:id` | Update a todo |
| DELETE | `/api/todos/:id` | Delete a todo |

### Request/Response Examples

**Create Todo**
```bash
POST /api/todos
Content-Type: application/json

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

## Project Structure Highlights

### Backend Utilities

- **Response Handler** (`utils/responsehandler.ts`) - Standardized API responses
- **Error Handler** (`utils/errorhandler.ts`) - Async error wrapper and global error middleware
- **Validation Middleware** (`middleware/validation.ts`) - Clean, reusable validation logic

### Frontend Architecture

- **Service Layer** - Abstracted API calls with typed responses
- **Redux Store** - Centralized state with slices
- **Type Definitions** - Shared interfaces for Todo entities

## License

MIT

---

**Note:** This is a development setup. For production deployment, ensure proper security configurations, use secure passwords, enable HTTPS, and follow production best practices.
