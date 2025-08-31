import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
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
      return NextResponse.json({ 
        success: false, 
        error: 'User not authenticated' 
      }, { status: 401 });
    }

    // Test the energy regeneration function directly
    const { data: energyData, error: energyError } = await supabase
      .rpc('regenerate_energy', { p_user_id: user.id });
    
    if (energyError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Energy regeneration failed',
        details: energyError.message
      }, { status: 500 });
    }

    // Get current profile data to see the results
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('energy, last_energy_refill')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to get profile data',
        details: profileError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      energyRegeneration: energyData,
      currentProfile: profile,
      message: 'Energy regeneration test completed'
    });

  } catch (error) {
    console.error('Energy test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
