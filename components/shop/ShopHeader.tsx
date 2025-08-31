"use client";

import { Badge } from "@/components/ui/badge";

export function ShopHeader({ gold, hasLocation }: { gold: number; hasLocation: boolean }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-gray-700">Gold:</span>
        <Badge className="text-base">{gold}</Badge>
      </div>
      {!hasLocation && (
        <span className="text-sm text-gray-500">Select a location first on the Locations page.</span>
      )}
    </div>
  );
}


