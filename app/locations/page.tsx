import { RouteGuard } from '@/components/auth/route-guard';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Header } from '@/components/layout/header';

export default function LocationsPage() {
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

            {/* Locations Content */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Areas</h2>
              <p className="text-gray-600">Locations functionality coming soon...</p>
            </div>
          </div>
        </main>
        
        <BottomNav />
      </div>
    </RouteGuard>
  );
}
