-- Migration: 012_fix_energy_regeneration.sql
-- Fix the energy regeneration function to properly calculate next energy time

-- Drop the existing function
DROP FUNCTION IF EXISTS get_user_energy(UUID);

-- Recreate the function with the fix
CREATE OR REPLACE FUNCTION get_user_energy(p_user_id UUID)
RETURNS TABLE(
    energy INTEGER,
    last_energy_refill TIMESTAMPTZ,
    next_energy_time TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_energy_data RECORD;
BEGIN
    -- First regenerate energy if needed
    SELECT * INTO v_energy_data FROM regenerate_energy(p_user_id);
    
    -- Return current energy state with proper next energy time calculation
    RETURN QUERY 
    SELECT 
        p.energy,
        p.last_energy_refill,
        CASE 
            WHEN p.energy >= 15 THEN 
                p.last_energy_refill  -- Already at max energy
            ELSE 
                p.last_energy_refill + INTERVAL '15 minutes'  -- Next energy point
            END as next_energy_time
    FROM profiles p
    WHERE p.id = p_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_energy(UUID) TO authenticated;
