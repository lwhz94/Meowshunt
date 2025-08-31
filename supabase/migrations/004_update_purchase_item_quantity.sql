-- Migration: 004_update_purchase_item_quantity.sql

-- Extend purchase to support quantity
CREATE OR REPLACE FUNCTION purchase_item(p_item_id UUID, p_quantity INTEGER)
RETURNS TABLE(new_gold INTEGER, new_quantity INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_price INTEGER;
    v_total INTEGER;
    v_current_location UUID;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF p_quantity IS NULL OR p_quantity <= 0 THEN
        RAISE EXCEPTION 'Invalid quantity';
    END IF;

    SELECT current_location_id INTO v_current_location
    FROM profiles
    WHERE id = v_user_id;

    IF v_current_location IS NULL THEN
        RAISE EXCEPTION 'No current location selected';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM item_locations il
        WHERE il.item_id = p_item_id AND il.location_id = v_current_location
    ) THEN
        RAISE EXCEPTION 'Item not available at current location';
    END IF;

    SELECT price INTO v_price FROM items WHERE id = p_item_id;
    IF v_price IS NULL THEN
        RAISE EXCEPTION 'Item not found';
    END IF;

    v_total := v_price * p_quantity;

    UPDATE profiles
    SET gold = gold - v_total
    WHERE id = v_user_id AND gold >= v_total
    RETURNING gold INTO new_gold;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient gold';
    END IF;

    INSERT INTO inventory (user_id, item_id, quantity)
    VALUES (v_user_id, p_item_id, p_quantity)
    ON CONFLICT (user_id, item_id)
    DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity
    RETURNING quantity INTO new_quantity;

    RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION purchase_item(UUID, INTEGER) TO authenticated;


