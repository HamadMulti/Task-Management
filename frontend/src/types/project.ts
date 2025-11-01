import { User } from './index';

// Project and Task Types
export interface Project {
  id: number;
  name: string;
  description: string;
  created_by: User;
  members: User[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
  task_count: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  created_at: string;
  updated_at: string;
  project: Project;
  created_by: User;
  assigned_to: User | null;
}

// Add PaginatedResponse type for API responses
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}