import { Task, DashboardStats, CategoryStats } from './types';

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design user authentication flow',
    description: 'Create wireframes and mockups for the login/signup process',
    status: 'in-progress',
    priority: 'high',
    category: 'Design',
    dueDate: new Date('2024-12-15'),
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-10'),
    tags: ['UI/UX', 'Authentication']
  },
  {
    id: '2',
    title: 'Implement API endpoints',
    description: 'Build REST API for task management',
    status: 'todo',
    priority: 'high',
    category: 'Backend',
    dueDate: new Date('2024-12-20'),
    createdAt: new Date('2024-12-05'),
    updatedAt: new Date('2024-12-05'),
    tags: ['API', 'Backend']
  },
  {
    id: '3',
    title: 'Write unit tests',
    description: 'Add comprehensive test coverage for components',
    status: 'done',
    priority: 'medium',
    category: 'Testing',
    dueDate: new Date('2024-12-08'),
    createdAt: new Date('2024-11-25'),
    updatedAt: new Date('2024-12-08'),
    tags: ['Testing', 'Quality']
  },
  {
    id: '4',
    title: 'Update documentation',
    description: 'Refresh README and API documentation',
    status: 'todo',
    priority: 'low',
    category: 'Documentation',
    dueDate: new Date('2024-12-25'),
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
    tags: ['Docs']
  },
  {
    id: '5',
    title: 'Optimize database queries',
    description: 'Improve performance of slow queries',
    status: 'in-progress',
    priority: 'urgent',
    category: 'Backend',
    dueDate: new Date('2024-12-12'),
    createdAt: new Date('2024-12-08'),
    updatedAt: new Date('2024-12-10'),
    tags: ['Performance', 'Database']
  },
  {
    id: '6',
    title: 'Mobile responsive fixes',
    description: 'Fix layout issues on mobile devices',
    status: 'done',
    priority: 'medium',
    category: 'Frontend',
    dueDate: new Date('2024-12-06'),
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-06'),
    tags: ['Mobile', 'CSS']
  }
];

export const mockDashboardStats: DashboardStats = {
  totalTasks: mockTasks.length,
  completedTasks: mockTasks.filter(task => task.status === 'done').length,
  inProgressTasks: mockTasks.filter(task => task.status === 'in-progress').length,
  overdueTasks: mockTasks.filter(task => task.dueDate && task.dueDate < new Date() && task.status !== 'done').length,
  completionRate: Math.round((mockTasks.filter(task => task.status === 'done').length / mockTasks.length) * 100)
};

export const mockCategoryStats: CategoryStats[] = [
  { name: 'Backend', count: 2, color: '#3B82F6' },
  { name: 'Frontend', count: 1, color: '#10B981' },
  { name: 'Design', count: 1, color: '#F59E0B' },
  { name: 'Testing', count: 1, color: '#EF4444' },
  { name: 'Documentation', count: 1, color: '#8B5CF6' }
];
