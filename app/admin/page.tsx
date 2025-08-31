import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import Link from 'next/link';
import { 
  Users, 
  MapPin, 
  Target, 
  Square, 
  Bone, 
  Package, 
  Cat,
  Plus 
} from 'lucide-react';

async function getAdminStats() {
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

  const [
    usersRes,
    locationsRes,
    trapsRes,
    rugsRes,
    baitsRes,
    itemsRes,
    meowsRes
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('locations').select('id', { count: 'exact' }),
    supabase.from('traps').select('id', { count: 'exact' }),
    supabase.from('rugs').select('id', { count: 'exact' }),
    supabase.from('baits').select('id', { count: 'exact' }),
    supabase.from('items').select('id', { count: 'exact' }),
    supabase.from('meows').select('id', { count: 'exact' })
  ]);

  return {
    users: usersRes.count || 0,
    locations: locationsRes.count || 0,
    traps: trapsRes.count || 0,
    rugs: rugsRes.count || 0,
    baits: baitsRes.count || 0,
    items: itemsRes.count || 0,
    meows: meowsRes.count || 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const quickActions = [
    { href: '/admin/locations', label: 'Add Location', icon: MapPin, color: 'bg-blue-500' },
    { href: '/admin/traps', label: 'Add Trap', icon: Target, color: 'bg-red-500' },
    { href: '/admin/rugs', label: 'Add Rug', icon: Square, color: 'bg-orange-500' },
    { href: '/admin/baits', label: 'Add Bait', icon: Bone, color: 'bg-green-500' },
    { href: '/admin/items', label: 'Add Item', icon: Package, color: 'bg-purple-500' },
    { href: '/admin/meows', label: 'Add Meow', icon: Cat, color: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage game content and monitor player activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.locations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipment</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.traps + stats.rugs + stats.baits}</div>
            <p className="text-xs text-muted-foreground">
              {stats.traps} traps, {stats.rugs} rugs, {stats.baits} baits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meows</CardTitle>
            <Cat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.meows}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{action.label}</h3>
                      <p className="text-sm text-gray-600">Create new entry</p>
                    </div>
                    <Plus className="h-4 w-4 text-gray-400 ml-auto" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">Activity monitoring coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
