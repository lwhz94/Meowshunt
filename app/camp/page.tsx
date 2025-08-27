import { RouteGuard } from '@/components/auth/route-guard';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Header } from '@/components/layout/header';
import { EnergyDisplay } from '@/components/camp/energy-display';
import { EquipmentDisplay } from '@/components/camp/equipment-display';
import { HuntButton } from '@/components/camp/hunt-button';
import { getProfileDataAction } from '@/lib/actions/profile';
import { applyEnergyRefillAction } from '@/lib/actions/energy';

export default async function CampPage() {
  // Apply energy refill on page load
  await applyEnergyRefillAction();
  
  // Fetch profile data
  const profileData = await getProfileDataAction();
  
  if (!profileData.success) {
    // Handle error - could redirect to error page or show fallback
    console.error('Failed to fetch profile data:', profileData.error);
  }

  const { profile, equipment } = profileData.success ? profileData : { 
    profile: null, 
    equipment: { trap: null, rug: null, bait: null } 
  };

  // Fallback values if profile data is missing
  const currentEnergy = profile?.energy || 0;
  const lastRefill = profile?.last_energy_refill || new Date().toISOString();
  const gold = profile?.gold || 0;
  const exp = profile?.exp || 0;
  const rankName = profile?.rank?.name || 'Novice';

  return (
    <RouteGuard>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to Camp! 🏕️
              </h1>
              <p className="text-gray-600">Your home base for hunting adventures</p>
            </div>

            {/* Energy Display */}
            <EnergyDisplay 
              currentEnergy={currentEnergy}
              lastRefill={lastRefill}
              maxEnergy={15}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Rank */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Current Rank</h3>
                <p className="text-3xl font-bold text-green-600">{rankName}</p>
                <p className="text-sm text-green-700 mt-1">{exp} XP - Keep hunting!</p>
              </div>

              {/* Gold Balance */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Gold Balance</h3>
                <p className="text-3xl font-bold text-yellow-600">{gold}</p>
                <p className="text-sm text-yellow-700 mt-1">Available for shopping</p>
              </div>
            </div>

            {/* Equipment Display */}
            <EquipmentDisplay 
              trap={equipment.trap}
              rug={equipment.rug}
              bait={equipment.bait}
            />

            {/* Hunt Button */}
            <HuntButton 
              energy={currentEnergy}
              trap={equipment.trap}
              rug={equipment.rug}
              bait={equipment.bait}
            />

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="/shop" 
                  className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-all duration-200"
                >
                  🛒 Visit Shop
                </a>
                <a 
                  href="/inventory" 
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all duration-200"
                >
                  📦 Manage Inventory
                </a>
                <a 
                  href="/locations" 
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200"
                >
                  🗺️ View Locations
                </a>
                <a 
                  href="/collections" 
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-all duration-200"
                >
                  📚 Check Collections
                </a>
              </div>
            </div>
          </div>
        </main>
        
        <BottomNav />
      </div>
    </RouteGuard>
  );
}
