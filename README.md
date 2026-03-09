# Full Stack Todo Application

A modern full-stack Todo application built with React, TypeScript, Node.js, Express, Sequelize ORM, and MySQL.

## Tech Stack

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **TypeScript** - Type safety
- **Express** - Web framework
- **Sequelize ORM** - Database ORM
- **MySQL** - Database

### DevOps
- **Docker & Docker Compose** - Containerization
- **Sequelize CLI** - Database migrations

## Features

- ✅ Create todos
- ✅ View all todos
- ✅ Update todos (title, description, completion status)
- ✅ Delete todos
- ✅ Request validation
- ✅ Error handling with proper HTTP status codes
- ✅ Responsive UI design
- ✅ TypeScript for type safety
- ✅ Redux Toolkit for state management

## Project Structure

```
TODO-operation/
├── backend/
│   ├── config/
│   │   └── config.json          # Database configuration
│   ├── migrations/
│   │   └── *-create-todo.js     # Database migration files
│   ├── models/
│   │   ├── index.ts             # Sequelize models setup
│   │   └── todo.ts              # Todo model
│   ├── src/
│   │   ├── controllers/
│   │   │   └── todo.controllers.ts   # Todo CRUD controllers
│   │   ├── middleware/
│   │   │   └── validation.ts         # Request validation
│   │   └── routes/
│   │       └── todo.routes.ts        # API routes
│   ├── .env.example             # Environment variables template
│   ├── .gitignore
│   ├── docker-compose.yml       # Docker services configuration
│   ├── Dockerfile
│   ├── package.json
│   ├── server.ts                # Express server entry point
│   └── tsconfig.json
└── frontend/
    └── todo-frontend/
        ├── src/
        │   ├── components/
        │   │   ├── TodoForm.tsx      # Create todo form
        │   │   ├── TodoItem.tsx      # Todo item component
        │   │   └── TodoList.tsx      # List of todos
        │   ├── services/
        │   │   └── todoService.ts    # API service
        │   ├── store/
        │   │   ├── hooks.ts          # Redux hooks
        │   │   ├── store.ts          # Redux store
        │   │   └── todoSlice.ts      # Todo slice
        │   ├── App.tsx
        │   ├── App.css
        │   └── main.tsx
        ├── package.json
        ├── tsconfig.json
        └── vite.config.ts
```

## Prerequisites

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **npm** or **yarn**

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd TODO-operation
```

### 2. Backend Setup

#### Option A: Using Docker (Recommended)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Copy the environment variables template:
```bash
cp .env.example .env
```

3. Start the services using Docker Compose:
```bash
docker compose up
```

This will:
- Start a MySQL database container
- Start the backend Node.js application
- Run database migrations automatically
- Expose the backend API on `http://localhost:5000`

#### Option B: Local Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up MySQL database:
   - Install MySQL locally
   - Create a database named `todo_db`
   - Update `config/config.json` with your database credentials

4. Run migrations:
```bash
npx sequelize-cli db:migrate
```

5. Start the development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend/todo-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Base URL: `http://localhost:5000/api/todos`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all todos |
| GET | `/:id` | Get a specific todo |
| POST | `/` | Create a new todo |
| PUT | `/:id` | Update a todo |
| DELETE | `/:id` | Delete a todo |

### Request/Response Examples

#### Create Todo
```http
POST /api/todos
Content-Type: application/json

{
  "title": "Learn TypeScript",
  "description": "Complete TypeScript tutorial",
  "completed": false
}
```

Response (201):
```json
{
  "success": true,
  "message": "Todo created successfully",
  "data": {
    "id": 1,
    "title": "Learn TypeScript",
    "description": "Complete TypeScript tutorial",
    "completed": false,
    "createdAt": "2026-03-09T10:00:00.000Z",
    "updatedAt": "2026-03-09T10:00:00.000Z"
  }
}
```

#### Get All Todos
```http
GET /api/todos
```

Response (200):
```json
{
  "success": true,
  "message": "Todos retrieved successfully",
  "data": [...]
}
```

#### Update Todo
```http
PUT /api/todos/1
Content-Type: application/json

{
  "completed": true
}
```

#### Delete Todo
```http
DELETE /api/todos/1
```

Response (200):
```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

## Environment Variables

### Backend (.env)

```env
DB_HOST=127.0.0.1
DB_PORT=3307
DB_NAME=todo_db
DB_USER=root
DB_PASSWORD=root1234
PORT=5000
NODE_ENV=development
```

**Note:** Never commit `.env` files to version control. Use `.env.example` as a template.

## Database Schema

### Todos Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT |
| title | STRING | NOT NULL |
| description | STRING | |
| completed | BOOLEAN | DEFAULT false |
| createdAt | DATE | NOT NULL |
| updatedAt | DATE | NOT NULL |

## Development

### Running Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend/todo-frontend
npm test
```

### Building for Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend/todo-frontend
npm run build
```

## Docker Commands

```bash
# Start services
docker compose up

# Start in detached mode
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Rebuild containers
docker compose up --build
```

## HTTP Status Codes

The API uses standard HTTP status codes:

- `200 OK` - Successful GET, PUT, DELETE requests
- `201 Created` - Successful POST request
- `400 Bad Request` - Validation errors or malformed requests
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server errors

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Author

SWE Intern Task Submission

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the port in `.env` file or stop the service using that port

2. **Database connection failed**
   - Ensure MySQL is running
   - Check database credentials in `config/config.json`
   - Verify the database exists

3. **Migration errors**
   - Drop the database and recreate it
   - Run migrations again: `npx sequelize-cli db:migrate`

4. **Frontend can't connect to backend**
   - Ensure backend is running on port 5000
   - Check CORS configuration in `server.ts`
   - Verify API_URL in `frontend/todo-frontend/src/services/todoService.ts`

## Support

For questions or issues, please open an issue in the GitHub repository or contact via Discord in the #discussions channel.
