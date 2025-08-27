import { supabase } from '@/lib/supabase/client';
import type { EnergyRefillResult } from '@/types/db';

/**
 * Applies energy refill for the current user
 * Calls the SQL RPC function apply_energy_refill()
 * Returns the new energy level
 */
export async function applyEnergyRefill(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('apply_energy_refill');
    
    if (error) {
      console.error('Error applying energy refill:', error);
      throw error;
    }
    
    // The RPC function returns the new energy level directly
    return data as number;
  } catch (error) {
    console.error('Failed to apply energy refill:', error);
    throw error;
  }
}

/**
 * Gets the current energy level for the authenticated user
 */
export async function getCurrentEnergy(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('energy')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching current energy:', error);
      throw error;
    }
    
    return data.energy;
  } catch (error) {
    console.error('Failed to get current energy:', error);
    throw error;
  }
}

/**
 * Gets energy information including last refill time
 */
export async function getEnergyInfo() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('energy, last_energy_refill')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching energy info:', error);
      throw error;
    }
    
    return {
      currentEnergy: data.energy,
      lastRefill: new Date(data.last_energy_refill),
      maxEnergy: 15
    };
  } catch (error) {
    console.error('Failed to get energy info:', error);
    throw error;
  }
}

/**
 * Calculates how much energy can be refilled based on time since last refill
 */
export function calculateRefillableEnergy(lastRefill: Date, currentEnergy: number, maxEnergy: number = 15): number {
  const now = new Date();
  const minutesSinceRefill = (now.getTime() - lastRefill.getTime()) / (1000 * 60);
  const energyPer15Minutes = 1;
  const refillableEnergy = Math.floor(minutesSinceRefill / 15) * energyPer15Minutes;
  
  return Math.min(refillableEnergy, maxEnergy - currentEnergy);
}

/**
 * Checks if energy refill is available
 */
export function canRefillEnergy(lastRefill: Date, currentEnergy: number, maxEnergy: number = 15): boolean {
  return calculateRefillableEnergy(lastRefill, currentEnergy, maxEnergy) > 0;
}
