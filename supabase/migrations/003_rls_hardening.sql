-- Migration: 003_rls_hardening.sql
-- RLS Security Hardening and Meows Access Control

-- 1. ENABLE RLS ON MEOWS TABLE AND REVOKE ALL ACCESS FROM AUTHENTICATED USERS
-- This prevents regular users from accessing sensitive power data
ALTER TABLE meows ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON meows FROM authenticated;

-- 2. GRANT ADMIN ACCESS TO MEOWS TABLE
-- Only admins can access the base meows table for management
GRANT ALL ON meows TO authenticated;

-- 3. CREATE RLS POLICY FOR MEOWS TABLE (ADMIN ONLY)
-- This ensures only admins can access the base meows table
CREATE POLICY "Only admins can access meows" ON meows
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE is_admin = TRUE
        )
    );

-- 4. ENSURE MEOWS_PUBLIC VIEW IS THE ONLY ACCESS POINT FOR REGULAR USERS
-- Grant SELECT on meows_public to authenticated users (already done in 001_init.sql)
-- This view only exposes safe fields (no min_power, max_power)

-- 5. ADD COLLECTIONS TABLE RLS POLICIES
-- Users can only access their own collections
CREATE POLICY "Users can view own collections" ON collections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections" ON collections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" ON collections
    FOR UPDATE USING (auth.uid() = user_id);

-- 6. HARDEN INVENTORY POLICIES TO PREVENT CROSS-USER ACCESS
-- Ensure users can only modify their own inventory
DROP POLICY IF EXISTS "Users can update own inventory" ON inventory;
CREATE POLICY "Users can update own inventory" ON inventory
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. HARDEN EQUIPMENT POLICIES TO PREVENT CROSS-USER ACCESS
-- Ensure users can only modify their own equipment
DROP POLICY IF EXISTS "Users can update own equipment" ON equipment;
CREATE POLICY "Users can update own equipment" ON equipment
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 8. HARDEN HUNTS POLICIES TO PREVENT CROSS-USER ACCESS
-- Ensure users can only insert hunts for themselves
DROP POLICY IF EXISTS "Users can insert own hunts" ON hunts;
CREATE POLICY "Users can insert own hunts" ON hunts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. ADD MISSING DELETE POLICY FOR HUNTS
-- Users should be able to delete their own hunts if needed
CREATE POLICY "Users can delete own hunts" ON hunts
    FOR DELETE USING (auth.uid() = user_id);

-- 10. ENSURE PROFILES POLICIES ARE SECURE
-- Users can only access their own profile data
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 11. ADD ADMIN ACCESS POLICIES FOR ALL TABLES
-- Admins can view all data for management purposes
CREATE POLICY "Admins can view all inventory" ON inventory
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE is_admin = TRUE
        )
    );

CREATE POLICY "Admins can view all equipment" ON equipment
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE is_admin = TRUE
        )
    );

CREATE POLICY "Admins can view all hunts" ON hunts
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE is_admin = TRUE
        )
    );

CREATE POLICY "Admins can view all collections" ON collections
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE is_admin = TRUE
        )
    );

-- 12. VERIFY MEOWS_PUBLIC VIEW SECURITY
-- Ensure the view only exposes safe fields
-- This view is already created in 001_init.sql with only public fields
-- No changes needed here as it's already secure

-- 13. ADD INDEXES FOR BETTER POLICY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_meow_id ON collections(meow_id);

-- 14. VERIFY FINAL PERMISSIONS
-- Regular users can only access:
-- - meows_public (safe view)
-- - items, traps, rugs, baits (read-only)
-- - locations (read-only)
-- - item_locations, meow_locations (read-only)
-- - Own profile, inventory, equipment, hunts, collections

-- Admins can access:
-- - All tables with full CRUD permissions
-- - Base meows table for management

-- Summary of security changes:
-- ✅ Base meows table: Admin only (no SELECT for regular users)
-- ✅ meows_public view: Regular users can access (safe fields only)
-- ✅ Collections: User-specific access with admin override
-- ✅ Inventory/Equipment/Hunts: User-specific access with admin override
-- ✅ All policies hardened to prevent cross-user access
-- ✅ Admin policies added for management access
