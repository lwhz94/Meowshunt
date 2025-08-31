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

const meowSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  reward_gold: z.coerce.number().min(0, 'Gold reward must be non-negative'),
  reward_exp: z.coerce.number().min(0, 'Experience reward must be non-negative'),
  min_power: z.coerce.number().min(1, 'Min power must be at least 1'),
  max_power: z.coerce.number().min(1, 'Max power must be at least 1'),
}).refine((data) => data.max_power >= data.min_power, {
  message: "Max power must be greater than or equal to min power",
  path: ["max_power"],
});

type MeowFormData = z.infer<typeof meowSchema>;

interface MeowFormProps {
  meow?: {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    reward_gold: number;
    reward_exp: number;
    min_power: number;
    max_power: number;
  };
  mode: 'create' | 'edit';
}

export function MeowForm({ meow, mode }: MeowFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<MeowFormData>({
    name: meow?.name || '',
    description: meow?.description || '',
    image_url: meow?.image_url || '',
    rarity: meow?.rarity || 'common',
    reward_gold: meow?.reward_gold || 0,
    reward_exp: meow?.reward_exp || 0,
    min_power: meow?.min_power || 1,
    max_power: meow?.max_power || 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = meowSchema.parse(formData);
      setIsSubmitting(true);

      const response = await fetch(`/api/admin/meows${mode === 'edit' ? `/${meow?.id}` : ''}`, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save meow');
      }

      toast({
        title: 'Success!',
        description: `Meow ${mode === 'create' ? 'created' : 'updated'} successfully.`,
      });

      router.push('/admin/meows');
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

  const handleInputChange = (field: keyof MeowFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create New Meow' : 'Edit Meow'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter meow name"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter meow description"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reward_gold">Gold Reward *</Label>
              <Input
                id="reward_gold"
                type="number"
                min="0"
                value={formData.reward_gold}
                onChange={(e) => handleInputChange('reward_gold', parseInt(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="reward_exp">Experience Reward *</Label>
              <Input
                id="reward_exp"
                type="number"
                min="0"
                value={formData.reward_exp}
                onChange={(e) => handleInputChange('reward_exp', parseInt(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_power">Min Power *</Label>
              <Input
                id="min_power"
                type="number"
                min="1"
                value={formData.min_power}
                onChange={(e) => handleInputChange('min_power', parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div>
              <Label htmlFor="max_power">Max Power *</Label>
              <Input
                id="max_power"
                type="number"
                min="1"
                value={formData.max_power}
                onChange={(e) => handleInputChange('max_power', parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create Meow' : 'Update Meow')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/meows')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
