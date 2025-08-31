import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit } from 'lucide-react';
import Link from 'next/link';
import { DeleteBaitButton } from '@/components/admin/DeleteBaitButton';

async function getBaits() {
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

  const { data: baits } = await supabase
    .from('baits')
    .select('*')
    .order('name');

  return baits || [];
}

export default async function BaitsPage() {
  const baits = await getBaits();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Baits</h1>
          <p className="text-gray-600 mt-2">Manage hunting baits and their properties</p>
        </div>
        <Link href="/admin/baits/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Bait
          </Button>
        </Link>
      </div>

      {/* Baits List */}
      <Card>
        <CardHeader>
          <CardTitle>All Baits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {baits.map((bait) => (
              <div key={bait.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">{bait.name}</h3>
                  <p className="text-sm text-gray-600">{bait.description || 'No description'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">Attraction: {bait.attraction}</Badge>
                    <Badge variant="secondary">Price: {bait.price}g</Badge>
                    <Badge className={`text-xs ${getRarityColor(bait.rarity)}`}>
                      {bait.rarity}
                    </Badge>
                    <Badge variant="outline">ID: {bait.id.slice(0, 8)}...</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/baits/${bait.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <DeleteBaitButton baitId={bait.id} />
                </div>
              </div>
            ))}
            {baits.length === 0 && (
              <p className="text-gray-500 text-center py-8">No baits found. Create your first one!</p>
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
