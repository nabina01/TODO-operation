// @ts-nocheck
import request from 'supertest';
import express, { Application } from 'express';
import todoRoutes from '../../routes/todo.routes';
import { errorHandler } from '../../utils/errorhandler';
import db from '../../../models';

// Create test app
const app: Application = express();
app.use(express.json());
app.use('/api/todos', todoRoutes);
app.use(errorHandler);

describe('TODO API - Integration Tests', () => {
  const baseTodo = {
    title: 'Seed Todo',
    description: 'Seed Description',
    completed: false
  };

  let createdTodoId: number;

  // Setup: Sync database before all tests
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  // Keep each test isolated by resetting rows before every test
  beforeEach(async () => {
    await db.Todo.destroy({ where: {}, force: true });
  });

  // Clear all mocks between tests to avoid assertion leakage
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Cleanup: Close connection after all tests
  afterAll(async () => {
    await db.sequelize.close();
  });

  describe('POST /api/todos', () => {
    test('should create a todo when payload is valid', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({
          title: 'Test Todo',
          description: 'Test Description',
          completed: false
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe('Test Todo');
      expect(response.body.data.description).toBe('Test Description');
      expect(response.body.data.completed).toBe(false);
      createdTodoId = response.body.data.id;
      expect(createdTodoId).toBeGreaterThan(0);
    });

    test('should create a todo with only title and default completed=false', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Minimal Todo' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo created successfully');
      expect(response.body.data.title).toBe('Minimal Todo');
      expect(response.body.data.completed).toBe(false);
    });

    test('should create a todo with completed=true when provided', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({
          title: 'Already Completed',
          completed: true
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo created successfully');
      expect(response.body.data.completed).toBe(true);
    });

    test('should return 400 and validation error when title is missing', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ description: 'No title' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors[0]).toMatchObject({ field: 'title', message: 'Title is required' });
    });

    test('should return 400 and validation error when title is empty', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors[0]).toMatchObject({ field: 'title', message: 'Title is required' });
    });

    test('should return 400 when completed has invalid type', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({
          title: 'Test',
          completed: 'yes'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors[0]).toMatchObject({ field: 'completed', message: 'Completed must be a boolean' });
    });

    test('should return 400 when request body is empty', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors[0]).toMatchObject({ field: 'title', message: 'Title is required' });
    });
  });

  describe('GET /api/todos', () => {
    test('should return all todos in response body', async () => {
      await db.Todo.create(baseTodo);
      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todos retrieved successfully');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should return todos sorted by createdAt in descending order', async () => {
      await db.Todo.bulkCreate([
        { title: 'Older Todo', description: 'A', completed: false },
        { title: 'Newer Todo', description: 'B', completed: true }
      ]);

      const response = await request(app).get('/api/todos');
      const todos = response.body.data;

      if (todos.length > 1) {
        const firstDate = new Date(todos[0].createdAt);
        const secondDate = new Date(todos[1].createdAt);
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
      }
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/todos/:id', () => {
    beforeEach(async () => {
      const todo = await db.Todo.create(baseTodo);
      createdTodoId = todo.id;
    });

    test('should return one todo when ID exists', async () => {
      const response = await request(app).get(`/api/todos/${createdTodoId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Success');
      expect(response.body.data.id).toBe(createdTodoId);
      expect(response.body.data.title).toBe('Seed Todo');
    });

    test('should include all expected todo fields', async () => {
      const response = await request(app).get(`/api/todos/${createdTodoId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data).toHaveProperty('completed');
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    test('should return 404 when todo ID does not exist', async () => {
      const response = await request(app).get('/api/todos/99999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Todo not found');
    });

    test('should return 400 when ID format is invalid string', async () => {
      const response = await request(app).get('/api/todos/invalid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors[0]).toMatchObject({ field: 'id', message: 'Invalid ID' });
    });

    test('should return 400 when ID is zero', async () => {
      const response = await request(app).get('/api/todos/0');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors[0]).toMatchObject({ field: 'id', message: 'Invalid ID' });
    });
  });

  describe('PUT /api/todos/:id', () => {
    beforeEach(async () => {
      const todo = await db.Todo.create(baseTodo);
      createdTodoId = todo.id;
    });

    test('should update todo title when payload is valid', async () => {
      const response = await request(app)
        .put(`/api/todos/${createdTodoId}`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo updated successfully');
      expect(response.body.data.title).toBe('Updated Title');
    });

    test('should update completed status when boolean is provided', async () => {
      const response = await request(app)
        .put(`/api/todos/${createdTodoId}`)
        .send({ completed: true });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo updated successfully');
      expect(response.body.data.completed).toBe(true);
    });

    test('should update multiple fields in one request', async () => {
      const response = await request(app)
        .put(`/api/todos/${createdTodoId}`)
        .send({
          title: 'Fully Updated',
          description: 'New Description',
          completed: false
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo updated successfully');
      expect(response.body.data.title).toBe('Fully Updated');
      expect(response.body.data.description).toBe('New Description');
      expect(response.body.data.completed).toBe(false);
    });

    test('should update description only', async () => {
      const response = await request(app)
        .put(`/api/todos/${createdTodoId}`)
        .send({ description: 'Updated Description Only' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo updated successfully');
      expect(response.body.data.description).toBe('Updated Description Only');
    });

    test('should return 404 when trying to update non-existent todo', async () => {
      const response = await request(app)
        .put('/api/todos/99999')
        .send({ title: 'Test' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Todo not found');
    });

    test('should return 400 when update payload has invalid type', async () => {
      const response = await request(app)
        .put(`/api/todos/${createdTodoId}`)
        .send({ completed: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors[0]).toMatchObject({ field: 'completed', message: 'Completed must be a boolean' });
    });

    test('should return 400 when title is empty string during update', async () => {
      const response = await request(app)
        .put(`/api/todos/${createdTodoId}`)
        .send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors[0]).toMatchObject({ field: 'title', message: 'Title must be a non-empty string' });
    });

    test('should return 400 when update ID is invalid', async () => {
      const response = await request(app)
        .put('/api/todos/not-a-number')
        .send({ title: 'Won\'t Work' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors[0]).toMatchObject({ field: 'id', message: 'Invalid ID' });
    });

    test('should return 200 when request body is empty on update', async () => {
      const response = await request(app)
        .put(`/api/todos/${createdTodoId}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo updated successfully');
      expect(response.body.data.id).toBe(createdTodoId);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    beforeEach(async () => {
      const todo = await db.Todo.create(baseTodo);
      createdTodoId = todo.id;
    });

    test('should delete existing todo and return success response', async () => {
      const response = await request(app).delete(`/api/todos/${createdTodoId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo deleted successfully');
      expect(response.body.data).toBeNull();
      expect(response.body.message).toContain('deleted');
    });

    test('should return 404 when deleting non-existent todo', async () => {
      const response = await request(app).delete('/api/todos/99999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Todo not found');
    });

    test('should return 400 when delete ID is invalid string', async () => {
      const response = await request(app).delete('/api/todos/abc');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors[0]).toMatchObject({ field: 'id', message: 'Invalid ID' });
    });

    test('should return 400 when delete ID is negative', async () => {
      const response = await request(app).delete('/api/todos/-1');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors[0]).toMatchObject({ field: 'id', message: 'Invalid ID' });
    });

    test('should return 400 when delete ID is zero', async () => {
      const response = await request(app).delete('/api/todos/0');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors[0]).toMatchObject({ field: 'id', message: 'Invalid ID' });
    });
  });
});
