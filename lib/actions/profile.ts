'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getProfileDataAction() {
  try {
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

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        rank:ranks(name, exp_required)
      `)
      .eq('id', user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.email?.split('@')[0] || 'hunter',
            gold: 100,
            exp: 0,
            rank_id: '1', // Default to first rank (Novice)
            energy: 15,
            last_energy_refill: new Date().toISOString(),
          })
          .select(`
            *,
            rank:ranks(name, exp_required)
          `)
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          throw createError;
        }

        return {
          success: true,
          profile: newProfile,
          equipment: { trap: null, rug: null, bait: null }
        };
      }
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

    // Get equipment data
    const { data: equipment, error: equipmentError } = await supabase
      .from('equipment')
      .select(`
        *,
        trap:traps(*),
        rug:rugs(*),
        bait:baits(*)
      `)
      .eq('user_id', user.id)
      .single();

    if (equipmentError && equipmentError.code !== 'PGRST116') {
      console.error('Error fetching equipment:', equipmentError);
      throw equipmentError;
    }

    return {
      success: true,
      profile,
      equipment: equipment || {
        trap: null,
        rug: null,
        bait: null
      }
    };
  } catch (error) {
    console.error('Failed to get profile data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
