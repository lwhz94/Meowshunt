'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function applyEnergyRefillAction() {
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

    // Call the RPC function
    const { data, error } = await supabase.rpc('apply_energy_refill');
    
    if (error) {
      console.error('Error applying energy refill:', error);
      throw error;
    }

    // Revalidate the camp page to show updated energy
    revalidatePath('/camp');
    
    return { success: true, newEnergy: data as number };
  } catch (error) {
    console.error('Failed to apply energy refill:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
