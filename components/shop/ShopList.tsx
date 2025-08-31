"use client";

import { useState } from "react";
import { BuyDialog } from "@/components/shop/BuyDialog";

export function ShopList({ initialGold, items }: { initialGold: number; items: Array<{ id: string; name: string; description: string | null; price: number; rarity: string; image_url: string | null; attraction?: number }> }) {
  const [gold, setGold] = useState(initialGold);

  return (
    <>
      {items.map((it) => (
        <div key={it.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{it.name}</h3>
              <p className="text-gray-600 mt-1">{it.description || 'No description'}</p>
              <div className="mt-2 flex gap-2 text-sm text-gray-500">
                <span>Rarity: {it.rarity}</span>
                <span>Attraction: {it.attraction ?? '—'}</span>
              </div>
              <div className="mt-2 text-sm text-gray-600">Price: {it.price}g</div>
              <div className="mt-2 text-sm text-gray-600">Your gold: {gold}g</div>
            </div>
            <BuyDialog
              item={{ id: it.id, name: it.name, price: it.price }}
              onPurchased={(newGold) => {
                if (typeof newGold === 'number') setGold(newGold);
              }}
            />
          </div>
        </div>
      ))}
    </>
  );
}


