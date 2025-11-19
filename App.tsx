import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  useSensors, 
  useSensor, 
  PointerSensor, 
  DragEndEvent, 
  DragStartEvent 
} from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { 
  COLUMNS, 
  Todo, 
  Status 
} from './types';
import { LoginScreen } from './components/LoginScreen';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { subscribeToTodos, addTodo, updateTodo, deleteTodo } from './services/todoService';
import { Plus, Layout, LogOut, Github } from 'lucide-react';

// --- Components for the Board ---

const DroppableColumn: React.FC<{ 
  column: typeof COLUMNS[0], 
  children: React.ReactNode, 
  count: number 
}> = ({ column, children, count }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex flex-col h-full min-w-[280px] w-[300px] md:w-80 flex-shrink-0">
      <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl border-b-2 ${isOver ? 'border-indigo-500 bg-indigo-50' : 'border-transparent bg-gray-100'} transition-colors`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${column.id === 'todo' ? 'bg-gray-400' : column.id === 'in-progress' ? 'bg-blue-500' : 'bg-green-500'}`} />
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{column.title}</h3>
        </div>
        <span className="bg-white text-gray-500 px-2 py-0.5 rounded text-xs font-bold shadow-sm">
          {count}
        </span>
      </div>
      <div 
        ref={setNodeRef} 
        className={`flex-1 p-3 rounded-b-xl transition-colors overflow-y-auto custom-scrollbar ${isOver ? 'bg-indigo-50/50' : 'bg-gray-100/50'}`}
      >
        {children}
        {count === 0 && (
            <div className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                Drop items here
            </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('collab_user'));
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Data Subscription
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToTodos((data) => {
      setTodos(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogin = (name: string) => {
    localStorage.setItem('collab_user', name);
    setUser(name);
  };

  const handleLogout = () => {
    localStorage.removeItem('collab_user');
    setUser(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const newStatus = over.id as Status;
    const currentTodo = todos.find(t => t.id === activeId);

    if (currentTodo && currentTodo.status !== newStatus) {
      // Optimistic UI update could happen here, but relying on service sub for simplicity
      updateTodo(activeId, { status: newStatus });
    }
  };

  const handleCreate = (data: Partial<Todo>) => {
    addTodo({
      ...data,
      createdAt: Date.now(),
    } as any);
  };

  const handleUpdate = (data: Partial<Todo>) => {
    if (editingTodo) {
      updateTodo(editingTodo.id, data);
    } else {
      handleCreate(data);
    }
  };

  if (!user) return <LoginScreen onJoin={handleLogin} />;

  const activeTodo = activeId ? todos.find(t => t.id === activeId) : null;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Layout className="text-white" size={20} />
          </div>
          <h1 className="font-bold text-xl text-gray-800 tracking-tight hidden md:block">CollabKanban</h1>
        </div>

        <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
                <span className="text-xs text-gray-400 font-medium">Logged in as</span>
                <span className="text-sm font-bold text-gray-800">{user}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {user.charAt(0).toUpperCase()}
            </div>
            <button 
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                title="Logout"
            >
                <LogOut size={18} />
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="h-full flex gap-6 min-w-max mx-auto">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {COLUMNS.map(col => {
               const colTodos = todos.filter(t => t.status === col.id);
               return (
                <DroppableColumn key={col.id} column={col} count={colTodos.length}>
                  {colTodos.map(todo => (
                    <TaskCard 
                        key={todo.id} 
                        todo={todo} 
                        currentUser={user}
                        onEdit={(t) => { setEditingTodo(t); setIsModalOpen(true); }}
                    />
                  ))}
                </DroppableColumn>
               );
            })}

            <DragOverlay>
              {activeTodo ? (
                <div className="opacity-90 rotate-2 scale-105 cursor-grabbing">
                    <TaskCard 
                        todo={activeTodo} 
                        currentUser={user} 
                        onEdit={() => {}} 
                    />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </main>
      
      {/* FAB */}
      <button
        onClick={() => { setEditingTodo(null); setIsModalOpen(true); }}
        className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 hover:shadow-xl hover:scale-105 transition-all z-20"
      >
        <Plus size={24} />
      </button>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleUpdate}
        onDelete={deleteTodo}
        existingTodo={editingTodo}
        currentUser={user}
      />
    </div>
  );
};

export default App;