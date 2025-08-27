"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, Package, MapPin, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/camp',
    label: 'Camp',
    icon: Home,
    description: 'Your home base'
  },
  {
    href: '/shop',
    label: 'Shop',
    icon: ShoppingCart,
    description: 'Buy equipment'
  },
  {
    href: '/inventory',
    label: 'Inventory',
    icon: Package,
    description: 'Manage items'
  },
  {
    href: '/locations',
    label: 'Locations',
    icon: MapPin,
    description: 'Hunting grounds'
  },
  {
    href: '/collections',
    label: 'Collections',
    icon: BookOpen,
    description: 'Caught meows'
  }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2 px-1 min-w-0",
                "transition-colors duration-200 ease-in-out",
                "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                "hover:bg-gray-50 active:bg-gray-100",
                isActive 
                  ? "text-indigo-600 bg-indigo-50" 
                  : "text-gray-600 hover:text-gray-900"
              )}
              aria-label={item.label}
              title={item.description}
            >
              <Icon 
                className={cn(
                  "h-6 w-6 mb-1",
                  isActive ? "text-indigo-600" : "text-gray-500"
                )} 
                aria-hidden="true"
              />
              <span 
                className={cn(
                  "text-xs font-medium truncate max-w-full",
                  isActive ? "text-indigo-600" : "text-gray-600"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
