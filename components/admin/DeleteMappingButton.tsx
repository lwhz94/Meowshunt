"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DeleteMappingButtonProps {
  type: 'item' | 'meow';
  mappingId: string;
}

export function DeleteMappingButton({ type, mappingId }: DeleteMappingButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this ${type} mapping?`)) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const endpoint = type === 'item' ? '/api/admin/item-locations' : '/api/admin/meow-locations';
      
      const response = await fetch(`${endpoint}?id=${mappingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete mapping');
      }

      toast({
        title: 'Success!',
        description: `${type} mapping deleted successfully.`,
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
      {isDeleting ? 'Deleting...' : 'Remove'}
    </Button>
  );
}
