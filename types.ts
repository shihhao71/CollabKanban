export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'todo' | 'in-progress' | 'done';

export interface Todo {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignee: string;
  createdAt: number;
}

export interface User {
  name: string;
  color: string;
}

export const COLUMNS: { id: Status; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50' },
  { id: 'done', title: 'Done', color: 'bg-green-50' },
];

export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];