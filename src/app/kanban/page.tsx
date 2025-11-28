'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Calendar,
  MoreHorizontal,
  AlertCircle,
  Clock,
  CheckCircle,
  PlayCircle
} from 'lucide-react';
import { mockTasks } from '@/lib/mock-data';
import { Task, Status } from '@/lib/types';
import { format } from 'date-fns';
import { KanbanColumn } from '@/components/kanban-column';
import { KanbanCard } from '@/components/kanban-card';
import Link from 'next/link';

const columns: { id: Status; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'border-gray-300' },
  { id: 'in-progress', title: 'In Progress', color: 'border-blue-300' },
  { id: 'done', title: 'Done', color: 'border-green-300' },
  { id: 'cancelled', title: 'Cancelled', color: 'border-red-300' },
];

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dropping on a column
    if (columns.some(col => col.id === overId)) {
      const newStatus = overId as Status;
      setTasks(tasks =>
        tasks.map(task =>
          task.id === activeId ? { ...task, status: newStatus } : task
        )
      );
    }
    // If dropping on another task
    else {
      const activeTask = tasks.find(task => task.id === activeId);
      const overTask = tasks.find(task => task.id === overId);

      if (!activeTask || !overTask) return;

      // If tasks are in different columns, move to the target column
      if (activeTask.status !== overTask.status) {
        setTasks(tasks =>
          tasks.map(task =>
            task.id === activeId ? { ...task, status: overTask.status } : task
          )
        );
      }
      // If tasks are in the same column, reorder them
      else {
        const columnTasks = tasks.filter(task => task.status === activeTask.status);
        const activeIndex = columnTasks.findIndex(task => task.id === activeId);
        const overIndex = columnTasks.findIndex(task => task.id === overId);

        if (activeIndex !== overIndex) {
          const reorderedTasks = arrayMove(columnTasks, activeIndex, overIndex);
          const otherTasks = tasks.filter(task => task.status !== activeTask.status);
          setTasks([...otherTasks, ...reorderedTasks]);
        }
      }
    }

    setActiveId(null);
  };

  const getTasksByStatus = (status: Status) => {
    return tasks.filter(task => task.status === status);
  };

  const activeTask = activeId ? tasks.find(task => task.id === activeId) : null;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Kanban Board
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Drag and drop tasks to organize your workflow.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/tasks/new">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Link>
        </Button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map(column => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              tasks={getTasksByStatus(column.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <KanbanCard task={activeTask} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
