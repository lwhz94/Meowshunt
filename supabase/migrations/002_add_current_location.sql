-- Migration: 002_add_current_location.sql

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS current_location_id UUID NULL REFERENCES locations(id);

CREATE INDEX IF NOT EXISTS idx_profiles_current_location_id
ON profiles(current_location_id);


