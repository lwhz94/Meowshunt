import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { MeowForm } from '@/components/admin/MeowForm';

async function getMeow(id: string) {
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

  const { data: meow, error } = await supabase
    .from('meows')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !meow) {
    return null;
  }

  return meow;
}

export default async function EditMeowPage({ params }: { params: { id: string } }) {
  const meow = await getMeow(params.id);

  if (!meow) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Meow</h1>
        <p className="text-gray-600 mt-2">Update meow properties and settings</p>
      </div>
      
      <MeowForm meow={meow} mode="edit" />
    </div>
  );
}
