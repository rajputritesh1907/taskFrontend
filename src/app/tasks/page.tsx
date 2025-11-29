'use client';


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Task, Status, Priority, Project } from '@/lib/types';
import { format } from 'date-fns';
import Link from 'next/link';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all' | 'active' | 'completed' | 'on-hold'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'createdAt' | 'priority' | 'deadline'>('dueDate');
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation(); // Prevent card click
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await api.delete(`/projects/${projectId}`);
        setProjects(prev => prev.filter(p => p._id !== projectId));
      } catch (error) {
        console.error('Failed to delete project', error);
      }
    }
  };

  const handleProjectStatus = async (e: React.MouseEvent, projectId: string, newStatus: 'active' | 'on-hold') => {
    e.stopPropagation();
    try {
      const { data } = await api.put(`/projects/${projectId}`, { status: newStatus });
      setProjects(prev => prev.map(p => p._id === projectId ? { ...p, status: newStatus } : p));
    } catch (error) {
      console.error('Failed to update project status', error);
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    if (user?.role === 'manager') {
      let filtered = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

        return matchesSearch && matchesStatus;
      });

      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'deadline':
          case 'dueDate':
            if (!a.deadline && !b.deadline) return 0;
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return a.deadline.getTime() - b.deadline.getTime();
          case 'createdAt':
            return b.createdAt.getTime() - a.createdAt.getTime();
          default:
            return 0;
        }
      });
      return filtered;
    } else {
      let filtered = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.category?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      });

      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'dueDate':
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return a.dueDate.getTime() - b.dueDate.getTime();
          case 'createdAt':
            return b.createdAt.getTime() - a.createdAt.getTime();
          case 'priority':
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          default:
            return 0;
        }
      });
      return filtered;
    }
  }, [tasks, projects, searchQuery, statusFilter, priorityFilter, sortBy, user]);

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 hover:bg-red-600';
      case 'high': return 'bg-orange-500 hover:bg-orange-600';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'low': return 'bg-green-500 hover:bg-green-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'done': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress': return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'done': return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'in-progress': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'cancelled': return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {user?.role === 'manager' ? 'All Projects' : 'All Tasks'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {user?.role === 'manager' ? 'Manage and track all projects.' : 'Manage and track all your tasks in one place.'}
          </p>
        </div>
        {user?.role === 'manager' ? (
          <Button asChild className="w-full sm:w-auto">
            <Link href="/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
        ) : (
          <Button asChild className="w-full sm:w-auto">
            <Link href="/tasks/new">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {user?.role === 'manager' ? (
                      <>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>

                {/* Priority Filter - Hide for managers */}
                {user?.role !== 'manager' && (
                  <Select value={priorityFilter} onValueChange={(value: Priority | 'all') => setPriorityFilter(value)}>
                    <SelectTrigger className="w-full lg:w-40">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Sort */}
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={user?.role === 'manager' ? "deadline" : "dueDate"}>
                      {user?.role === 'manager' ? "Deadline" : "Due Date"}
                    </SelectItem>
                    <SelectItem value="createdAt">Created</SelectItem>
                    {user?.role !== 'manager' && <SelectItem value="priority">Priority</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Task List */}
          <div className="space-y-3">
            {filteredAndSortedItems.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {user?.role === 'manager' ? 'No projects found' : 'No tasks found'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your filters{user?.role !== 'manager' && ' or create a new task'}.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredAndSortedItems.map((item: any) => (
                <Card key={item._id} className="hover:shadow-md transition-shadow cursor-pointer hover-lift animate-fade-in">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">
                          {user?.role === 'manager' ? (
                            <div className={`w-4 h-4 rounded-full ${item.status === 'active' ? 'bg-blue-500' : item.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          ) : (
                            getStatusIcon(item.status)
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                            {item.title}
                          </h3>

                          {item.description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {item.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">
                              {item.status.replace('-', ' ')}
                            </Badge>

                            {user?.role !== 'manager' && (
                              <Badge className={`${getPriorityColor(item.priority)} text-white border-0`}>
                                {item.priority}
                              </Badge>
                            )}

                            {item.category && (
                              <Badge variant="outline">
                                {item.category}
                              </Badge>
                            )}

                            {(item.dueDate || item.deadline) && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Calendar className="h-3 w-3" />
                                {format(item.dueDate || item.deadline, 'MMM dd, yyyy')}
                              </div>
                            )}

                            {user?.role === 'manager' && item.teamLeader && (
                              <div className="flex flex-col gap-2 mt-2">
                                <div className="text-sm text-gray-500">
                                  Leader: <span className="font-medium text-gray-900 dark:text-gray-300">{item.teamLeader.name}</span>
                                </div>
                                {item.members && item.members.length > 0 && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Team:</span>
                                    <div className="flex -space-x-2">
                                      {item.members.map((member: any, idx: number) => (
                                        <div
                                          key={member._id}
                                          className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-medium"
                                          title={member.name}
                                        >
                                          {member.name.charAt(0)}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {user?.role === 'manager' && (
                          <>
                            {item.status === 'active' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"
                                onClick={(e) => handleProjectStatus(e, item._id, 'on-hold')}
                                title="Put On Hold"
                              >
                                <PauseCircle className="h-4 w-4" />
                              </Button>
                            ) : item.status === 'on-hold' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                onClick={(e) => handleProjectStatus(e, item._id, 'active')}
                                title="Resume Project"
                              >
                                <PlayCircle className="h-4 w-4" />
                              </Button>
                            ) : null}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={(e) => handleDeleteProject(e, item._id)}
                              title="Delete Project"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Task Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <PlayCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">{user?.role === 'manager' ? 'Active' : 'In Progress'}</span>
                </div>
                <span className="font-bold text-lg">
                  {user?.role === 'manager'
                    ? projects.filter(p => p.status === 'active').length
                    : tasks.filter(t => t.status === 'in-progress').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                    <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="font-medium">{user?.role === 'manager' ? 'On Hold' : 'To Do'}</span>
                </div>
                <span className="font-bold text-lg">
                  {user?.role === 'manager'
                    ? projects.filter(p => p.status === 'on-hold').length
                    : tasks.filter(t => t.status === 'todo').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium">Completed</span>
                </div>
                <span className="font-bold text-lg">
                  {user?.role === 'manager'
                    ? projects.filter(p => p.status === 'completed').length
                    : tasks.filter(t => t.status === 'done').length}
                </span>
              </div>
            </CardContent>
          </Card >

          {/* Calendar Preview */}
          < Card >
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between mb-4">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
                    &lt;
                  </Button>
                  <span className="font-medium">{format(currentDate, 'MMMM yyyy')}</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
                    &gt;
                  </Button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-xs mb-2">
                  <div className="text-gray-500">Su</div>
                  <div className="text-gray-500">Mo</div>
                  <div className="text-gray-500">Tu</div>
                  <div className="text-gray-500">We</div>
                  <div className="text-gray-500">Th</div>
                  <div className="text-gray-500">Fr</div>
                  <div className="text-gray-500">Sa</div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-sm">
                  {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map((day) => {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const itemsOnDate = user?.role === 'manager'
                      ? projects.filter(p => p.deadline && new Date(p.deadline).toDateString() === date.toDateString())
                      : tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === date.toDateString());

                    const hasItems = itemsOnDate.length > 0;
                    const isToday = new Date().toDateString() === date.toDateString();

                    return (
                      <div
                        key={day}
                        className={`
                          aspect-square flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 relative group
                          ${hasItems ? 'bg-blue-100 text-blue-600 font-bold dark:bg-blue-900/30 dark:text-blue-400' : ''}
                          ${isToday ? 'border border-blue-500' : ''}
                        `}
                      >
                        {day}
                        {hasItems && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-48 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs text-left">
                            <div className="font-semibold mb-1 border-b pb-1">{format(date, 'MMM dd')}</div>
                            {itemsOnDate.map((item: any) => (
                              <div key={item._id} className="mb-1 last:mb-0">
                                <div className="font-medium truncate">{item.title}</div>
                                {user?.role === 'manager' && item.teamLeader && (
                                  <div className="text-gray-500 dark:text-gray-400 truncate">Leader: {item.teamLeader.name}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card >

          {/* Quick Tips */}
          < Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0" >
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Pro Tip!</h3>
              <p className="text-blue-100 text-sm mb-4">
                Use tags to organize your tasks better. You can filter by tags in the advanced search.
              </p>
              <Button size="sm" variant="secondary" className="w-full">
                Learn More
              </Button>
            </CardContent>
          </Card >
        </div >
      </div >
    </div >
  );
}
