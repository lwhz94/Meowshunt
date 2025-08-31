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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const baitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  attraction: z.coerce.number().min(1, 'Attraction must be at least 1'),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
});

type BaitFormData = z.infer<typeof baitSchema>;

interface BaitFormProps {
  bait?: {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    price: number;
    attraction: number;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  };
  mode: 'create' | 'edit';
}

export function BaitForm({ bait, mode }: BaitFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BaitFormData>({
    name: bait?.name || '',
    description: bait?.description || '',
    image_url: bait?.image_url || '',
    price: bait?.price || 0,
    attraction: bait?.attraction || 1,
    rarity: bait?.rarity || 'common',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = baitSchema.parse(formData);
      setIsSubmitting(true);

      const response = await fetch(`/api/admin/baits${mode === 'edit' ? `/${bait?.id}` : ''}`, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save bait');
      }

      toast({
        title: 'Success!',
        description: `Bait ${mode === 'create' ? 'created' : 'updated'} successfully.`,
      });

      router.push('/admin/baits');
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

  const handleInputChange = (field: keyof BaitFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create New Bait' : 'Edit Bait'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter bait name"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter bait description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url || ''}
              onChange={(e) => handleInputChange('image_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (Gold) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="attraction">Attraction *</Label>
              <Input
                id="attraction"
                type="number"
                min="1"
                value={formData.attraction}
                onChange={(e) => handleInputChange('attraction', parseInt(e.target.value) || 1)}
                required
              />
              <p className="text-sm text-gray-600 mt-1">Higher = better hunting success</p>
            </div>
          </div>

          <div>
            <Label htmlFor="rarity">Rarity *</Label>
            <Select
              value={formData.rarity}
              onValueChange={(value) => handleInputChange('rarity', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="uncommon">Uncommon</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create Bait' : 'Update Bait')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/baits')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
