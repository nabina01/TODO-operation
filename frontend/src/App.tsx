import './App.css';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';

function App() {
  return (
    <div className="App">
      <header>
        <h1>📝 Todo Application</h1>
      </header>
      <main className="container">
        <TodoForm />
        <TodoList />
      </main>
    </div>
  );
}

export default App;
