// Database types for Meowshunt
// Generated from the database schema

export interface Rank {
  id: string;
  name: string;
  exp_required: number;
  created_at?: string;
}

export interface Profile {
  id: string;
  username: string;
  gold: number;
  exp: number;
  rank_id: string | null;
  energy: number;
  last_energy_refill: string;
  current_location_id?: string | null;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  description: string | null;
  difficulty: number;
  created_at: string;
}

export interface Trap {
  id: string;
  name: string;
  description: string | null;
  price: number;
  power: number;
  attraction: number;
  rarity: string;
  image_url: string | null;
  created_at: string;
}

export interface Rug {
  id: string;
  name: string;
  description: string | null;
  price: number;
  attraction: number;
  rarity: string;
  image_url: string | null;
  created_at: string;
}

export interface Bait {
  id: string;
  name: string;
  description: string | null;
  price: number;
  attraction: number;
  rarity: string;
  image_url: string | null;
  created_at: string;
}

export interface Item {
  id: string;
  type: 'trap' | 'rug' | 'bait' | 'cosmetic' | 'misc';
  name: string;
  description: string | null;
  price: number;
  rarity: string;
  image_url: string | null;
  created_at: string;
}

export interface ItemLocation {
  id: string;
  item_id: string;
  location_id: string;
}

export interface MeowPublic {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  rarity: string;
  reward_gold: number;
  reward_exp: number;
}

export interface MeowLocation {
  id: string;
  meow_id: string;
  location_id: string;
}

export interface Inventory {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
}

export interface Equipment {
  id: string;
  user_id: string;
  trap_id: string | null;
  rug_id: string | null;
  bait_id: string | null;
}

export interface Hunt {
  id: string;
  user_id: string;
  location_id: string;
  meow_id: string | null;
  outcome: 'catch' | 'miss';
  bait_used: string | null;
  created_at: string;
}

// Database enums
export type ItemType = 'trap' | 'rug' | 'bait' | 'cosmetic' | 'misc';
export type HuntOutcome = 'catch' | 'miss';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// RPC function return types
export interface EnergyRefillResult {
  new_energy: number;
}

// Helper types for equipment validation
export interface EquippedItems {
  trap: Trap | null;
  rug: Rug | null;
  bait: Bait | null;
}

export interface EquipmentWithDetails {
  trap: Trap | null;
  rug: Rug | null;
  bait: Bait | null;
  isFullyEquipped: boolean;
}

// Database table names for type safety
export type TableName = 
  | 'ranks'
  | 'profiles'
  | 'locations'
  | 'traps'
  | 'rugs'
  | 'baits'
  | 'items'
  | 'item_locations'
  | 'meows'
  | 'meow_locations'
  | 'inventory'
  | 'equipment'
  | 'hunts';

// View names
export type ViewName = 'meows_public';

// Function names
export type FunctionName = 'apply_energy_refill';
