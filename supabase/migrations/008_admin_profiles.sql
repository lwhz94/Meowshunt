-- Migration: 008_admin_profiles.sql

-- Add admin flag to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- Update RLS policies to allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE is_admin = TRUE
    )
  );

-- Grant admins access to all tables for management
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
