'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

function getServerClient() {
  const cookieStore = cookies();
  // cookies() returns a Promise in some envs; handle both
  const getStore = (cookieStore as { get: (name: string) => { value: string } | undefined }).get ? cookieStore : cookieStore;
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => getStore.get(name)?.value,
        set: (name: string, value: string, options: Record<string, unknown>) => {
          getStore.set(name, value, options);
        },
        remove: (name: string, options: Record<string, unknown>) => {
          getStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
}

export async function getShopDataAction() {
  try {
    const supabase = getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('gold, current_location_id')
      .eq('id', user.id)
      .single();
    if (profileError) return { success: false, error: 'Failed to load profile' };

    if (!profile.current_location_id) {
      return { success: true, gold: profile.gold, items: [], currentLocationId: null };
    }

    const { data: items, error: itemsError } = await supabase
      .from('item_locations')
      .select('item:items(*)')
      .eq('location_id', profile.current_location_id);
    if (itemsError) return { success: false, error: 'Failed to load items' };

    return {
      success: true,
      gold: profile.gold,
      items: (items || []).map((r: { item: unknown }) => r.item),
      currentLocationId: profile.current_location_id,
    };
  } catch {
    return { success: false, error: 'Unknown error' };
  }
}

export async function purchaseItemAction(itemId: string, quantity: number = 1) {
  try {
    const supabase = getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase.rpc('purchase_item', { p_item_id: itemId, p_quantity: quantity });
    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/shop');
    revalidatePath('/camp');
    return { success: true, newGold: (data as { new_gold?: number })?.new_gold ?? null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}


