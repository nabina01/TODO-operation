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
    const response = await axios.get<ApiResponse<Todo[]>>(API_URL);
    return response.data.data || [];
  }

  async getById(id: number): Promise<Todo> {
    const response = await axios.get<ApiResponse<Todo>>(`${API_URL}/${id}`);
    if (!response.data.data) throw new Error('Todo not found');
    return response.data.data;
  }

  async create(data: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> {
    const response = await axios.post<ApiResponse<Todo>>(API_URL, data);
    if (!response.data.data) throw new Error('Failed to create todo');
    return response.data.data;
  }

  async update(id: number, data: Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Todo> {
    const response = await axios.put<ApiResponse<Todo>>(`${API_URL}/${id}`, data);
    if (!response.data.data) throw new Error('Failed to update todo');
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await axios.delete(`${API_URL}/${id}`);
  }
}

export default new TodoService();
