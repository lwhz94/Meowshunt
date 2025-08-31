import { RouteGuard } from '@/components/auth/route-guard';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Header } from '@/components/layout/header';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getCollections() {
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
  if (!user) return { items: [], discoveredIds: new Set<string>() };

  const [meowsRes, collectionsRes] = await Promise.all([
    supabase.from('meows_public').select('*').order('rarity'),
    supabase.from('collections').select('meow_id, count').eq('user_id', user.id)
  ]);

  const meows = meowsRes.data || [];
  const collections = collectionsRes.data || [];
  const countByMeowId = new Map(collections.map((c: { meow_id: string; count: number }) => [c.meow_id, c.count]));
  const discoveredIds = new Set(collections.map((c: { meow_id: string }) => c.meow_id));

  const items = meows.map((m: { id: string; name: string; image_url: string | null; rarity: string; reward_gold: number; reward_exp: number }) => ({
    id: m.id,
    name: m.name,
    image_url: m.image_url,
    rarity: m.rarity,
    reward_gold: m.reward_gold,
    reward_exp: m.reward_exp,
    count: countByMeowId.get(m.id) || 0,
  }));

  return { items, discoveredIds };
}

export default async function CollectionsPage() {
  const { items, discoveredIds } = await getCollections();

  return (
    <RouteGuard>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meowdex 📚</h1>
              <p className="text-gray-600">Discover Meows and track your collection</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {items.map((m) => {
                const discovered = discoveredIds.has(m.id);
                return (
                  <div key={m.id} className="bg-white rounded-lg shadow p-4 border">
                    <div className="aspect-square mb-3 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                      {discovered && m.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-300 rounded-full" />
                      )}
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{discovered ? m.name : '???'}</div>
                      <div className="text-xs text-gray-600">Rarity: {discovered ? m.rarity : '—'}</div>
                      <div className="text-sm mt-1">Count: {m.count}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    </RouteGuard>
  );
}
