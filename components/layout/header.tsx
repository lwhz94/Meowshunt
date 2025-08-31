"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";
import { MobileMenu } from "./mobile-menu";
import { Menu, X, Settings } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export function Header() {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rankName, setRankName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) { 
        setRankName(null); 
        setIsAdmin(false);
        return; 
      }
      
      const [rankRes, adminRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('rank:ranks(name)')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle()
      ]);
      
      if (!rankRes.error && rankRes.data) {
        setRankName((rankRes.data as { rank: { name: string }[] })?.rank?.[0]?.name ?? null);
      } else {
        setRankName(null);
      }
      
      if (!adminRes.error && adminRes.data) {
        setIsAdmin((adminRes.data as { is_admin?: boolean })?.is_admin ?? false);
      } else {
        setIsAdmin(false);
      }
    };
    loadUserData();
  }, [user]);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">🐱</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Meowshunt</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <a href="/camp" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Camp
                </a>
                <a href="/shop" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Shop
                </a>
                <a href="/inventory" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Inventory
                </a>
                <a href="/locations" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Locations
                </a>
                <a href="/collections" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Collections
                </a>
                {isAdmin && (
                  <a href="/admin" className="text-indigo-700 hover:text-indigo-900 px-3 py-2 text-sm font-medium flex items-center gap-1">
                    <Settings className="w-4 h-4" />
                    Admin
                  </a>
                )}
              </>
            ) : (
              <a href="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Home
              </a>
            )}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {rankName && (
                  <span className="text-xs px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {rankName}
                  </span>
                )}
                <span className="text-sm text-gray-700">
                  Welcome, {user.email?.split('@')[0]}
                </span>
                <Button variant="outline" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <a href="/login">
                  <Button variant="ghost">Sign In</Button>
                </a>
                <a href="/register">
                  <Button>Sign Up</Button>
                </a>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        user={user ? { email: user.email, isAdmin } : undefined}
        onSignOut={signOut}
      />
    </header>
  );
}
