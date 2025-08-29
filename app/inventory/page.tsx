import { RouteGuard } from '@/components/auth/route-guard';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Header } from '@/components/layout/header';
import InventoryList from '@/components/inventory/inventory-list';

export default function InventoryPage() {
  return (
    <RouteGuard>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Inventory 📦
              </h1>
              <p className="text-gray-600">Manage your equipment and items</p>
            </div>

            {/* Inventory Content */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Items</h2>
              <InventoryList />
            </div>
          </div>
        </main>
        
        <BottomNav />
      </div>
    </RouteGuard>
  );
}
