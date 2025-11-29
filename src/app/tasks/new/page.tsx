'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X, Plus, Calendar, Clock, AlertCircle, HelpCircle } from 'lucide-react';
import { Task, Status, Priority, Project, User } from '@/lib/types';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/auth-context';

function NewTaskForm() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get('status') as Status) || 'todo';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: initialStatus,
    priority: 'medium' as Priority,
    category: '',
    dueDate: '',
    tags: [] as string[],
    projectId: '',
    assignedTo: '',
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMembers, setProjectMembers] = useState<any[]>([]); // Using any for now as User type might not match populated member exactly
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      // Allow team leaders AND co-operators (who might be TLs) to fetch projects
      if (user?.role === 'team-leader' || user?.role === 'co-operator') {
        try {
          const { data } = await api.get('/projects');
          setProjects(data);
        } catch (error) {
          console.error('Failed to fetch projects', error);
        }
      }
    };
    fetchProjects();
  }, [user]);

  const handleProjectChange = (projectId: string) => {
    setFormData(prev => ({ ...prev, projectId, assignedTo: '' }));
    const project = projects.find(p => p._id === projectId);
    if (project && project.members) {
      setProjectMembers(project.members);
    } else {
      setProjectMembers([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/tasks', formData);
      router.push('/tasks');
    } catch (error) {
      console.error('Failed to create task', error);
      // You might want to show an error toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/tasks">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Task
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Add a new task to your workspace
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="xl:col-span-2">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter task title..."
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter task description..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                {/* Project and Assignee (For Team Leaders and Co-operators acting as TLs) */}
                {(user?.role === 'team-leader' || user?.role === 'co-operator') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Project</Label>
                      <Select
                        value={formData.projectId}
                        onValueChange={handleProjectChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map(project => (
                            <SelectItem key={project._id} value={project._id}>
                              {project.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Assign To</Label>
                      <Select
                        value={formData.assignedTo}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}
                        disabled={!formData.projectId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Member" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectMembers.map((member: any) => (
                            <SelectItem key={member._id} value={member._id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Status and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: Status) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: Priority) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Category and Due Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      placeholder="e.g., Frontend, Backend, Design"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isSubmitting || !formData.title.trim()}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Creating...' : 'Create Task'}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/tasks">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Task Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg bg-white dark:bg-gray-950 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant={
                    formData.status === 'done' ? 'default' :
                      formData.status === 'in-progress' ? 'secondary' : 'outline'
                  }>
                    {formData.status === 'todo' ? 'To Do' :
                      formData.status === 'in-progress' ? 'In Progress' :
                        formData.status === 'done' ? 'Done' : 'Cancelled'}
                  </Badge>
                  <Badge className={`${formData.priority === 'urgent' ? 'bg-red-500' :
                    formData.priority === 'high' ? 'bg-orange-500' :
                      formData.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    } text-white border-0`}>
                    {formData.priority}
                  </Badge>
                </div>

                <h3 className="font-semibold text-lg mb-2 break-words">
                  {formData.title || 'Task Title'}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-3 break-words">
                  {formData.description || 'Task description will appear here...'}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {formData.category && (
                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {formData.category}
                    </span>
                  )}
                  {formData.dueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formData.dueDate}
                    </span>
                  )}
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t">
                    {formData.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-1.5 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Guidelines Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="space-y-1">
                <p className="font-medium text-gray-900 dark:text-white">Be Specific</p>
                <p>Clear titles help your team understand the task immediately.</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-gray-900 dark:text-white">Set Realistic Deadlines</p>
                <p>Give enough time for review and testing.</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-gray-900 dark:text-white">Use Tags</p>
                <p>Tags help in filtering and organizing tasks effectively.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function NewTaskPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewTaskForm />
    </Suspense>
  );
}
