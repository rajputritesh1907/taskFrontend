'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Task, Status } from '@/lib/types';
import { KanbanCard } from './kanban-card';
import Link from 'next/link';

interface KanbanColumnProps {
  id: Status;
  title: string;
  color: string;
  tasks: Task[];
}

export function KanbanColumn({ id, title, color, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col h-full">
      <Card className={`flex-1 ${isOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full border-2 ${color}`} />
              {title}
              <Badge variant="secondary" className="ml-2">
                {tasks.length}
              </Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/tasks/new?status=${id}`}>
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div
            ref={setNodeRef}
            className="space-y-3 min-h-[200px]"
          >
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {tasks.map(task => (
                <KanbanCard key={task.id} task={task} />
              ))}
            </SortableContext>

            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No tasks in {title.toLowerCase()}</p>
                <Button variant="ghost" size="sm" className="mt-2" asChild>
                  <Link href={`/tasks/new?status=${id}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add task
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
