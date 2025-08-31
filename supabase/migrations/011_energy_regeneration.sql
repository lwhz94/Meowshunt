-- Migration: 011_energy_regeneration.sql
-- Implement proper server-side energy regeneration system

-- Function to regenerate energy based on time passed
CREATE OR REPLACE FUNCTION regenerate_energy(p_user_id UUID)
RETURNS TABLE(
    current_energy INTEGER,
    energy_gained INTEGER,
    next_energy_time TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_energy INTEGER;
    v_last_energy_refill TIMESTAMPTZ;
    v_minutes_passed INTEGER;
    v_energy_to_add INTEGER;
    v_new_energy INTEGER;
    v_next_energy_time TIMESTAMPTZ;
BEGIN
    -- Get current energy and last refill time
    SELECT energy, last_energy_refill 
    INTO v_current_energy, v_last_energy_refill
    FROM profiles 
    WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Calculate minutes passed since last energy refill
    v_minutes_passed := EXTRACT(EPOCH FROM (NOW() - v_last_energy_refill)) / 60;
    
    -- Calculate energy to add (1 per 15 minutes, but don't exceed cap of 15)
    v_energy_to_add := LEAST(FLOOR(v_minutes_passed / 15), 15 - v_current_energy);
    
    -- Calculate next energy time (when the next +1 will happen)
    IF v_current_energy < 15 THEN
        -- Calculate time until next energy point
        v_next_energy_time := v_last_energy_refill + 
            (FLOOR(v_minutes_passed / 15) + 1) * INTERVAL '15 minutes';
    ELSE
        -- Already at max energy
        v_next_energy_time := v_last_energy_refill;
    END IF;
    
    -- Only update if we can add energy
    IF v_energy_to_add > 0 THEN
        v_new_energy := v_current_energy + v_energy_to_add;
        
        -- Update energy and last refill time
        UPDATE profiles 
        SET 
            energy = v_new_energy,
            last_energy_refill = NOW()
        WHERE id = p_user_id;
        
        -- Return new values
        RETURN QUERY SELECT v_new_energy, v_energy_to_add, v_next_energy_time;
    ELSE
        -- Return current values without updating
        RETURN QUERY SELECT v_current_energy, 0, v_next_energy_time;
    END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION regenerate_energy(UUID) TO authenticated;

-- Create a function to get user energy with auto-regeneration
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
