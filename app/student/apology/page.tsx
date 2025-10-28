'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileQuestion, 
  Upload, 
  X, 
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockSessions, mockUsers } from '@/lib/mock-data';
import { toast } from 'sonner';

interface ApologyFormData {
  startDate: string;
  endDate: string;
  affectedSessions: string[];
  reasonCategory: string;
  reasonDetails: string;
  supportingDocuments: File[];
  emailUpdates: boolean;
  smsUpdates: boolean;
}

const StudentApology: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<ApologyFormData>({
    startDate: '',
    endDate: '',
    affectedSessions: [],
    reasonCategory: '',
    reasonDetails: '',
    supportingDocuments: [],
    emailUpdates: true,
    smsUpdates: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Get student's enrolled courses
  const student = mockUsers.find(u => u.id === user?.id);
  const enrolledCourses = student?.enrolled_courses || [];
  
  // Get sessions within date range
  const getAffectedSessions = () => {
    if (!formData.startDate || !formData.endDate) return [];
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    return mockSessions.filter(session => {
      const sessionDate = new Date(session.date);
      return enrolledCourses.includes(session.course_code) &&
             sessionDate >= start && 
             sessionDate <= end;
    });
  };

  const affectedSessions = getAffectedSessions();

  const handleSessionToggle = (sessionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      affectedSessions: checked 
        ? [...prev.affectedSessions, sessionId]
        : prev.affectedSessions.filter(id => id !== sessionId)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      supportingDocuments: [...prev.supportingDocuments, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      supportingDocuments: prev.supportingDocuments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate || !formData.reasonCategory || !formData.reasonDetails.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.affectedSessions.length === 0) {
      toast.error('Please select at least one affected session');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const apologyRecord = {
        id: `apology_${Date.now()}`,
        student_id: user?.id,
        student_name: user?.name,
        session_ids: formData.affectedSessions,
        start_date: formData.startDate,
        end_date: formData.endDate,
        reason_category: formData.reasonCategory,
        reason_details: formData.reasonDetails,
        supporting_documents: formData.supportingDocuments.map(file => ({
          filename: file.name,
          uploaded_at: new Date().toISOString()
        })),
        status: 'pending',
        submitted_at: new Date().toISOString()
      };

      console.log('Apology submitted:', apologyRecord);
      
      setSubmitted(true);
      toast.success('Apology submitted successfully!');
      
    } catch (error) {
      console.error('Error submitting apology:', error);
      toast.error('Failed to submit apology');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <DashboardLayout title="Apology Submitted">
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
          <Card className="glass border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
            <CardContent className="text-center py-8">
              <div className="mb-4">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
                Apology Submitted Successfully! 📝
              </h2>
              <p className="text-green-600 dark:text-green-400 mb-6">
                Your absence request has been submitted and is now under review.
              </p>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold mb-2">Request Details</h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p>Period: {formData.startDate} to {formData.endDate}</p>
                  <p>Sessions: {formData.affectedSessions.length} affected</p>
                  <p>Reason: {formData.reasonCategory}</p>
                  <p>Status: <Badge variant="outline">Pending Review</Badge></p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="text-left">
                    <h4 className="font-medium text-blue-700 dark:text-blue-300">What happens next?</h4>
                    <ul className="text-sm text-blue-600 dark:text-blue-400 mt-2 space-y-1">
                      <li>• Your request will be reviewed by the relevant faculty</li>
                      <li>• You'll receive email updates on the status</li>
                      <li>• Approved apologies will update your attendance records</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      startDate: '',
                      endDate: '',
                      affectedSessions: [],
                      reasonCategory: '',
                      reasonDetails: '',
                      supportingDocuments: [],
                      emailUpdates: true,
                      smsUpdates: false
                    });
                  }} 
                  variant="outline" 
                  className="flex-1"
                >
                  Submit Another
                </Button>
                <Button onClick={() => router.push('/student/dashboard')} className="flex-1">
                  Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Submit Absence Apology">
      <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />
              Submit Absence Apology
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Absence Start Date *</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">Absence End Date *</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Affected Sessions */}
              {affectedSessions.length > 0 && (
                <div className="space-y-3">
                  <Label>Affected Sessions</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {affectedSessions.map((session) => (
                      <div key={session.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <Checkbox
                          id={session.id}
                          checked={formData.affectedSessions.includes(session.id)}
                          onCheckedChange={(checked) => handleSessionToggle(session.id, checked as boolean)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{session.course_code}</Badge>
                            <span className="text-sm font-medium">{session.course_name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(session.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{session.start_time} - {session.end_time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reason Category */}
              <div className="space-y-3">
                <Label>Reason Category *</Label>
                <RadioGroup
                  value={formData.reasonCategory}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, reasonCategory: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medical" id="medical" />
                    <Label htmlFor="medical">Medical Emergency</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="family" id="family" />
                    <Label htmlFor="family">Family Emergency</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="official" id="official" />
                    <Label htmlFor="official">Official University Duty</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="transport" id="transport" />
                    <Label htmlFor="transport">Transportation Issues</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Detailed Explanation */}
              <div className="space-y-2">
                <Label htmlFor="details">Detailed Explanation *</Label>
                <Textarea
                  id="details"
                  placeholder="Please provide a detailed explanation of your absence..."
                  value={formData.reasonDetails}
                  onChange={(e) => setFormData(prev => ({ ...prev, reasonDetails: e.target.value }))}
                  rows={4}
                  required
                />
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <Label>Supporting Documents</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                          Upload supporting documents
                        </span>
                        <span className="mt-1 block text-sm text-gray-500">
                          Medical certificates, official letters, etc.
                        </span>
                      </Label>
                      <input
                        id="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>
                </div>

                {/* Uploaded Files */}
                {formData.supportingDocuments.length > 0 && (
                  <div className="space-y-2">
                    {formData.supportingDocuments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notification Preferences */}
              <div className="space-y-3">
                <Label>Notification Preferences</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email-updates"
                      checked={formData.emailUpdates}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailUpdates: checked as boolean }))}
                    />
                    <Label htmlFor="email-updates">Email me updates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sms-updates"
                      checked={formData.smsUpdates}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, smsUpdates: checked as boolean }))}
                    />
                    <Label htmlFor="sms-updates">SMS notifications</Label>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/student/dashboard')}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.startDate || !formData.endDate || !formData.reasonCategory || !formData.reasonDetails.trim()}
                  className="flex-1"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Apology'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="glass border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-300">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
              <p>• Submit apologies as early as possible</p>
              <p>• Provide clear and honest explanations</p>
              <p>• Upload relevant supporting documents</p>
              <p>• Contact your lecturer if you have questions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentApology;