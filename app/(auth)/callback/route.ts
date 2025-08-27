import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: (name: string, value: string, options: any) => {
            cookieStore.set(name, value, options);
          },
          remove: (name: string, options: any) => {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          },
        },
      }
    );
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    // Check if authentication was successful
    if (!error && data.session) {
      // Redirect to camp if successfully authenticated
      return NextResponse.redirect(requestUrl.origin + '/camp');
    }
  }

  // If there was an error or no code, redirect to home page
  return NextResponse.redirect(requestUrl.origin);
}
