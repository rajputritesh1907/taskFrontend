export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'todo' | 'in-progress' | 'done' | 'cancelled';

export interface Task {
  _id: string;
  id?: string; // For backward compatibility if needed, or mapped from _id
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  category?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface Project {
  _id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'on-hold';
  manager: string;
  teamLeader?: { _id: string; name: string; email: string } | string;
  members?: { _id: string; name: string; email: string }[];
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'manager' | 'team-leader' | 'co-operator';
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  email?: string;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export interface CategoryStats {
  name: string;
  count: number;
  color: string;
}
