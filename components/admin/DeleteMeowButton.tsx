"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DeleteMeowButtonProps {
  meowId: string;
}

export function DeleteMeowButton({ meowId }: DeleteMeowButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this meow? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/admin/meows/${meowId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete meow');
      }

      toast({
        title: 'Success!',
        description: 'Meow deleted successfully.',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {isDeleting ? 'Deleting...' : 'Delete'}
    </Button>
  );
}
