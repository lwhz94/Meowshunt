"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';

const locationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  difficulty: z.coerce.number().min(1, 'Difficulty must be at least 1').max(10, 'Difficulty must be at most 10'),
  requirements: z.object({
    items: z.array(z.string().uuid()).optional(),
    rank: z.string().optional(),
    min_level: z.number().min(1).optional(),
  }).optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormProps {
  location?: {
    id: string;
    name: string;
    description?: string;
    difficulty: number;
    requirements?: {
      items?: string[];
      rank?: string;
      min_level?: number;
    };
  };
  mode: 'create' | 'edit';
}

export function LocationForm({ location, mode }: LocationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LocationFormData>({
    name: location?.name || '',
    description: location?.description || '',
    difficulty: location?.difficulty || 1,
    requirements: {
      items: location?.requirements?.items || [],
      rank: location?.requirements?.rank || '',
      min_level: location?.requirements?.min_level || undefined,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = locationSchema.parse(formData);
      setIsSubmitting(true);

      const response = await fetch(`/api/admin/locations${mode === 'edit' ? `/${location?.id}` : ''}`, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save location');
      }

      toast({
        title: 'Success!',
        description: `Location ${mode === 'create' ? 'created' : 'updated'} successfully.`,
      });

      router.push('/admin/locations');
      router.refresh();
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

  const handleInputChange = (field: keyof LocationFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create New Location' : 'Edit Location'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter location name"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter location description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="difficulty">Difficulty *</Label>
            <Input
              id="difficulty"
              type="number"
              min="1"
              max="10"
              value={formData.difficulty}
              onChange={(e) => handleInputChange('difficulty', parseInt(e.target.value) || 1)}
              required
            />
            <p className="text-sm text-gray-600 mt-1">1 = easiest, 10 = hardest</p>
          </div>

          {/* Requirements Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Access Requirements</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="rank">Required Rank</Label>
                <Input
                  id="rank"
                  value={formData.requirements?.rank || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    requirements: { ...prev.requirements, rank: e.target.value }
                  }))}
                  placeholder="e.g., Apprentice, Hunter, Master"
                />
                <p className="text-sm text-gray-600 mt-1">Leave empty for no rank requirement</p>
              </div>

              <div>
                <Label htmlFor="min_level">Minimum Level</Label>
                <Input
                  id="min_level"
                  type="number"
                  min="1"
                  value={formData.requirements?.min_level || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    requirements: { 
                      ...prev.requirements, 
                      min_level: e.target.value ? parseInt(e.target.value) : undefined 
                    }
                  }))}
                  placeholder="e.g., 5"
                />
                <p className="text-sm text-gray-600 mt-1">Leave empty for no level requirement</p>
              </div>

              <div>
                <Label>Required Items</Label>
                <div className="space-y-2">
                  {formData.requirements?.items?.map((itemId, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={itemId}
                        onChange={(e) => {
                          const newItems = [...(formData.requirements?.items || [])];
                          newItems[index] = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            requirements: { ...prev.requirements, items: newItems }
                          }));
                        }}
                        placeholder="Item UUID"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newItems = formData.requirements?.items?.filter((_, i) => i !== index) || [];
                          setFormData(prev => ({
                            ...prev,
                            requirements: { ...prev.requirements, items: newItems }
                          }));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newItems = [...(formData.requirements?.items || []), ''];
                      setFormData(prev => ({
                        ...prev,
                        requirements: { ...prev.requirements, items: newItems }
                      }));
                    }}
                  >
                    Add Required Item
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-1">Add item UUIDs that players must have to access this location</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create Location' : 'Update Location')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/locations')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
