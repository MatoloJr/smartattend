'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UserForm } from './UserForm';

interface UserDialogProps {
  trigger?: React.ReactNode;
  defaultValues?: any;
  onSuccess?: () => void;
}

export function UserDialog({ 
  trigger,
  defaultValues,
  onSuccess 
}: UserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isEditMode = !!defaultValues;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && onSuccess) {
      onSuccess();
    }
  };

  const handleSuccess = () => {
    setIsOpen(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <Button 
          onClick={() => setIsOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {isEditMode ? 'Edit User' : 'Add User'}
        </Button>
      )}
      
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit User' : 'Add New User'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <UserForm 
            defaultValues={defaultValues}
            onSuccess={handleSuccess}
            onCancel={() => setIsOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
