import { RouteGuard } from '@/components/auth/route-guard';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Header } from '@/components/layout/header';
import { getShopDataAction } from '@/lib/actions/shop';
import { ShopHeader } from '@/components/shop/ShopHeader';
import { ShopList } from '@/components/shop/ShopList';

export default async function ShopPage() {
  const data = await getShopDataAction();
  const items = data.success ? (data.items as Array<{ id: string; name: string; description: string | null; price: number; rarity: string; image_url: string | null }>) : [];
  const gold = data.success ? (data.gold as number) : 0;
  const hasLocation = data.success ? Boolean(data.currentLocationId) : false;

  return (
    <RouteGuard>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop 🛒</h1>
              <p className="text-gray-600">Buy equipment available at your current location</p>
            </div>

            <ShopHeader gold={gold} hasLocation={hasLocation} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!hasLocation ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">No current location selected. Go to Locations to choose one.</p>
                </div>
              ) : items.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">No items available at this location.</p>
                </div>
              ) : (
                <ShopList initialGold={gold} items={items} />
              )}
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    </RouteGuard>
  );
}
