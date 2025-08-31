-- Migration: 003_purchase_item.sql

-- Atomic purchase function with location restriction and gold check
CREATE OR REPLACE FUNCTION purchase_item(p_item_id UUID)
RETURNS TABLE(new_gold INTEGER, new_quantity INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_price INTEGER;
    v_current_location UUID;
    v_quantity INTEGER;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Ensure user has a current location selected
    SELECT current_location_id INTO v_current_location
    FROM profiles
    WHERE id = v_user_id;

    IF v_current_location IS NULL THEN
        RAISE EXCEPTION 'No current location selected';
    END IF;

    -- Ensure the item is available at the current location
    IF NOT EXISTS (
        SELECT 1
        FROM item_locations il
        WHERE il.item_id = p_item_id
          AND il.location_id = v_current_location
    ) THEN
        RAISE EXCEPTION 'Item not available at current location';
    END IF;

    -- Get price
    SELECT price INTO v_price
    FROM items
    WHERE id = p_item_id;

    IF v_price IS NULL THEN
        RAISE EXCEPTION 'Item not found';
    END IF;

    -- Ensure sufficient gold and update atomically
    UPDATE profiles
    SET gold = gold - v_price
    WHERE id = v_user_id AND gold >= v_price
    RETURNING gold INTO new_gold;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient gold';
    END IF;

    -- Upsert inventory quantity
    INSERT INTO inventory (user_id, item_id, quantity)
    VALUES (v_user_id, p_item_id, 1)
    ON CONFLICT (user_id, item_id)
    DO UPDATE SET quantity = inventory.quantity + 1
    RETURNING quantity INTO new_quantity;

    RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION purchase_item(UUID) TO authenticated;


