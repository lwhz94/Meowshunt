-- Migration: 006_hunt_once.sql

-- Atomic hunt function encapsulating RNG and updates without leaking hidden fields
CREATE OR REPLACE FUNCTION hunt_once()
RETURNS TABLE (
  outcome TEXT,
  reward_gold INTEGER,
  reward_exp INTEGER,
  meow_id UUID,
  meow_name TEXT,
  meow_image_url TEXT,
  meow_rarity TEXT,
  new_energy INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_energy INTEGER;
  v_current_location UUID;
  v_trap_id UUID;
  v_rug_id UUID;
  v_bait_id UUID;
  v_trap_power INTEGER;
  v_rug_attraction INTEGER;
  v_bait_attraction INTEGER;
  v_meow RECORD;
  v_effective_power INTEGER;
  v_roll INTEGER;
  v_bait_item_id UUID;
  v_bait_quantity INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get profile and ensure energy > 0 and current location exists
  SELECT energy, current_location_id INTO v_energy, v_current_location
  FROM profiles
  WHERE id = v_user_id;

  IF v_current_location IS NULL THEN
    RAISE EXCEPTION 'No current location selected';
  END IF;

  IF v_energy IS NULL OR v_energy <= 0 THEN
    RAISE EXCEPTION 'Not enough energy';
  END IF;

  -- Ensure equipment is present
  SELECT trap_id, rug_id, bait_id INTO v_trap_id, v_rug_id, v_bait_id
  FROM equipment
  WHERE user_id = v_user_id;

  IF v_trap_id IS NULL OR v_rug_id IS NULL OR v_bait_id IS NULL THEN
    RAISE EXCEPTION 'Missing equipment';
  END IF;

  -- Get stats for equipment
  SELECT power INTO v_trap_power FROM traps WHERE id = v_trap_id;
  SELECT attraction INTO v_rug_attraction FROM rugs WHERE id = v_rug_id;
  SELECT attraction INTO v_bait_attraction FROM baits WHERE id = v_bait_id;

  IF v_trap_power IS NULL OR v_rug_attraction IS NULL OR v_bait_attraction IS NULL THEN
    RAISE EXCEPTION 'Invalid equipment stats';
  END IF;

  -- Find matching items row for bait to consume from inventory
  SELECT it.id INTO v_bait_item_id
  FROM items it
  JOIN baits b ON b.id = v_bait_id
  WHERE it.type = 'bait' AND it.name = b.name
  LIMIT 1;

  IF v_bait_item_id IS NULL THEN
    RAISE EXCEPTION 'Bait item mapping not found';
  END IF;

  -- Check inventory has bait available
  SELECT quantity INTO v_bait_quantity
  FROM inventory
  WHERE user_id = v_user_id AND item_id = v_bait_item_id;

  IF v_bait_quantity IS NULL OR v_bait_quantity <= 0 THEN
    RAISE EXCEPTION 'No bait remaining';
  END IF;

  -- Select a random meow available at current location
  SELECT m.* INTO v_meow
  FROM meows m
  JOIN meow_locations ml ON ml.meow_id = m.id
  WHERE ml.location_id = v_current_location
  ORDER BY random()
  LIMIT 1;

  IF v_meow IS NULL THEN
    RAISE EXCEPTION 'No meows available at this location';
  END IF;

  -- Compute effective power (MVP): trap.power + rug.attraction + bait.attraction
  v_effective_power := v_trap_power + v_rug_attraction + v_bait_attraction;

  -- Compute random roll in [min_power, max_power]
  v_roll := FLOOR(random() * (v_meow.max_power - v_meow.min_power + 1))::INTEGER + v_meow.min_power;

  -- Start atomic updates
  -- Decrement energy and bait quantity, insert hunt, and apply rewards if caught
  -- Use a CTE to enforce energy >= 1 and bait >= 1 at time of update
  WITH updated_profile AS (
    UPDATE profiles
    SET energy = energy - 1
    WHERE id = v_user_id AND energy >= 1
    RETURNING energy
  ), updated_inventory AS (
    UPDATE inventory
    SET quantity = quantity - 1
    WHERE user_id = v_user_id AND item_id = v_bait_item_id AND quantity >= 1
    RETURNING quantity
  )
  SELECT energy FROM updated_profile; -- force execution

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Energy update failed';
  END IF;

  -- Ensure bait update succeeded
  GET DIAGNOSTICS v_bait_quantity = ROW_COUNT;
  IF v_bait_quantity = 0 THEN
    RAISE EXCEPTION 'Bait update failed';
  END IF;

  -- Determine outcome and record hunt
  IF v_effective_power >= v_roll THEN
    -- Catch
    INSERT INTO hunts (user_id, location_id, meow_id, outcome, bait_used)
    VALUES (v_user_id, v_current_location, v_meow.id, 'catch', v_bait_id);

    -- Apply rewards
    UPDATE profiles
    SET gold = gold + COALESCE(v_meow.reward_gold, 0),
        exp = exp + COALESCE(v_meow.reward_exp, 0)
    WHERE id = v_user_id
    RETURNING energy INTO new_energy;

    -- Increment collections count
    INSERT INTO collections (user_id, meow_id, count)
    VALUES (v_user_id, v_meow.id, 1)
    ON CONFLICT (user_id, meow_id)
    DO UPDATE SET count = collections.count + 1;

    outcome := 'catch';
    reward_gold := COALESCE(v_meow.reward_gold, 0);
    reward_exp := COALESCE(v_meow.reward_exp, 0);
  ELSE
    -- Miss
    INSERT INTO hunts (user_id, location_id, meow_id, outcome, bait_used)
    VALUES (v_user_id, v_current_location, v_meow.id, 'miss', v_bait_id);

    SELECT energy INTO new_energy FROM profiles WHERE id = v_user_id;

    outcome := 'miss';
    reward_gold := 0;
    reward_exp := 0;
  END IF;

  meow_id := v_meow.id;
  meow_name := v_meow.name;
  meow_image_url := v_meow.image_url;
  meow_rarity := v_meow.rarity;

  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION hunt_once() TO authenticated;


