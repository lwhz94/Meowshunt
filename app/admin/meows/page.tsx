import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit } from 'lucide-react';
import Link from 'next/link';
import { DeleteMeowButton } from '@/components/admin/DeleteMeowButton';

async function getMeows() {
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

  const { data: meows } = await supabase
    .from('meows')
    .select('*')
    .order('name');

  return meows || [];
}

export default async function MeowsPage() {
  const meows = await getMeows();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meows</h1>
          <p className="text-gray-600 mt-2">Manage huntable Meows and their properties</p>
        </div>
        <Link href="/admin/meows/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Meow
          </Button>
        </Link>
      </div>

      {/* Meows List */}
      <Card>
        <CardHeader>
          <CardTitle>All Meows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {meows.map((meow) => (
              <div key={meow.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">{meow.name}</h3>
                  <p className="text-sm text-gray-600">{meow.description || 'No description'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">Power: {meow.min_power}-{meow.max_power}</Badge>
                    <Badge variant="secondary">Rewards: {meow.reward_gold}g, {meow.reward_exp} XP</Badge>
                    <Badge className={`text-xs ${getRarityColor(meow.rarity)}`}>
                      {meow.rarity}
                    </Badge>
                    <Badge variant="outline">ID: {meow.id.slice(0, 8)}...</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/meows/${meow.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <DeleteMeowButton meowId={meow.id} />
                </div>
              </div>
            ))}
            {meows.length === 0 && (
              <p className="text-gray-500 text-center py-8">No meows found. Create your first one!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getRarityColor(rarity: string) {
  switch (rarity.toLowerCase()) {
    case 'common': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'uncommon': return 'bg-green-100 text-green-800 border-green-200';
    case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'epic': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
