import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Target, 
  Square, 
  Bone, 
  Package, 
  Cat, 
  Link as LinkIcon,
  Settings
} from 'lucide-react';

async function requireAdmin() {
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) redirect('/camp');
  return user;
}

const adminNavItems = [
  { href: '/admin/locations', label: 'Locations', icon: MapPin },
  { href: '/admin/traps', label: 'Traps', icon: Target },
  { href: '/admin/rugs', label: 'Rugs', icon: Square },
  { href: '/admin/baits', label: 'Baits', icon: Bone },
  { href: '/admin/items', label: 'Items', icon: Package },
  { href: '/admin/meows', label: 'Meows', icon: Cat },
  { href: '/admin/mappings', label: 'Mappings', icon: LinkIcon },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="flex items-center space-x-2">
                <Settings className="w-8 h-8 text-indigo-600" />
                <span className="text-xl font-bold text-gray-900">Admin Panel</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/camp">
                <Button variant="outline" size="sm">Back to Game</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4 space-y-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
