-- Initial Meowshunt Database Schema
-- Migration: 001_init.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ranks table
CREATE TABLE ranks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    exp_required INTEGER NOT NULL
);

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    gold INTEGER DEFAULT 0,
    exp INTEGER DEFAULT 0,
    rank_id UUID REFERENCES ranks(id),
    energy INTEGER DEFAULT 15,
    last_energy_refill TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create locations table
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    difficulty INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create traps table
CREATE TABLE traps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    power INTEGER NOT NULL,
    attraction INTEGER NOT NULL,
    rarity TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rugs table
CREATE TABLE rugs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    attraction INTEGER NOT NULL,
    rarity TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create baits table
CREATE TABLE baits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    attraction INTEGER NOT NULL,
    rarity TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create items table
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('trap', 'rug', 'bait', 'cosmetic', 'misc')),
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    rarity TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create item_locations junction table
CREATE TABLE item_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    UNIQUE(item_id, location_id)
);

-- Create meows table (NEVER grant select to authenticated users)
CREATE TABLE meows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    rarity TEXT NOT NULL,
    reward_gold INTEGER DEFAULT 0,
    reward_exp INTEGER DEFAULT 0,
    min_power INTEGER NOT NULL,
    max_power INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meow_locations junction table
CREATE TABLE meow_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meow_id UUID NOT NULL REFERENCES meows(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    UNIQUE(meow_id, location_id)
);

-- Create inventory table
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    UNIQUE(user_id, item_id)
);

-- Create equipment table
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    trap_id UUID REFERENCES traps(id),
    rug_id UUID REFERENCES rugs(id),
    bait_id UUID REFERENCES baits(id)
);

-- Create hunts table
CREATE TABLE hunts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id),
    meow_id UUID REFERENCES meows(id),
    outcome TEXT NOT NULL CHECK (outcome IN ('catch', 'miss')),
    bait_used UUID REFERENCES baits(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meows_public view (exposes limited meow data to authenticated users)
CREATE VIEW meows_public AS
SELECT 
    id,
    name,
    description,
    image_url,
    rarity,
    reward_gold,
    reward_exp
FROM meows;

-- Insert default rank data
INSERT INTO ranks (name, exp_required) VALUES
    ('Novice', 0),
    ('Apprentice', 100),
    ('Hunter', 500),
    ('Expert', 1000),
    ('Master', 2500),
    ('Legendary', 5000);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE hunts ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE traps ENABLE ROW LEVEL SECURITY;
ALTER TABLE rugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE baits ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE meow_locations ENABLE ROW LEVEL SECURITY;

-- Revoke all permissions from authenticated users
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;

-- Grant specific permissions to authenticated users
GRANT SELECT ON items TO authenticated;
GRANT SELECT ON traps TO authenticated;
GRANT SELECT ON rugs TO authenticated;
GRANT SELECT ON baits TO authenticated;
GRANT SELECT ON locations TO authenticated;
GRANT SELECT ON item_locations TO authenticated;
GRANT SELECT ON meow_locations TO authenticated;
GRANT SELECT ON meows_public TO authenticated;

-- RLS Policies

-- Profiles: users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Inventory: users can only access their own inventory
CREATE POLICY "Users can view own inventory" ON inventory
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory" ON inventory
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory" ON inventory
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory" ON inventory
    FOR DELETE USING (auth.uid() = user_id);

-- Equipment: users can only access their own equipment
CREATE POLICY "Users can view own equipment" ON equipment
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own equipment" ON equipment
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own equipment" ON equipment
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own equipment" ON equipment
    FOR DELETE USING (auth.uid() = user_id);

-- Hunts: users can only access their own hunts
CREATE POLICY "Users can view own hunts" ON hunts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hunts" ON hunts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Items, traps, rugs, baits: read access for all authenticated users
CREATE POLICY "Authenticated users can view items" ON items
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view traps" ON traps
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view rugs" ON rugs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view baits" ON baits
    FOR SELECT TO authenticated USING (true);

-- Locations: read access for all authenticated users
CREATE POLICY "Authenticated users can view locations" ON locations
    FOR SELECT TO authenticated USING (true);

-- Junction tables: read access for all authenticated users
CREATE POLICY "Authenticated users can view item_locations" ON item_locations
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view meow_locations" ON meow_locations
    FOR SELECT TO authenticated USING (true);

-- Energy refill function
CREATE OR REPLACE FUNCTION apply_energy_refill()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_energy INTEGER;
    current_last_refill TIMESTAMPTZ;
    minutes_since_refill INTEGER;
    energy_to_add INTEGER;
    new_energy INTEGER;
BEGIN
    -- Get current energy and last refill time
    SELECT energy, last_energy_refill INTO current_energy, current_last_refill
    FROM profiles
    WHERE id = auth.uid();
    
    -- Calculate minutes since last refill
    minutes_since_refill := EXTRACT(EPOCH FROM (NOW() - current_last_refill)) / 60;
    
    -- Calculate energy to add (1 per 15 minutes, up to cap of 15)
    energy_to_add := LEAST(FLOOR(minutes_since_refill / 15), 15 - current_energy);
    
    -- Only proceed if we can add energy
    IF energy_to_add > 0 THEN
        new_energy := current_energy + energy_to_add;
        
        -- Update energy and last refill time
        UPDATE profiles 
        SET 
            energy = new_energy,
            last_energy_refill = NOW()
        WHERE id = auth.uid();
        
        RETURN new_energy;
    ELSE
        RETURN current_energy;
    END IF;
END;
$$;

-- Grant execute permission on energy refill function
GRANT EXECUTE ON FUNCTION apply_energy_refill() TO authenticated;

-- Create indexes for better performance
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_rank_id ON profiles(rank_id);
CREATE INDEX idx_inventory_user_id ON inventory(user_id);
CREATE INDEX idx_inventory_item_id ON inventory(item_id);
CREATE INDEX idx_equipment_user_id ON equipment(user_id);
CREATE INDEX idx_hunts_user_id ON hunts(user_id);
CREATE INDEX idx_hunts_location_id ON hunts(location_id);
CREATE INDEX idx_hunts_created_at ON hunts(created_at);
CREATE INDEX idx_item_locations_item_id ON item_locations(item_id);
CREATE INDEX idx_item_locations_location_id ON item_locations(location_id);
CREATE INDEX idx_meow_locations_meow_id ON meow_locations(meow_id);
CREATE INDEX idx_meow_locations_location_id ON meow_locations(location_id);
