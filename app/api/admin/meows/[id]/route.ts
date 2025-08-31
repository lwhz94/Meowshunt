import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const meowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  reward_gold: z.number().min(0),
  reward_exp: z.number().min(0),
  min_power: z.number().min(1),
  max_power: z.number().min(1),
}).refine((data) => data.max_power >= data.min_power, {
  message: "Max power must be greater than or equal to min power",
  path: ["max_power"],
});

async function requireAdmin() {
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
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  return profile?.is_admin ? user : null;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = meowSchema.parse(body);

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

    const { data, error } = await supabase
      .from('meows')
      .update(validatedData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const { error } = await supabase
      .from('meows')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
