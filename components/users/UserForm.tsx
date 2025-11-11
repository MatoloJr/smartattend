'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { Loader2, X } from 'lucide-react';

const userFormSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First name must be at least 2 characters.',
  }),
  lastName: z.string().min(2, {
    message: 'Last name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  role: z.enum(['student', 'faculty', 'admin', 'super_admin'], {
    required_error: 'Please select a role.',
  }),
  status: z.enum(['active', 'inactive', 'suspended'], {
    required_error: 'Please select a status.',
  }),
  sendWelcomeEmail: z.boolean().default(false),
  generatePassword: z.boolean().default(true),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  department: z.string().optional(),
  studentId: z.string().optional(),
  employeeId: z.string().optional(),
  phoneNumber: z.string().optional(),
}).refine(
  (data) => {
    if (!data.generatePassword) {
      return data.password && data.password.length >= 8;
    }
    return true;
  },
  {
    message: 'Password must be at least 8 characters long.',
    path: ['password'],
  }
).refine(
  (data) => {
    if (!data.generatePassword) {
      return data.password === data.confirmPassword;
    }
    return true;
  },
  {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  }
);

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  defaultValues?: Partial<UserFormValues>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UserForm({ defaultValues, onSuccess, onCancel }: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      status: 'active',
      generatePassword: true,
      sendWelcomeEmail: true,
      ...defaultValues,
    },
  });

  const watchGeneratePassword = form.watch('generatePassword');
  const watchRole = form.watch('role');

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would send the data to your API
      // await fetch('/api/users', {
      //   method: 'POST',
      //   body: JSON.stringify(data),
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // });
      
      toast({
        title: 'Success!',
        description: data.firstName ? `User ${data.firstName} has been ${defaultValues ? 'updated' : 'created'} successfully.` : 'User saved successfully.',
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/users');
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    const fields = step === 1 ? ['firstName', 'lastName', 'email', 'role', 'status'] : [];
    const isValid = await form.trigger(fields as any);
    
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{defaultValues ? 'Edit User' : 'Add New User'}</CardTitle>
            <CardDescription>
              {step === 1 
                ? 'Enter the basic user information.' 
                : 'Complete the user profile details.'}
            </CardDescription>
          </div>
          {onCancel && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cancel</span>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" type="email" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="faculty">Faculty</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {watchRole === 'student' && (
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student ID</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., S1234567" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {watchRole === 'faculty' && (
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee ID</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., F1234" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Computer Science" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 pt-4 border-t">
                  <FormField
                    control={form.control}
                    name="generatePassword"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Generate a random password</FormLabel>
                          <FormDescription>
                            A secure password will be generated and sent to the user's email.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {!watchGeneratePassword && (
                    <>
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password *</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Enter a password" 
                                {...field} 
                                disabled={isLoading} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password *</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Confirm the password" 
                                {...field} 
                                disabled={isLoading} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name="sendWelcomeEmail"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Send welcome email</FormLabel>
                          <FormDescription>
                            The user will receive an email with their account details.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between pt-6 border-t">
            <div>
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={isLoading}
                >
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {step < 2 ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={isLoading}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {defaultValues ? 'Update User' : 'Create User'}
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
