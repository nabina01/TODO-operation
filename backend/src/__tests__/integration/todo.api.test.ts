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
  let createdTodoId: number;

  // Setup: Sync database before all tests
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  // Cleanup: Close connection after all tests
  afterAll(async () => {
    await db.sequelize.close();
  });

  describe('POST /api/todos - Create Todo', () => {
    test('POSITIVE: should create a new todo with valid data', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({
          title: 'Test Todo',
          description: 'Test Description',
          completed: false
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe('Test Todo');
      expect(response.body.data.description).toBe('Test Description');
      expect(response.body.data.completed).toBe(false);
      createdTodoId = response.body.data.id;
    });

    test('POSITIVE: should create todo with only title', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Minimal Todo' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Minimal Todo');
      expect(response.body.data.completed).toBe(false);
    });

    test('POSITIVE: should create todo with completed true', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({
          title: 'Already Completed',
          completed: true
        });

      expect(response.status).toBe(201);
      expect(response.body.data.completed).toBe(true);
    });

    test('NEGATIVE: should fail without title', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ description: 'No title' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('NEGATIVE: should fail with empty title', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('NEGATIVE: should fail with invalid completed type', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({
          title: 'Test',
          completed: 'yes'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/todos - Get All Todos', () => {
    test('POSITIVE: should retrieve all todos', async () => {
      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('POSITIVE: should return todos in descending order by createdAt', async () => {
      const response = await request(app).get('/api/todos');
      const todos = response.body.data;

      if (todos.length > 1) {
        const firstDate = new Date(todos[0].createdAt);
        const secondDate = new Date(todos[1].createdAt);
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
      }
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/todos/:id - Get Todo by ID', () => {
    test('POSITIVE: should retrieve todo by valid ID', async () => {
      const response = await request(app).get(`/api/todos/${createdTodoId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdTodoId);
      expect(response.body.data.title).toBe('Test Todo');
    });

    test('POSITIVE: should return todo with all fields', async () => {
      const response = await request(app).get(`/api/todos/${createdTodoId}`);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data).toHaveProperty('completed');
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    test('NEGATIVE: should return 404 for non-existent ID', async () => {
      const response = await request(app).get('/api/todos/99999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('NEGATIVE: should return 400 for invalid ID format', async () => {
      const response = await request(app).get('/api/todos/invalid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/todos/:id - Update Todo', () => {
    test('POSITIVE: should update todo title', async () => {
      const response = await request(app)
        .put(`/api/todos/${createdTodoId}`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
    });

    test('POSITIVE: should update todo completed status', async () => {
      const response = await request(app)
        .put(`/api/todos/${createdTodoId}`)
        .send({ completed: true });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.completed).toBe(true);
    });

    test('POSITIVE: should update multiple fields at once', async () => {
      const response = await request(app)
        .put(`/api/todos/${createdTodoId}`)
        .send({
          title: 'Fully Updated',
          description: 'New Description',
          completed: false
        });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Fully Updated');
      expect(response.body.data.description).toBe('New Description');
      expect(response.body.data.completed).toBe(false);
    });

    test('POSITIVE: should update only description', async () => {
      const response = await request(app)
        .put(`/api/todos/${createdTodoId}`)
        .send({ description: 'Updated Description Only' });

      expect(response.status).toBe(200);
      expect(response.body.data.description).toBe('Updated Description Only');
    });

    test('NEGATIVE: should fail updating non-existent todo', async () => {
      const response = await request(app)
        .put('/api/todos/99999')
        .send({ title: 'Test' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('NEGATIVE: should fail with invalid data type', async () => {
      const response = await request(app)
        .put(`/api/todos/${createdTodoId}`)
        .send({ completed: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('NEGATIVE: should fail with empty title', async () => {
      const response = await request(app)
        .put(`/api/todos/${createdTodoId}`)
        .send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/todos/:id - Delete Todo', () => {
    test('POSITIVE: should delete existing todo', async () => {
      const response = await request(app).delete(`/api/todos/${createdTodoId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    test('NEGATIVE: should fail deleting already deleted todo', async () => {
      const response = await request(app).delete(`/api/todos/${createdTodoId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('NEGATIVE: should fail with invalid ID', async () => {
      const response = await request(app).delete('/api/todos/abc');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('NEGATIVE: should fail with negative ID', async () => {
      const response = await request(app).delete('/api/todos/-1');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
