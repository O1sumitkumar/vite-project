import { useState } from 'preact/hooks';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useAddTodoMutation, useDeleteTodoMutation, useGetTodosQuery, useUpdateTodoMutation } from './store/api';

type Priority = 'low' | 'medium' | 'high';

type EditingState = {
  id: string;
  title: string;
} | null;

export function App() {
  const [newTodo, setNewTodo] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const { data: todos = [], isLoading } = useGetTodosQuery();
  const [addTodo] = useAddTodoMutation();
  const [updateTodo] = useUpdateTodoMutation();
  const [deleteTodo] = useDeleteTodoMutation();
  const [editingTodo, setEditingTodo] = useState<EditingState>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (newTodo.trim()) {
      await addTodo({ title: newTodo.trim(), priority, order: todos.length });
      setNewTodo('');
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    await updateTodo({ id, completed: !completed });
  };

  const handleDragEnd = async (result: {
    destination?: { index: number };
    source: { index: number };
  }) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const items = Array.from(todos);
    const [reorderedItem] = items.splice(sourceIndex, 1);
    items.splice(destinationIndex, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({ ...item, order: index }));
    for (const item of updatedItems) {
      await updateTodo({ id: item.id, order: item.order });
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-200';
      case 'low': return 'bg-green-100 border-green-200';
      default: return 'bg-yellow-100 border-yellow-200';
    }
  };

  const handleEditStart = (todo: { id: string; title: string }) => {
    setEditingTodo({ id: todo.id, title: todo.title });
  };

  const handleEditCancel = () => {
    setEditingTodo(null);
  };

  const handleEditSave = async () => {
    if (editingTodo) {
      await updateTodo({ 
        id: editingTodo.id, 
        title: editingTodo.title.trim() 
      });
      setEditingTodo(null);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteTodo(id);
  };

  const handlePriorityChange = async (id: string, priority: Priority) => {
    await updateTodo({ id, priority });
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8">Todo App</h1>
        <ul className="space-y-2">
          {[...Array(10)].map((_, index) => (
            <li key={index} className="flex items-center gap-2 p-4 rounded-lg shadow border bg-gray-100 animate-pulse">
              <div className="h-5 w-5 bg-gray-300 rounded"></div>
              <div className="flex-1 h-4 bg-gray-300 rounded"></div>
              <div className="h-4 w-16 bg-gray-300 rounded"></div>
              <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const sortedTodos = [...todos].sort((a, b) => (a.order || 0) - (b.order || 0));

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
                      style={{
                        ...provided.draggableProps.style,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggle(todo.id, todo.completed)}
                        className="h-5 w-5 rounded border-gray-300 focus:ring-blue-500"
                      />
                      {editingTodo?.id === todo.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editingTodo.title}
                            onChange={(e) => setEditingTodo({ ...editingTodo, title: e.currentTarget.value })}
                            className="flex-1 px-2 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditSave();
                              if (e.key === 'Escape') handleEditCancel();
                            }}
                            autoFocus
                          />
                          <button
                            onClick={handleEditSave}
                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <span 
                            className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}
                            onDblClick={() => handleEditStart(todo)}
                          >
                            {todo.title}
                          </span>
                          <select
                            value={todo.priority}
                            onChange={(e) => handlePriorityChange(todo.id, e.currentTarget.value as Priority)}
                            className="px-2 py-1 bg-transparent border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                          <button
                            onClick={() => handleDelete(todo.id)}
                            className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100"
                            title="Delete todo"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </>
                      )}
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