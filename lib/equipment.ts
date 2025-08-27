import { supabase } from '@/lib/supabase/client';
import type { 
  Equipment, 
  Trap, 
  Rug, 
  Bait, 
  EquippedItems, 
  EquipmentWithDetails 
} from '@/types/db';

/**
 * Gets the current equipment for the authenticated user
 */
export async function getCurrentEquipment(): Promise<Equipment | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No equipment record found, return null
        return null;
      }
      console.error('Error fetching equipment:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to get current equipment:', error);
    throw error;
  }
}

/**
 * Gets the current equipment with full item details
 */
export async function getCurrentEquipmentWithDetails(): Promise<EquipmentWithDetails> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('equipment')
      .select(`
        *,
        trap:traps(*),
        rug:rugs(*),
        bait:baits(*)
      `)
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No equipment record found, return empty equipment
        return {
          trap: null,
          rug: null,
          bait: null,
          isFullyEquipped: false
        };
      }
      console.error('Error fetching equipment with details:', error);
      throw error;
    }
    
    const trap = data.trap as Trap | null;
    const rug = data.rug as Rug | null;
    const bait = data.bait as Bait | null;
    
    return {
      trap,
      rug,
      bait,
      isFullyEquipped: !!(trap && rug && bait)
    };
  } catch (error) {
    console.error('Failed to get equipment with details:', error);
    throw error;
  }
}

/**
 * Sets the current equipment for the authenticated user
 */
export async function setCurrentEquipment(equipment: Partial<EquippedItems>): Promise<Equipment> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Check if equipment record exists
    const existingEquipment = await getCurrentEquipment();
    
    if (existingEquipment) {
      // Update existing equipment
      const { data, error } = await supabase
        .from('equipment')
        .update({
          trap_id: equipment.trap?.id || null,
          rug_id: equipment.rug?.id || null,
          bait_id: equipment.bait?.id || null
        })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating equipment:', error);
        throw error;
      }
      
      return data;
    } else {
      // Create new equipment record
      const { data, error } = await supabase
        .from('equipment')
        .insert({
          user_id: user.id,
          trap_id: equipment.trap?.id || null,
          rug_id: equipment.rug?.id || null,
          bait_id: equipment.bait?.id || null
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating equipment:', error);
        throw error;
      }
      
      return data;
    }
  } catch (error) {
    console.error('Failed to set current equipment:', error);
    throw error;
  }
}

/**
 * Equips a specific item in the specified slot
 */
export async function equipItem(itemId: string, itemType: 'trap' | 'rug' | 'bait'): Promise<Equipment> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const existingEquipment = await getCurrentEquipment();
    
    if (existingEquipment) {
      // Update existing equipment
      const updateData: Partial<Equipment> = {};
      updateData[`${itemType}_id`] = itemId;
      
      const { data, error } = await supabase
        .from('equipment')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating equipment:', error);
        throw error;
      }
      
      return data;
    } else {
      // Create new equipment record
      const insertData: Partial<Equipment> = {
        user_id: user.id
      };
      insertData[`${itemType}_id`] = itemId;
      
      const { data, error } = await supabase
        .from('equipment')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating equipment:', error);
        throw error;
      }
      
      return data;
    }
  } catch (error) {
    console.error('Failed to equip item:', error);
    throw error;
  }
}

/**
 * Unequips an item from the specified slot
 */
export async function unequipItem(itemType: 'trap' | 'rug' | 'bait'): Promise<Equipment> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const updateData: Partial<Equipment> = {};
    updateData[`${itemType}_id`] = null;
    
    const { data, error } = await supabase
      .from('equipment')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error unequipping item:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to unequip item:', error);
    throw error;
  }
}

/**
 * Checks if the user has all three equipment slots filled
 */
export async function isFullyEquipped(): Promise<boolean> {
  try {
    const equipment = await getCurrentEquipmentWithDetails();
    return equipment.isFullyEquipped;
  } catch (error) {
    console.error('Failed to check if fully equipped:', error);
    return false;
  }
}

/**
 * Gets the total power and attraction bonuses from equipped items
 */
export async function getEquipmentStats(): Promise<{ power: number; attraction: number }> {
  try {
    const equipment = await getCurrentEquipmentWithDetails();
    
    let power = 0;
    let attraction = 0;
    
    if (equipment.trap) {
      power += equipment.trap.power;
      attraction += equipment.trap.attraction;
    }
    
    if (equipment.rug) {
      attraction += equipment.rug.attraction;
    }
    
    if (equipment.bait) {
      attraction += equipment.bait.attraction;
    }
    
    return { power, attraction };
  } catch (error) {
    console.error('Failed to get equipment stats:', error);
    return { power: 0, attraction: 0 };
  }
}
