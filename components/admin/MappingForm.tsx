"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const mappingSchema = z.object({
  type: z.enum(['item', 'meow']),
  entityId: z.string().min(1, 'Please select an entity'),
  locationId: z.string().min(1, 'Please select a location'),
});

type MappingFormData = z.infer<typeof mappingSchema>;

interface MappingFormProps {
  locations: Array<{ id: string; name: string }>;
  items: Array<{ id: string; name: string; type: string }>;
  meows: Array<{ id: string; name: string }>;
}

export function MappingForm({ locations, items, meows }: MappingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<MappingFormData>({
    type: 'item',
    entityId: '',
    locationId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = mappingSchema.parse(formData);
      setIsSubmitting(true);

      const endpoint = validatedData.type === 'item' ? '/api/admin/item-locations' : '/api/admin/meow-locations';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityId: validatedData.entityId,
          locationId: validatedData.locationId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create mapping');
      }

      toast({
        title: 'Success!',
        description: `Mapping created successfully.`,
      });

      router.refresh();
      setFormData({ type: 'item', entityId: '', locationId: '' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0]?.message || 'Please check your input.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter(item => item.type === formData.type);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Mapping</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Mapping Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'item' | 'meow', entityId: '' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mapping type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="item">Item Location</SelectItem>
                <SelectItem value="meow">Meow Location</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="entityId">
              {formData.type === 'item' ? 'Item' : 'Meow'} *
            </Label>
            <Select
              value={formData.entityId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, entityId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${formData.type}`} />
              </SelectTrigger>
              <SelectContent>
                {(formData.type === 'item' ? filteredItems : meows).map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="locationId">Location *</Label>
            <Select
              value={formData.locationId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, locationId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Mapping'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({ type: 'item', entityId: '', locationId: '' })}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
