#!/usr/bin/env tsx

/**
 * Meowshunt Database Seed Script
 * 
 * This script populates the database with sample data for local development.
 * It creates ranks, locations, items, meows, and mappings to make the game playable.
 * 
 * Usage:
 * 1. Ensure your .env.local has the correct Supabase credentials
 * 2. Run: npm run seed
 * 3. Or run directly: npx tsx scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SeedData {
  ranks: Array<{ id: string; name: string; exp_required: number; description: string }>;
  locations: Array<{ id: string; name: string; description: string; unlock_requirement: string | null }>;
  items: Array<{ id: string; name: string; type: string; description: string; price: number; rarity: string; image_url: string | null }>;
  meows: Array<{ id: string; name: string; description: string; rarity: string; image_url: string | null; base_gold: number; base_exp: number }>;
  itemLocations: Array<{ location_id: string; item_id: string; spawn_chance: number }>;
  meowLocations: Array<{ location_id: string; meow_id: string; spawn_chance: number }>;
}

const seedData: SeedData = {
  // Ranks with progression
  ranks: [
    { id: '1', name: 'Novice Hunter', exp_required: 0, description: 'Just starting your Meow hunting journey' },
    { id: '2', name: 'Apprentice Hunter', exp_required: 100, description: 'Learning the ropes of Meow hunting' },
    { id: '3', name: 'Skilled Hunter', exp_required: 500, description: 'Getting better at catching Meows' },
    { id: '4', name: 'Expert Hunter', exp_required: 1500, description: 'A true master of Meow hunting' },
    { id: '5', name: 'Legendary Hunter', exp_required: 5000, description: 'The ultimate Meow hunting legend' }
  ],

  // Locations with different unlock requirements
  locations: [
    { id: '1', name: 'Backyard Garden', description: 'A peaceful garden where common Meows gather', unlock_requirement: null },
    { id: '2', name: 'Mystic Forest', description: 'A mysterious forest with rare Meows', unlock_requirement: 'Rank 2 (Apprentice Hunter)' }
  ],

  // Items for the shop
  items: [
    // Traps
    { id: '1', name: 'Basic Trap', type: 'trap', description: 'A simple wooden trap for catching Meows', price: 50, rarity: 'common', image_url: null },
    { id: '2', name: 'Steel Trap', type: 'trap', description: 'A sturdy metal trap with better catch rate', price: 150, rarity: 'uncommon', image_url: null },
    { id: '3', name: 'Magic Trap', type: 'trap', description: 'An enchanted trap that attracts rare Meows', price: 500, rarity: 'rare', image_url: null },
    
    // Rugs
    { id: '4', name: 'Simple Rug', type: 'rug', description: 'A basic rug to attract Meows', price: 30, rarity: 'common', image_url: null },
    { id: '5', name: 'Cozy Rug', type: 'rug', description: 'A comfortable rug that Meows love', price: 100, rarity: 'uncommon', image_url: null },
    { id: '6', name: 'Luxury Rug', type: 'rug', description: 'A premium rug that attracts rare Meows', price: 300, rarity: 'rare', image_url: null },
    
    // Baits
    { id: '7', name: 'Catnip', type: 'bait', description: 'Basic catnip to attract Meows', price: 20, rarity: 'common', image_url: null },
    { id: '8', name: 'Premium Catnip', type: 'bait', description: 'High-quality catnip for better attraction', price: 75, rarity: 'uncommon', image_url: null },
    { id: '9', name: 'Mystic Catnip', type: 'bait', description: 'Magical catnip that lures rare Meows', price: 200, rarity: 'rare', image_url: null }
  ],

  // Meows to catch
  meows: [
    { id: '1', name: 'Whiskers', description: 'A friendly tabby cat with long whiskers', rarity: 'common', image_url: null, base_gold: 10, base_exp: 5 },
    { id: '2', name: 'Shadow', description: 'A sleek black cat that moves silently', rarity: 'common', image_url: null, base_gold: 12, base_exp: 6 },
    { id: '3', name: 'Ginger', description: 'A playful orange cat with a fluffy tail', rarity: 'uncommon', image_url: null, base_gold: 25, base_exp: 12 },
    { id: '4', name: 'Luna', description: 'A mysterious white cat with blue eyes', rarity: 'uncommon', image_url: null, base_gold: 30, base_exp: 15 },
    { id: '5', name: 'Thunder', description: 'A powerful cat with lightning-fast reflexes', rarity: 'rare', image_url: null, base_gold: 75, base_exp: 35 },
    { id: '6', name: 'Phoenix', description: 'A legendary cat that rises from the ashes', rarity: 'epic', image_url: null, base_gold: 200, base_exp: 100 }
  ],

  // Item spawn locations
  itemLocations: [
    // Backyard Garden items
    { location_id: '1', item_id: '1', spawn_chance: 0.8 }, // Basic Trap
    { location_id: '1', item_id: '4', spawn_chance: 0.7 }, // Simple Rug
    { location_id: '1', item_id: '7', spawn_chance: 0.9 }, // Catnip
    
    // Mystic Forest items
    { location_id: '2', item_id: '2', spawn_chance: 0.6 }, // Steel Trap
    { location_id: '2', item_id: '5', spawn_chance: 0.5 }, // Cozy Rug
    { location_id: '2', item_id: '8', spawn_chance: 0.7 }, // Premium Catnip
    { location_id: '2', item_id: '3', spawn_chance: 0.3 }, // Magic Trap
    { location_id: '2', item_id: '6', spawn_chance: 0.4 }, // Luxury Rug
    { location_id: '2', item_id: '9', spawn_chance: 0.5 }  // Mystic Catnip
  ],

  // Meow spawn locations
  meowLocations: [
    // Backyard Garden meows
    { location_id: '1', meow_id: '1', spawn_chance: 0.8 }, // Whiskers
    { location_id: '1', meow_id: '2', spawn_chance: 0.7 }, // Shadow
    { location_id: '1', meow_id: '3', spawn_chance: 0.4 }, // Ginger
    
    // Mystic Forest meows
    { location_id: '2', meow_id: '3', spawn_chance: 0.6 }, // Ginger
    { location_id: '2', meow_id: '4', spawn_chance: 0.5 }, // Luna
    { location_id: '2', meow_id: '5', spawn_chance: 0.3 }, // Thunder
    { location_id: '2', meow_id: '6', spawn_chance: 0.1 }  // Phoenix
  ]
};

async function seedRanks() {
  console.log('🌟 Seeding ranks...');
  
  for (const rank of seedData.ranks) {
    const { error } = await supabase
      .from('ranks')
      .upsert(rank, { onConflict: 'id' });
    
    if (error) {
      console.error(`❌ Error seeding rank ${rank.name}:`, error);
    } else {
      console.log(`✅ Rank: ${rank.name} (${rank.exp_required} XP)`);
    }
  }
}

async function seedLocations() {
  console.log('\n📍 Seeding locations...');
  
  for (const location of seedData.locations) {
    const { error } = await supabase
      .from('locations')
      .upsert(location, { onConflict: 'id' });
    
    if (error) {
      console.error(`❌ Error seeding location ${location.name}:`, error);
    } else {
      console.log(`✅ Location: ${location.name}${location.unlock_requirement ? ` (${location.unlock_requirement})` : ''}`);
    }
  }
}

async function seedItems() {
  console.log('\n🛍️ Seeding items...');
  
  for (const item of seedData.items) {
    const { error } = await supabase
      .from('items')
      .upsert(item, { onConflict: 'id' });
    
    if (error) {
      console.error(`❌ Error seeding item ${item.name}:`, error);
    } else {
      console.log(`✅ Item: ${item.name} (${item.type}, ${item.rarity}, ${item.price}g)`);
    }
  }
}

async function seedMeows() {
  console.log('\n🐱 Seeding meows...');
  
  for (const meow of seedData.meows) {
    const { error } = await supabase
      .from('meows')
      .upsert(meow, { onConflict: 'id' });
    
    if (error) {
      console.error(`❌ Error seeding meow ${meow.name}:`, error);
    } else {
      console.log(`✅ Meow: ${meow.name} (${meow.rarity}, ${meow.base_gold}g, ${meow.base_exp} XP)`);
    }
  }
}

async function seedItemLocations() {
  console.log('\n🗺️ Seeding item locations...');
  
  for (const mapping of seedData.itemLocations) {
    const { error } = await supabase
      .from('item_locations')
      .upsert(mapping, { onConflict: 'location_id,item_id' });
    
    if (error) {
      console.error(`❌ Error seeding item location mapping:`, error);
    } else {
      const item = seedData.items.find(i => i.id === mapping.item_id);
      const location = seedData.locations.find(l => l.id === mapping.location_id);
      console.log(`✅ ${item?.name} can spawn in ${location?.name} (${Math.round(mapping.spawn_chance * 100)}% chance)`);
    }
  }
}

async function seedMeowLocations() {
  console.log('\n🐾 Seeding meow locations...');
  
  for (const mapping of seedData.meowLocations) {
    const { error } = await supabase
      .from('meow_locations')
      .upsert(mapping, { onConflict: 'location_id,meow_id' });
    
    if (error) {
      console.error(`❌ Error seeding meow location mapping:`, error);
    } else {
      const meow = seedData.meows.find(m => m.id === mapping.meow_id);
      const location = seedData.locations.find(l => l.id === mapping.location_id);
      console.log(`✅ ${meow?.name} can spawn in ${location?.name} (${Math.round(mapping.spawn_chance * 100)}% chance)`);
    }
  }
}

async function createStarterInventory(userId: string) {
  console.log('\n🎒 Creating starter inventory...');
  
  // Give user basic equipment and some gold
  const starterItems = [
    { item_id: '1', quantity: 1 }, // Basic Trap
    { item_id: '4', quantity: 1 }, // Simple Rug
    { item_id: '7', quantity: 5 }  // Catnip (5x)
  ];
  
  for (const item of starterItems) {
    const { error } = await supabase
      .from('inventory')
      .upsert({
        user_id: userId,
        item_id: item.item_id,
        quantity: item.quantity
      }, { onConflict: 'user_id,item_id' });
    
    if (error) {
      console.error(`❌ Error adding starter item:`, error);
    }
  }
  
  // Set up basic equipment
  const { error: equipError } = await supabase
    .from('equipment')
    .upsert({
      user_id: userId,
      trap_id: '1',  // Basic Trap
      rug_id: '4',   // Simple Rug
      bait_id: '7'   // Catnip
    }, { onConflict: 'user_id' });
  
  if (equipError) {
    console.error(`❌ Error setting up equipment:`, equipError);
  } else {
    console.log(`✅ Starter inventory created for user ${userId}`);
  }
}

async function main() {
  console.log('🚀 Starting Meowshunt database seeding...\n');
  
  try {
    // Seed all data
    await seedRanks();
    await seedLocations();
    await seedItems();
    await seedMeows();
    await seedItemLocations();
    await seedMeowLocations();
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 What was created:');
    console.log(`   • ${seedData.ranks.length} ranks for progression`);
    console.log(`   • ${seedData.locations.length} hunting locations`);
    console.log(`   • ${seedData.items.length} shop items (traps, rugs, baits)`);
    console.log(`   • ${seedData.meows.length} meows to catch`);
    console.log(`   • ${seedData.itemLocations.length} item spawn mappings`);
    console.log(`   • ${seedData.meowLocations.length} meow spawn mappings`);
    
    console.log('\n🎮 The game is now playable!');
    console.log('   • Users can register and get starter equipment');
    console.log('   • Hunt meows in the Backyard Garden');
    console.log('   • Unlock Mystic Forest at Rank 2');
    console.log('   • Buy better equipment from the shop');
    console.log('   • Progress through ranks with experience');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seed script
if (require.main === module) {
  main();
}

export { main as seedDatabase };
