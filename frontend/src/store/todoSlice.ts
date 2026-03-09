import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import todoService, { type Todo } from '../services/todoService';

interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

const initialState: TodoState = {
  todos: [],
  loading: false,
  error: null,
};

export const fetchTodos = createAsyncThunk('todos/fetchAll', async () => {
  return await todoService.getAll();
});

export const createTodo = createAsyncThunk(
  'todos/create',
  async (data: { title: string; description: string; completed: boolean }) => {
    return await todoService.create(data);
  }
);

export const updateTodo = createAsyncThunk(
  'todos/update',
  async ({ id, data }: { id: number; data: Partial<{ title: string; description: string; completed: boolean }> }) => {
    return await todoService.update(id, data);
  }
);

export const deleteTodo = createAsyncThunk('todos/delete', async (id: number) => {
  await todoService.delete(id);
  return id;
});

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action: PayloadAction<Todo[]>) => {
        state.loading = false;
        state.todos = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch todos';
      })
      .addCase(createTodo.fulfilled, (state, action: PayloadAction<Todo>) => {
        state.todos.unshift(action.payload);
      })
      .addCase(updateTodo.fulfilled, (state, action: PayloadAction<Todo>) => {
        const index = state.todos.findIndex((todo) => todo.id === action.payload.id);
        if (index !== -1) state.todos[index] = action.payload;
      })
      .addCase(deleteTodo.fulfilled, (state, action: PayloadAction<number>) => {
        state.todos = state.todos.filter((todo) => todo.id !== action.payload);
      });
  },
});

export default todoSlice.reducer;
