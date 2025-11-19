import React from 'react';
import { Priority } from '../types';

const styles: Record<Priority, string> = {
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Low: 'bg-blue-100 text-blue-700 border-blue-200',
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[priority]}`}>
      {priority}
    </span>
  );
};