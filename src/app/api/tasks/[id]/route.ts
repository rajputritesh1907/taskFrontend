import { NextRequest, NextResponse } from 'next/server';
import { mockTasks } from '@/lib/mock-data';
import { Task } from '@/lib/types';

// In a real app, this would be a database
let tasks = [...mockTasks];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = tasks.find(t => t.id === id);

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    const existingTask = tasks[taskIndex];
    const updatedTask: Task = {
      ...existingTask,
      ...body,
      updatedAt: new Date(),
      dueDate: body.dueDate ? new Date(body.dueDate) : existingTask.dueDate
    };

    tasks[taskIndex] = updatedTask;

    return NextResponse.json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    tasks.splice(taskIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
