import { NextRequest, NextResponse } from 'next/server';
import { mockTasks } from '@/lib/mock-data';
import { Task } from '@/lib/types';

// In a real app, this would be a database
let tasks = [...mockTasks];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let filteredTasks = [...tasks];

    // Apply filters
    if (status && status !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    if (priority && priority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }
    if (category && category !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.category === category);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.category?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filteredTasks.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'dueDate':
          aValue = a.dueDate?.getTime() || 0;
          bValue = b.dueDate?.getTime() || 0;
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return NextResponse.json({
      success: true,
      data: filteredTasks,
      total: filteredTasks.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, status, priority, category, dueDate, tags } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description?.trim(),
      status: status || 'todo',
      priority: priority || 'medium',
      category: category?.trim(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: tags || []
    };

    tasks.push(newTask);

    return NextResponse.json({
      success: true,
      data: newTask
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
