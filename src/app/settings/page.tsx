'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Bell,
  Palette,
  Shield,
  Database,
  Save,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    profile: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      bio: 'Product manager passionate about building great user experiences.',
      avatar: ''
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      taskReminders: true,
      weeklyReports: false
    },
    preferences: {
      defaultView: 'kanban',
      itemsPerPage: '10',
      autoSave: true,
      compactMode: false
    }
  });

  const handleSave = () => {
    // In a real app, this would save to backend
    console.log('Saving settings:', settings);
    // Show success message
  };

  const handleReset = () => {
    // Reset to defaults
    console.log('Resetting settings');
  };

  const handleExportData = () => {
    // Export user data
    console.log('Exporting data');
  };

  const handleDeleteAccount = () => {
    // Delete account (with confirmation)
    console.log('Deleting account');
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account preferences and application settings.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReset} className="flex-1 sm:flex-none">
            <RefreshCw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Reset</span>
            <span className="sm:hidden">Reset</span>
          </Button>
          <Button onClick={handleSave} className="flex-1 sm:flex-none">
            <Save className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Save Changes</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </div>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={settings.profile.name}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  profile: { ...prev.profile, name: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.profile.email}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  profile: { ...prev.profile, email: e.target.value }
                }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={settings.profile.bio}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                profile: { ...prev.profile, bio: e.target.value }
              }))}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Theme</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred theme
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={theme === 'light' ? 'default' : 'secondary'}>
                {theme === 'light' ? 'Light' : 'Dark'}
              </Badge>
              <Button variant="outline" size="sm" onClick={toggleTheme}>
                Switch to {theme === 'light' ? 'Dark' : 'Light'}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="compact-mode" className="text-base">Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Use a more compact layout to fit more content
              </p>
            </div>
            <Switch
              id="compact-mode"
              checked={settings.preferences.compactMode}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                preferences: { ...prev.preferences, compactMode: checked }
              }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.notifications.emailNotifications}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, emailNotifications: checked }
              }))}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-notifications" className="text-base">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications in your browser
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={settings.notifications.pushNotifications}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, pushNotifications: checked }
              }))}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="task-reminders" className="text-base">Task Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded about upcoming due dates
              </p>
            </div>
            <Switch
              id="task-reminders"
              checked={settings.notifications.taskReminders}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, taskReminders: checked }
              }))}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weekly-reports" className="text-base">Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly productivity reports
              </p>
            </div>
            <Switch
              id="weekly-reports"
              checked={settings.notifications.weeklyReports}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, weeklyReports: checked }
              }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default View</Label>
              <Select
                value={settings.preferences.defaultView}
                onValueChange={(value) => setSettings(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, defaultView: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kanban">Kanban Board</SelectItem>
                  <SelectItem value="list">Task List</SelectItem>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Items Per Page</Label>
              <Select
                value={settings.preferences.itemsPerPage}
                onValueChange={(value) => setSettings(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, itemsPerPage: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-save" className="text-base">Auto-save</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save changes as you work
              </p>
            </div>
            <Switch
              id="auto-save"
              checked={settings.preferences.autoSave}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                preferences: { ...prev.preferences, autoSave: checked }
              }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Export Data</Label>
              <p className="text-sm text-muted-foreground">
                Download all your tasks and settings
              </p>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              Export
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base text-destructive">Danger Zone</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
