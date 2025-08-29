import { RouteGuard } from '@/components/auth/route-guard';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Header } from '@/components/layout/header';
import { getLocationsWithAvailabilityAction, setCurrentLocationAction } from '@/lib/actions/location';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
export default async function LocationsPage() {
  const data = await getLocationsWithAvailabilityAction();
  const locations = data.success ? (data.locations as any[]) : [];
  const items = data.success ? (data.items as any[]) : [];
  const meows = data.success ? (data.meows as any[]) : [];
  const currentLocationId = data.success ? (data.currentLocationId as string | null) : null;

  const itemsByLocation = new Map<string, any[]>();
  for (const row of items) {
    const list = itemsByLocation.get(row.location_id) || [];
    list.push(row.item);
    itemsByLocation.set(row.location_id, list);
  }

  const meowsByLocation = new Map<string, any[]>();
  for (const row of meows) {
    const list = meowsByLocation.get(row.location_id) || [];
    list.push(row.meow);
    meowsByLocation.set(row.location_id, list);
  }

  async function setLocation(formData: FormData) {
    'use server'
    const id = formData.get('location_id') as string;
    await setCurrentLocationAction(id);
  }

  return (
    <RouteGuard>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Locations 🗺️
              </h1>
              <p className="text-gray-600">Explore hunting grounds and discover new areas</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {locations.map((loc) => {
                const isCurrent = currentLocationId === loc.id;
                const locItems = itemsByLocation.get(loc.id) || [];
                const locMeows = meowsByLocation.get(loc.id) || [];
                return (
                  <div key={loc.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                          {loc.name}
                          {isCurrent && (
                            <Badge className="text-xs">Current</Badge>
                          )}
                        </h3>
                        <p className="text-gray-600 mt-1">{loc.description || 'No description'}</p>
                        <p className="text-sm text-gray-500 mt-1">Difficulty: {loc.difficulty}</p>
                      </div>
                      <form action={setLocation}>
                        <input type="hidden" name="location_id" value={loc.id} />
                        <Button type="submit" size="sm" disabled={isCurrent} aria-disabled={isCurrent}>
                          {isCurrent ? 'Selected' : 'Select'}
                        </Button>
                      </form>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Available Shop Items</h4>
                      {locItems.length === 0 ? (
                        <p className="text-sm text-gray-500">No items available here.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {locItems.map((it: any) => (
                            <Badge key={it.id} variant="secondary" className="text-xs">{it.name}</Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Possible Meows</h4>
                      {locMeows.length === 0 ? (
                        <p className="text-sm text-gray-500">No known Meows here.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {locMeows.map((m: any) => (
                            <Badge key={m.id} className="text-xs">{m.name}</Badge>
                          ))}
                        </div>
                      )}
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
