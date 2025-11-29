'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X, Plus, Calendar, Check } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { User } from '@/lib/types';

function NewProjectForm() {
    const router = useRouter();
    const [teamLeaders, setTeamLeaders] = useState<User[]>([]);
    const [cooperators, setCooperators] = useState<User[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        teamLeaderId: '',
        deadline: '',
        members: [] as string[], // Array of user IDs
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const tlRes = await api.get('/users?role=team-leader');
                setTeamLeaders(tlRes.data);
                const coRes = await api.get('/users?role=co-operator');
                setCooperators(coRes.data);
            } catch (error) {
                console.error('Failed to fetch users', error);
            }
        };
        fetchUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await api.post('/projects', formData);
            router.push('/tasks'); // Redirect to main dashboard (which shows projects for manager)
        } catch (error) {
            console.error('Failed to create project', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleMember = (userId: string) => {
        setFormData(prev => {
            const members = prev.members.includes(userId)
                ? prev.members.filter(id => id !== userId)
                : [...prev.members, userId];
            return { ...prev, members };
        });
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/tasks">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Create New Project
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Start a new project and assign a team
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <Card>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Project Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="Enter project title..."
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Enter project description..."
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Team Leader</Label>
                                        <Select
                                            value={formData.teamLeaderId}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, teamLeaderId: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Team Leader" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="no-selection" disabled>Select a user</SelectItem>
                                                {/* Show Team Leaders */}
                                                {teamLeaders.map(tl => (
                                                    <SelectItem key={tl._id} value={tl._id}>
                                                        {tl.name} (Team Leader)
                                                    </SelectItem>
                                                ))}
                                                {/* Show Co-operators */}
                                                {cooperators.map(co => (
                                                    <SelectItem key={co._id} value={co._id}>
                                                        {co.name} (Co-operator)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="deadline">Deadline</Label>
                                        <Input
                                            id="deadline"
                                            type="date"
                                            value={formData.deadline}
                                            onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Team Members</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={() => setIsAddMemberOpen(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Member
                                        </Button>
                                    </div>

                                    {/* Selected Members List */}
                                    <div className="flex flex-wrap gap-2 min-h-[100px] border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                                        {formData.members.length === 0 ? (
                                            <div className="text-sm text-gray-500 flex items-center justify-center w-full h-full">
                                                No members selected
                                            </div>
                                        ) : (
                                            formData.members.map(memberId => {
                                                const member = [...teamLeaders, ...cooperators].find(u => u._id === memberId);
                                                if (!member) return null;
                                                return (
                                                    <Badge key={member._id} variant="secondary" className="flex items-center gap-2 p-2">
                                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-700">
                                                            {member.name.charAt(0)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span>{member.name}</span>
                                                            <span className="text-[10px] text-gray-500 capitalize">{member.role}</span>
                                                        </div>
                                                        <button type="button" onClick={() => toggleMember(member._id)} className="ml-2 hover:text-red-500">
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                );
                                            })
                                        )}
                                    </div>

                                    {/* Dialog for Selection */}
                                    <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                                        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                                            <DialogHeader>
                                                <DialogTitle>Select Team Members</DialogTitle>
                                                <DialogDescription>
                                                    Choose members to add to this project.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto p-1">
                                                {[...teamLeaders, ...cooperators]
                                                    .filter(u => u._id !== formData.teamLeaderId)
                                                    .map(user => (
                                                        <div
                                                            key={user._id}
                                                            className={`flex items-center justify-between p-2 rounded cursor-pointer border ${formData.members.includes(user._id)
                                                                ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                                                : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'
                                                                }`}
                                                            onClick={() => toggleMember(user._id)}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">
                                                                    {user.name.charAt(0)}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-medium">{user.name}</span>
                                                                    <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                                                                </div>
                                                            </div>
                                                            {formData.members.includes(user._id) && (
                                                                <Check className="h-4 w-4 text-blue-500" />
                                                            )}
                                                        </div>
                                                    ))}
                                            </div>
                                            <DialogFooter>
                                                <Button type="button" onClick={() => setIsAddMemberOpen(false)}>Done</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" disabled={isSubmitting || !formData.title.trim()}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {isSubmitting ? 'Creating...' : 'Create Project'}
                                    </Button>
                                    <Button type="button" variant="outline" asChild>
                                        <Link href="/tasks">Cancel</Link>
                                    </Button>
                                </div>
                        </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    ); 
} 

export default function NewProjectPage() { 
return (
    <Suspense fallback={<div>Loading...</div>}>
            <NewProjectForm />
        </Suspense>
        );
}