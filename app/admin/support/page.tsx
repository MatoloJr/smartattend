'use client';

import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MessageSquare, Phone, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type SupportRequest = {
  name: string;
  email: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
};

export default function SupportPage() {
  const [formData, setFormData] = useState<SupportRequest>({
    name: '',
    email: '',
    subject: '',
    priority: 'medium',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, name?: string) => {
    if (typeof e === 'string' && name) {
      setFormData(prev => ({ ...prev, [name]: e }));
    } else if (e && typeof e === 'object' && 'target' in e) {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would send the data to your backend
      // await fetch('/api/support', {
      //   method: 'POST',
      //   body: JSON.stringify(formData),
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // });
      
      setIsSubmitted(true);
      toast({
        title: 'Support request submitted!',
        description: 'We\'ve received your request and will get back to you soon.',
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        priority: 'medium',
        message: ''
      });
      
      // Reset submission status after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error submitting your request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Support">
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Support Center</h2>
          <p className="text-muted-foreground">
            Need help? Contact our support team or browse our knowledge base.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Email Support</CardTitle>
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Get help via email</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Send us an email and we&apos;ll get back to you within 24 hours.
              </p>
              <Button variant="link" className="px-0 mt-2">
                support@smartattend.com
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Live Chat</CardTitle>
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Chat with our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our team is available 24/7 to help you with any questions.
              </p>
              <Button className="mt-2">
                Start Chat
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Emergency</CardTitle>
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <CardDescription>Critical issues that need immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                For urgent matters, please call our emergency support line.
              </p>
              <Button variant="link" className="px-0 mt-2">
                +1 (555) 123-4567
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submit a Support Request</CardTitle>
            <CardDescription>
              Fill out the form below and our team will get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-medium">Request Submitted</h3>
                <p className="text-sm text-muted-foreground">
                  Thank you for contacting us. We&apos;ll get back to you soon.
                </p>
                <Button onClick={() => setIsSubmitted(false)} variant="outline" className="mt-4">
                  Submit Another Request
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What's this about?"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => handleChange(value, 'priority')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Please describe your issue in detail..."
                    className="min-h-[150px]"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Submit Request'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base">How do I reset my password?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You can reset your password by clicking on the "Forgot Password" link on the login page. 
                  You&apos;ll receive an email with instructions to reset your password.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base">How do I generate attendance reports?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Navigate to the Reports section and select the type of report you need. 
                  You can filter by date range, course, or student, then click "Generate Report".
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base">How do I add a new course?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Go to the Courses section and click on "Add New Course". 
                  Fill in the required details and save. The course will be available for selection immediately.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
