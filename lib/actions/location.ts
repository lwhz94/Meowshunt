'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function setCurrentLocationAction(locationId: string | null) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: Record<string, unknown>) => {
          cookieStore.set(name, value, options);
        },
        remove: (name: string, options: Record<string, unknown>) => {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ current_location_id: locationId })
    .eq('id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/locations');
  revalidatePath('/camp');
  return { success: true };
}

export async function getLocationsWithAvailabilityAction() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: Record<string, unknown>) => {
          cookieStore.set(name, value, options);
        },
        remove: (name: string, options: Record<string, unknown>) => {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const [locationsRes, itemsRes, meowsRes, profileRes] = await Promise.all([
    supabase.from('locations').select('*').order('difficulty', { ascending: true }),
    supabase
      .from('item_locations')
      .select('location_id, item:items(*)'),
    supabase
      .from('meow_locations')
      .select('location_id, meow:meows_public(*)'),
    supabase
      .from('profiles')
      .select('current_location_id')
      .eq('id', user.id)
      .single()
  ]);

  if (locationsRes.error || itemsRes.error || meowsRes.error || profileRes.error) {
    return { success: false, error: 'Failed to fetch availability' };
  }

  return {
    success: true,
    locations: locationsRes.data,
    items: itemsRes.data,
    meows: meowsRes.data,
    currentLocationId: (profileRes.data as any)?.current_location_id ?? null
  };
}


