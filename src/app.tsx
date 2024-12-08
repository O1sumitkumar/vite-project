import { useState } from 'preact/hooks';
import { useGetTodosQuery, useAddTodoMutation, useUpdateTodoMutation } from './store/api';

export function App() {
  const [newTodo, setNewTodo] = useState('');
  const { data: todos = [], isLoading } = useGetTodosQuery();
  const [addTodo] = useAddTodoMutation();
  const [updateTodo] = useUpdateTodoMutation();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (newTodo.trim()) {
      await addTodo({ title: newTodo.trim() });
      setNewTodo('');
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    await updateTodo({ id, completed: !completed });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Todo App</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.currentTarget.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add new todo..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>
      </form>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center gap-2 p-4 bg-white rounded-lg shadow"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id, todo.completed)}
              className="h-5 w-5 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
              {todo.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

