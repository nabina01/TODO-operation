import axios from 'axios';

const API_URL = 'http://localhost:5000/api/todos';

export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class TodoService {
  async getAll(): Promise<Todo[]> {
    const { data } = await axios.get<ApiResponse<Todo[]>>(API_URL);
    return data.data || [];
  }

  async getById(id: number): Promise<Todo> {
    const { data } = await axios.get<ApiResponse<Todo>>(`${API_URL}/${id}`);
    if (!data.data) throw new Error('Todo not found');
    return data.data;
  }

  async create(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> {
    const { data } = await axios.post<ApiResponse<Todo>>(API_URL, todo);
    if (!data.data) throw new Error('Failed to create todo');
    return data.data;
  }

  async update(id: number, updates: Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Todo> {
    const { data } = await axios.put<ApiResponse<Todo>>(`${API_URL}/${id}`, updates);
    if (!data.data) throw new Error('Failed to update todo');
    return data.data;
  }

  async delete(id: number): Promise<void> {
    await axios.delete(`${API_URL}/${id}`);
  }
}

export default new TodoService();
