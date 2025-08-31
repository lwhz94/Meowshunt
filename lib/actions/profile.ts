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

    // Get profile data with automatic energy regeneration
    const { data: energyData, error: energyError } = await supabase
      .rpc('get_user_energy', { p_user_id: user.id });
    
    if (energyError) {
      console.error('Error regenerating energy:', energyError);
      throw energyError;
    }

    if (!energyData || energyData.length === 0) {
      throw new Error('Failed to get energy data');
    }

    const energyInfo = energyData[0];
    
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

    // Update profile with regenerated energy data
    const updatedProfile = {
      ...profile,
      energy: energyInfo.energy,
      last_energy_refill: energyInfo.last_energy_refill
    };

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
      profile: updatedProfile,
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

export async function recalcRankAction() {
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Find best rank whose exp_required <= current exp
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, exp')
      .eq('id', user.id)
      .single();
    if (!profile) return { success: false, error: 'Profile not found' };

    const { data: rank } = await supabase
      .from('ranks')
      .select('id, name, exp_required')
      .lte('exp_required', profile.exp)
      .order('exp_required', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!rank) return { success: true };

    await supabase
      .from('profiles')
      .update({ rank_id: rank.id })
      .eq('id', user.id);

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
