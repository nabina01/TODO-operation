import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTodos } from '../store/todoSlice';
import TodoItem from './TodoItem';

const TodoList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { todos, loading, error } = useAppSelector((state) => state.todos);

  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);

  if (loading && todos.length === 0) {
    return <div className="loading">Loading todos...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (todos.length === 0) {
    return <div className="empty">No todos yet. Create one above!</div>;
  }

  return (
    <div className="todo-list">
      <h2>My Todos ({todos.length})</h2>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
};

export default TodoList;
