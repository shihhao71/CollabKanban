import React from 'react';
import { Todo } from '../types';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { User, Clock } from 'lucide-react';
import { PriorityBadge } from './Badge';

interface Props {
  todo: Todo;
  currentUser: string;
  onEdit: (todo: Todo) => void;
}

export const TaskCard: React.FC<Props> = ({ todo, currentUser, onEdit }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: todo.id,
    data: { ...todo },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing mb-3 group"
      onClick={() => onEdit(todo)}
    >
      <div className="flex justify-between items-start mb-2">
        <PriorityBadge priority={todo.priority} />
        {todo.assignee === currentUser && (
           <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">You</span>
        )}
      </div>
      
      <h4 className="font-semibold text-gray-800 mb-1 truncate">{todo.title}</h4>
      
      {todo.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 min-h-[1.5em]">
          {todo.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100 mt-2">
        <div className="flex items-center gap-1">
          <User size={12} />
          <span className={todo.assignee ? "text-gray-600" : "text-gray-300"}>
            {todo.assignee || "Unassigned"}
          </span>
        </div>
        <div className="flex items-center gap-1" title={new Date(todo.createdAt).toLocaleString()}>
          <Clock size={12} />
          <span>{new Date(todo.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};