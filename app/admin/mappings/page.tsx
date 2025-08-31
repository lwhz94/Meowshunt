import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MappingForm } from '@/components/admin/MappingForm';
import { DeleteMappingButton } from '@/components/admin/DeleteMappingButton';

async function getMappingsData() {
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

  const [locations, items, meows, itemLocations, meowLocations] = await Promise.all([
    supabase.from('locations').select('*').order('name'),
    supabase.from('items').select('*').order('name'),
    supabase.from('meows_public').select('*').order('name'),
    supabase.from('item_locations').select('*, location:locations(name), item:items(name)'),
    supabase.from('meow_locations').select('*, location:locations(name), meow:meows_public(name)'),
  ]);

  return {
    locations: locations.data || [],
    items: items.data || [],
    meows: meows.data || [],
    itemLocations: itemLocations.data || [],
    meowLocations: meowLocations.data || [],
  };
}

export default async function MappingsPage() {
  const { locations, items, meows, itemLocations, meowLocations } = await getMappingsData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Location Mappings</h1>
        <p className="text-gray-600 mt-2">Manage which items and meows appear at each location</p>
      </div>

      {/* Add New Mapping Form */}
      <MappingForm locations={locations} items={items} meows={meows} />

      {/* Item Mappings */}
      <Card>
        <CardHeader>
          <CardTitle>Item Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {itemLocations.map((mapping) => (
              <div key={mapping.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">
                    {mapping.item?.name} → {mapping.location?.name}
                  </div>
                  <div className="text-sm text-gray-600">ID: {mapping.id.slice(0, 8)}...</div>
                </div>
                <DeleteMappingButton 
                  type="item" 
                  mappingId={mapping.id} 
                />
              </div>
            ))}
            {itemLocations.length === 0 && (
              <p className="text-gray-500 text-center py-8">No item mappings found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Meow Mappings */}
      <Card>
        <CardHeader>
          <CardTitle>Meow Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {meowLocations.map((mapping) => (
              <div key={mapping.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">
                    {mapping.meow?.name} → {mapping.location?.name}
                  </div>
                  <div className="text-sm text-gray-600">ID: {mapping.id.slice(0, 8)}...</div>
                </div>
                <DeleteMappingButton 
                  type="meow" 
                  mappingId={mapping.id} 
                />
              </div>
            ))}
            {meowLocations.length === 0 && (
              <p className="text-gray-500 text-center py-8">No meow mappings found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{locations.length}</div>
            <div className="text-sm text-gray-600">Total Locations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{itemLocations.length}</div>
            <div className="text-sm text-gray-600">Item Mappings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{meowLocations.length}</div>
            <div className="text-sm text-gray-600">Meow Mappings</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
