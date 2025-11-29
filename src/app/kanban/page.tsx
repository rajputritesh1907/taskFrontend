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
  PlayCircle,
  Loader2
} from 'lucide-react';
import { useEffect } from 'react';
import api from '@/lib/api';
import { Task, Status, Project } from '@/lib/types';
import { format } from 'date-fns';
import { KanbanColumn } from '@/components/kanban-column';
import { KanbanCard } from '@/components/kanban-card';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

const taskColumns: { id: Status; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'border-gray-300' },
  { id: 'in-progress', title: 'In Progress', color: 'border-blue-300' },
  { id: 'done', title: 'Done', color: 'border-green-300' },
  { id: 'cancelled', title: 'Cancelled', color: 'border-red-300' },
];

const projectColumns: { id: 'active' | 'completed' | 'on-hold'; title: string; color: string }[] = [
  { id: 'active', title: 'Active', color: 'border-blue-300' },
  { id: 'on-hold', title: 'On Hold', color: 'border-yellow-300' },
  { id: 'completed', title: 'Completed', color: 'border-green-300' },
];

export default function KanbanPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const columns = user?.role === 'manager' ? projectColumns : taskColumns;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'manager') {
          const { data } = await api.get('/projects');
          const projectsWithDates = data.map((project: any) => ({
            ...project,
            deadline: project.deadline ? new Date(project.deadline) : undefined,
            createdAt: new Date(project.createdAt),
            updatedAt: new Date(project.updatedAt)
          }));
          setProjects(projectsWithDates);
        } else {
          const { data } = await api.get('/tasks');
          const tasksWithDates = data.map((task: any) => ({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt)
          }));
          setTasks(tasksWithDates);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

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

    const isProject = user?.role === 'manager';
    const currentColumns = isProject ? projectColumns : taskColumns;

    // If dropping on a column
    if (currentColumns.some(col => col.id === overId)) {
      const newStatus = overId;

      if (isProject) {
        setProjects(projects =>
          projects.map(project =>
            project._id === activeId ? { ...project, status: newStatus as any } : project
          )
        );
        api.put(`/projects/${activeId}`, { status: newStatus }).catch(err => console.error(err));
      } else {
        setTasks(tasks =>
          tasks.map(task =>
            task._id === activeId ? { ...task, status: newStatus as any } : task
          )
        );
        api.put(`/tasks/${activeId}`, { status: newStatus }).catch(err => console.error(err));
      }
    }
    // If dropping on another item
    else {
      if (isProject) {
        const activeProject = projects.find(p => p._id === activeId);
        const overProject = projects.find(p => p._id === overId);

        if (!activeProject || !overProject) return;

        if (activeProject.status !== overProject.status) {
          setProjects(projects =>
            projects.map(p =>
              p._id === activeId ? { ...p, status: overProject.status } : p
            )
          );
          api.put(`/projects/${activeId}`, { status: overProject.status }).catch(err => console.error(err));
        }
      } else {
        const activeTask = tasks.find(task => task._id === activeId);
        const overTask = tasks.find(task => task._id === overId);

        if (!activeTask || !overTask) return;

        if (activeTask.status !== overTask.status) {
          setTasks(tasks =>
            tasks.map(task =>
              task._id === activeId ? { ...task, status: overTask.status } : task
            )
          );
          api.put(`/tasks/${activeId}`, { status: overTask.status }).catch(err => console.error(err));
        }
      }
    }

    setActiveId(null);
  };

  const getItemsByStatus = (status: string) => {
    if (user?.role === 'manager') {
      return projects.filter(project => project.status === status);
    }
    return tasks.filter(task => task.status === status);
  };

  const activeItem = activeId ? (user?.role === 'manager' ? projects.find(p => p._id === activeId) : tasks.find(t => t._id === activeId)) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {user?.role === 'manager' ? 'Project Board' : 'Kanban Board'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {user?.role === 'manager' ? 'Drag and drop projects to update status.' : 'Drag and drop tasks to organize your workflow.'}
          </p>
        </div>
        {user?.role !== 'manager' && (
          <Button asChild className="w-full sm:w-auto">
            <Link href="/tasks/new">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Link>
          </Button>
        )}
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
              tasks={getItemsByStatus(column.id) as any[]} // Cast to any[] to reuse KanbanColumn
            />
          ))}
        </div>

        <DragOverlay>
          {activeItem ? (
            <KanbanCard task={activeItem as any} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
