'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MoreHorizontal,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle,
  PlayCircle,
  XCircle
} from 'lucide-react';
import { Task } from '@/lib/types';
import { format } from 'date-fns';

interface KanbanCardProps {
  task: Task;
  isDragging?: boolean;
}

export function KanbanCard({ task, isDragging = false }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'in-progress': return <PlayCircle className="h-3 w-3 text-blue-500" />;
      case 'cancelled': return <XCircle className="h-3 w-3 text-red-500" />;
      default: return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  const isOverdue = task.dueDate && task.dueDate < new Date() && task.status !== 'done';

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
        isDragging || isSortableDragging ? 'opacity-50 shadow-lg rotate-2' : ''
      } ${isOverdue ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : ''}`}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(task.status)}
              <Badge className={`${getPriorityColor(task.priority)} text-white border-0 text-xs`}>
                {task.priority}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>

          {/* Title */}
          <h3 className="font-medium text-sm leading-tight line-clamp-2">
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {task.category && (
                <Badge variant="outline" className="text-xs px-2 py-0">
                  {task.category}
                </Badge>
              )}
              {isOverdue && (
                <AlertCircle className="h-3 w-3 text-red-500" />
              )}
            </div>

            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                {format(task.dueDate, 'MMM dd')}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
