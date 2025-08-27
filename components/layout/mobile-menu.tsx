"use client";

import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSignOut: () => void;
}

export function MobileMenu({ isOpen, onClose, user, onSignOut }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Menu</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="p-4 space-y-4">
          {user ? (
            <>
              <a
                href="/camp"
                className="block text-gray-700 hover:text-gray-900 px-3 py-2 text-base font-medium"
                onClick={onClose}
              >
                Camp
              </a>
              <a
                href="/shop"
                className="block text-gray-700 hover:text-gray-900 px-3 py-2 text-base font-medium"
                onClick={onClose}
              >
                Shop
              </a>
              <a
                href="/inventory"
                className="block text-gray-700 hover:text-gray-900 px-3 py-2 text-base font-medium"
                onClick={onClose}
              >
                Inventory
              </a>
              <a
                href="/locations"
                className="block text-gray-700 hover:text-gray-900 px-3 py-2 text-base font-medium"
                onClick={onClose}
              >
                Locations
              </a>
              <a
                href="/collections"
                className="block text-gray-700 hover:text-gray-900 px-3 py-2 text-base font-medium"
                onClick={onClose}
              >
                Collections
              </a>
            </>
          ) : (
            <a
              href="/"
              className="block text-gray-700 hover:text-gray-900 px-3 py-2 text-base font-medium"
              onClick={onClose}
            >
              Home
            </a>
          )}
        </nav>

        <div className="p-4 border-t">
          {user ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-700">
                Welcome, {user.email?.split('@')[0]}
              </div>
              <Button variant="outline" onClick={onSignOut} className="w-full">
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <a href="/login" className="block">
                <Button variant="ghost" className="w-full">
                  Sign In
                </Button>
              </a>
              <a href="/register" className="block">
                <Button className="w-full">
                  Sign Up
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
