import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { recalcRankAction } from '@/lib/actions/profile';

export async function POST() {
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
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Regenerate energy before attempting hunt
    const { error: energyError } = await supabase.rpc('regenerate_energy', { p_user_id: user.id });
    if (energyError) {
      return NextResponse.json({ error: 'Failed to regenerate energy' }, { status: 500 });
    }

    // Perform hunt atomically in the database (no hidden fields leaked)
    const { data, error } = await supabase.rpc('hunt_once');
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      return NextResponse.json({ error: 'No result' }, { status: 500 });
    }

    // On catch, recalc rank in background (non-blocking)
    if (row.outcome === 'catch') {
      // Fire and forget; API still returns immediately
      recalcRankAction().catch(() => {});
    }

    return NextResponse.json({
      outcome: row.outcome,
      rewards: { gold: row.reward_gold ?? 0, exp: row.reward_exp ?? 0 },
      displayMeow: {
        id: row.meow_id,
        name: row.meow_name,
        image_url: row.meow_image_url,
        rarity: row.meow_rarity,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


