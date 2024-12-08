import { useState } from 'preact/hooks';
import { useGetTodosQuery, useAddTodoMutation, useUpdateTodoMutation } from './store/api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

type Priority = 'low' | 'medium' | 'high';

export function App() {
  const [newTodo, setNewTodo] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const { data: todos = [], isLoading } = useGetTodosQuery();
  const [addTodo] = useAddTodoMutation();
  const [updateTodo] = useUpdateTodoMutation();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (newTodo.trim()) {
      await addTodo({ title: newTodo.trim(), priority });
      setNewTodo('');
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    await updateTodo({ id, completed: !completed });
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;

    const items = Array.from(todos);
    const [reorderedItem] = items.splice(sourceIndex, 1);
    items.splice(destinationIndex, 0, reorderedItem);

    // Update only the moved item with its new index
    await updateTodo({ 
      id: reorderedItem.id, 
      order: destinationIndex 
    });
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-200';
      case 'low': return 'bg-green-100 border-green-200';
      default: return 'bg-yellow-100 border-yellow-200';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const sortedTodos = [...todos].sort((a, b) => {
    const orderA = typeof a.order === 'number' ? a.order : 0;
    const orderB = typeof b.order === 'number' ? b.order : 0;
    return orderA - orderB;
  });

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Todo App</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2 flex-col">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.currentTarget.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add new todo..."
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.currentTarget.value as Priority)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
        </div>
      </form>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="todos">
          {(provided) => (
            <ul 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="space-y-2"
            >
              {sortedTodos.map((todo, index) => (
                <Draggable key={todo.id} draggableId={todo.id} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex items-center gap-2 p-4 rounded-lg shadow border ${getPriorityColor(todo.priority as Priority)}`}
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
                      <span className="text-sm text-gray-500">
                        {todo.priority}
                      </span>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
