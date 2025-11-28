import { NextResponse } from 'next/server';
import { mockTasks } from '@/lib/mock-data';
import { DashboardStats, CategoryStats } from '@/lib/types';

export async function GET() {
  try {
    // In a real app, this would fetch from database
    const tasks = mockTasks;

    const stats: DashboardStats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(task => task.status === 'done').length,
      inProgressTasks: tasks.filter(task => task.status === 'in-progress').length,
      overdueTasks: tasks.filter(task =>
        task.dueDate &&
        task.dueDate < new Date() &&
        task.status !== 'done'
      ).length,
      completionRate: tasks.length > 0
        ? Math.round((tasks.filter(task => task.status === 'done').length / tasks.length) * 100)
        : 0
    };

    // Calculate category stats
    const categoryMap = new Map<string, number>();
    tasks.forEach(task => {
      if (task.category) {
        categoryMap.set(task.category, (categoryMap.get(task.category) || 0) + 1);
      }
    });

    const categoryStats: CategoryStats[] = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
      color: getCategoryColor(name)
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats,
        categoryStats
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Frontend': '#3B82F6',
    'Backend': '#10B981',
    'Design': '#F59E0B',
    'Testing': '#EF4444',
    'Documentation': '#8B5CF6',
    'DevOps': '#06B6D4',
    'Mobile': '#EC4899',
    'Security': '#84CC16'
  };

  return colors[category] || '#6B7280'; // Default gray
}
