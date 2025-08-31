import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { BaitForm } from '@/components/admin/BaitForm';

async function getBait(id: string) {
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

  const { data: bait, error } = await supabase
    .from('baits')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !bait) {
    return null;
  }

  return bait;
}

export default async function EditBaitPage({ params }: { params: { id: string } }) {
  const bait = await getBait(params.id);

  if (!bait) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Bait</h1>
        <p className="text-gray-600 mt-2">Update bait properties and settings</p>
      </div>
      
      <BaitForm bait={bait} mode="edit" />
    </div>
  );
}
