import { Router } from 'express';
import {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo
} from '../controllers/todo.controllers';
import {
  validateCreateTodo,
  validateUpdateTodo,
  validateTodoId
} from '../middleware/validation';

const router = Router();

router.post('/', validateCreateTodo, createTodo);
router.get('/', getTodos);
router.get('/:id', validateTodoId, getTodoById);
router.put('/:id', validateTodoId, validateUpdateTodo, updateTodo);
router.delete('/:id', validateTodoId, deleteTodo);

export default router;