'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  Save,
  User,
  Bell,
  Clock,
  QrCode,
  Mail,
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const FacultySettings: React.FC = () => {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    // Profile Settings
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    employeeId: user?.employee_id || '',
    bio: '',
    
    // Session Preferences
    defaultSessionDuration: 90,
    qrCodeExpiry: 30,
    autoEndSession: true,
    lateThreshold: 15,
    
    // Notification Preferences
    emailNotifications: true,
    smsNotifications: false,
    sessionReminders: true,
    attendanceAlerts: true,
    
    // Privacy Settings
    profileVisibility: 'institution',
    showContactInfo: true,
    allowStudentMessages: true,
    
    // Security
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Validate password change if attempted
      if (settings.newPassword && settings.newPassword !== settings.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Settings saved successfully!');
      
      // Clear password fields
      setSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout title="Faculty Settings">
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Faculty Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your profile and teaching preferences
            </p>
          </div>
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => handleSettingChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleSettingChange('email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={settings.department}
                  onChange={(e) => handleSettingChange('department', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee-id">Employee ID</Label>
                <Input
                  id="employee-id"
                  value={settings.employeeId}
                  onChange={(e) => handleSettingChange('employeeId', e.target.value)}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell students about yourself..."
                  value={settings.bio}
                  onChange={(e) => handleSettingChange('bio', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Session Preferences */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Session Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-duration">Default Session Duration (minutes)</Label>
                <Input
                  id="session-duration"
                  type="number"
                  value={settings.defaultSessionDuration}
                  onChange={(e) => handleSettingChange('defaultSessionDuration', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qr-expiry">QR Code Expiry (minutes)</Label>
                <Input
                  id="qr-expiry"
                  type="number"
                  value={settings.qrCodeExpiry}
                  onChange={(e) => handleSettingChange('qrCodeExpiry', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="late-threshold">Late Threshold (minutes)</Label>
                <Input
                  id="late-threshold"
                  type="number"
                  value={settings.lateThreshold}
                  onChange={(e) => handleSettingChange('lateThreshold', parseInt(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-end Sessions</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically end sessions after scheduled time
                  </p>
                </div>
                <Switch
                  checked={settings.autoEndSession}
                  onCheckedChange={(checked) => handleSettingChange('autoEndSession', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <Label>Email Notifications</Label>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <Label>SMS Notifications</Label>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session Reminders</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get reminded before scheduled sessions
                  </p>
                </div>
                <Switch
                  checked={settings.sessionReminders}
                  onCheckedChange={(checked) => handleSettingChange('sessionReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Attendance Alerts</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified about low attendance rates
                  </p>
                </div>
                <Switch
                  checked={settings.attendanceAlerts}
                  onCheckedChange={(checked) => handleSettingChange('attendanceAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <Select value={settings.profileVisibility} onValueChange={(value) => handleSettingChange('profileVisibility', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="institution">Institution Only</SelectItem>
                    <SelectItem value="department">Department Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Show Contact Information</Label>
                <Switch
                  checked={settings.showContactInfo}
                  onCheckedChange={(checked) => handleSettingChange('showContactInfo', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Allow Student Messages</Label>
                <Switch
                  checked={settings.allowStudentMessages}
                  onCheckedChange={(checked) => handleSettingChange('allowStudentMessages', checked)}
                />
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium">Change Password</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? 'text' : 'password'}
                      value={settings.currentPassword}
                      onChange={(e) => handleSettingChange('currentPassword', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={settings.newPassword}
                    onChange={(e) => handleSettingChange('newPassword', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={settings.confirmPassword}
                    onChange={(e) => handleSettingChange('confirmPassword', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultySettings;