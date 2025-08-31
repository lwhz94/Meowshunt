import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';


async function getLocations() {
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

  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .order('difficulty', { ascending: true });

  return locations || [];
}

export default async function LocationsPage() {
  const locations = await getLocations();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-600 mt-2">Manage hunting locations and their difficulty levels</p>
        </div>
        <Link href="/admin/locations/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </Link>
      </div>

      {/* Locations List */}
      <Card>
        <CardHeader>
          <CardTitle>All Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {locations.map((location) => (
              <div key={location.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">{location.name}</h3>
                  <p className="text-sm text-gray-600">{location.description || 'No description'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">Difficulty: {location.difficulty}</Badge>
                    <Badge variant="outline">ID: {location.id.slice(0, 8)}...</Badge>
                  </div>
                  {/* Requirements Display */}
                  {(location.requirements?.rank || location.requirements?.min_level || (location.requirements?.items && location.requirements.items.length > 0)) && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 font-medium mb-1">Requirements:</p>
                      <div className="flex flex-wrap gap-1">
                        {location.requirements?.rank && (
                          <Badge variant="outline" className="text-xs">Rank: {location.requirements.rank}</Badge>
                        )}
                        {location.requirements?.min_level && (
                          <Badge variant="outline" className="text-xs">Level: {location.requirements.min_level}+</Badge>
                        )}
                        {location.requirements?.items && location.requirements.items.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Items: {location.requirements.items.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/locations/${location.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {locations.length === 0 && (
              <p className="text-gray-500 text-center py-8">No locations found. Create your first one!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
