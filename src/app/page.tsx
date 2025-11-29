'use client';

import { StatsCard } from '@/components/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Plus,
  MoreHorizontal,
  Loader2,
  Briefcase
} from 'lucide-react';
import { mockTeamMembers } from '@/lib/mock-data';
import { format } from 'date-fns';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Task, Project } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for adding Team Leader
  const [newTeamLeader, setNewTeamLeader] = useState({ name: '', email: '', password: '' });
  const [isAddingLeader, setIsAddingLeader] = useState(false);

  // State for adding Project
  const [newProject, setNewProject] = useState({ title: '', description: '', teamLeaderId: '', deadline: '' });
  const [isAddingProject, setIsAddingProject] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = [api.get('/tasks')];

        if (user?.role === 'manager') {
          promises.push(api.get('/users?role=team-leader'));
          promises.push(api.get('/projects'));
        }

        const results = await Promise.all(promises);
        const tasksRes = results[0];

        // Convert date strings to Date objects for tasks
        const tasksWithDates = tasksRes.data.map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt)
        }));
        setTasks(tasksWithDates);

        if (user?.role === 'manager') {
          setTeamMembers(results[1].data);
          const projectsWithDates = results[2].data.map((project: any) => ({
            ...project,
            deadline: project.deadline ? new Date(project.deadline) : undefined,
            createdAt: new Date(project.createdAt),
            updatedAt: new Date(project.updatedAt)
          }));
          setProjects(projectsWithDates);
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

  const handleAddTeamLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingLeader(true);
    try {
      const { data } = await api.post('/users', {
        ...newTeamLeader,
        role: 'team-leader'
      });
      setTeamMembers([...teamMembers, data]);
      setNewTeamLeader({ name: '', email: '', password: '' });
      toast.success('Team Leader added successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add team leader');
    } finally {
      setIsAddingLeader(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingProject(true);
    try {
      const { data } = await api.post('/projects', newProject);
      setProjects([...projects, data]);
      setNewProject({ title: '', description: '', teamLeaderId: '', deadline: '' });
      toast.success('Project created successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setIsAddingProject(false);
    }
  };

  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'done').length,
    inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
    overdueTasks: tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== 'done').length
  };

  const projectStats = {
    total: projects.length,
    completed: projects.filter(p => p.status === 'completed').length,
    inProgress: projects.filter(p => p.status === 'active').length,
    overdue: projects.filter(p => p.deadline && p.deadline < new Date() && p.status !== 'completed').length
  };

  const recentTasks = tasks.slice(0, 5);
  const upcomingDeadlines = [...tasks]
    .filter(t => t.dueDate && t.status !== 'done')
    .sort((a, b) => (a.dueDate && b.dueDate ? a.dueDate.getTime() - b.dueDate.getTime() : 0))
    .slice(0, 5);

  const upcomingProjectDeadlines = [...projects]
    .filter(p => p.deadline && p.status !== 'completed')
    .sort((a, b) => (a.deadline && b.deadline ? a.deadline.getTime() - b.deadline.getTime() : 0))
    .slice(0, 5);

  // Calculate category stats dynamically
  const categoryCounts = tasks.reduce((acc, task) => {
    const category = task.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryStats = Object.entries(categoryCounts).map(([name, count], index) => ({
    name,
    count,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
  }));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'todo': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

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
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your tasks.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/tasks/new">
            + New Task
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={user?.role === 'manager' ? "Total Projects" : "Total Tasks"}
          value={user?.role === 'manager' ? projectStats.total : stats.totalTasks}
          description={user?.role === 'manager' ? "Active projects in workspace" : "All tasks in your workspace"}
          icon={user?.role === 'manager' ? Briefcase : CheckSquare}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Completed"
          value={user?.role === 'manager' ? projectStats.completed : stats.completedTasks}
          description={user?.role === 'manager' ? "Projects finished" : "Tasks finished this month"}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="In Progress"
          value={user?.role === 'manager' ? projectStats.inProgress : stats.inProgressTasks}
          description="Currently working on"
          icon={Clock}
        />
        <StatsCard
          title="Overdue"
          value={user?.role === 'manager' ? projectStats.overdue : stats.overdueTasks}
          description={user?.role === 'manager' ? "Projects past deadline" : "Tasks past due date"}
          icon={AlertTriangle}
          trend={{ value: 5, isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {user?.role === 'manager' ? (
          /* Projects Section for Managers */
          <Card className="col-span-1 lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Active Projects</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddProject} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Project Title</Label>
                      <Input
                        value={newProject.title}
                        onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={newProject.description}
                        onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Assign Team Leader</Label>
                      <Select
                        value={newProject.teamLeaderId}
                        onValueChange={value => setNewProject({ ...newProject, teamLeaderId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Team Leader" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.map(leader => (
                            <SelectItem key={leader._id} value={leader._id}>
                              {leader.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Deadline</Label>
                      <Input
                        type="date"
                        value={newProject.deadline}
                        onChange={e => setNewProject({ ...newProject, deadline: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isAddingProject}>
                      {isAddingProject ? 'Creating...' : 'Create Project'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No active projects.</p>
              ) : (
                projects.map(project => (
                  <div key={project._id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <h4 className="font-medium">{project.title}</h4>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{project.status}</Badge>
                        {project.teamLeader && (
                          <span className="text-xs text-muted-foreground">
                            Leader: {(project.teamLeader as any).name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Recent Tasks */}
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Tasks</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/tasks">View All</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentTasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No tasks found. Create one to get started!</p>
                ) : (
                  recentTasks.map((task) => (
                    <div key={task._id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`} />
                        <div>
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {task.category}
                            </Badge>
                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(task.dueDate, 'MMM dd')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Tasks by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryStats.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No categories yet.</p>
                ) : (
                  categoryStats.map((category) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {category.count} tasks
                        </span>
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              backgroundColor: category.color,
                              width: `${(category.count / stats.totalTasks) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Right Column - Team & Deadlines */}
        <div className="space-y-6">
          {/* Team Members / Leaders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {user?.role === 'manager' ? 'Team Leaders' : 'Team Members'}
              </CardTitle>
              {user?.role === 'manager' && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Team Leader</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddTeamLeader} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={newTeamLeader.name}
                          onChange={e => setNewTeamLeader({ ...newTeamLeader, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newTeamLeader.email}
                          onChange={e => setNewTeamLeader({ ...newTeamLeader, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                          type="password"
                          value={newTeamLeader.password}
                          onChange={e => setNewTeamLeader({ ...newTeamLeader, password: e.target.value })}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isAddingLeader}>
                        {isAddingLeader ? 'Adding...' : 'Add Team Leader'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.role === 'manager' ? (
                teamMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No team leaders found.</p>
                ) : (
                  teamMembers.map((member) => (
                    <div key={member._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {member.name.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                mockTeamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-full bg-gray-100"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-950 ${member.status === 'online' ? 'bg-green-500' :
                            member.status === 'busy' ? 'bg-red-500' :
                              member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                            }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(user?.role === 'manager' ? upcomingProjectDeadlines : upcomingDeadlines).length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No upcoming deadlines.</p>
              ) : (
                (user?.role === 'manager' ? upcomingProjectDeadlines : upcomingDeadlines).map((item: any) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div className={`w-1 h-10 rounded-full ${user?.role === 'manager' ? (item.status === 'active' ? 'bg-blue-500' : 'bg-gray-500') : getPriorityColor(item.priority)}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {item.deadline || item.dueDate ? format(item.deadline || item.dueDate, 'MMM dd') : 'No date'}
                        </span>
                        {user?.role !== 'manager' && item.priority === 'urgent' && (
                          <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                            Urgent
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
