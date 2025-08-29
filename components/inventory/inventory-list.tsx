"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Item, Trap, Rug, Bait } from "@/types/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { equipItem } from "@/lib/equipment";
import { useToast } from "@/components/ui/use-toast";

type InventoryRow = {
  quantity: number;
  item: Item;
};

export default function InventoryList() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [invItems, setInvItems] = useState<InventoryRow[]>([]);
  const [traps, setTraps] = useState<Trap[]>([]);
  const [rugs, setRugs] = useState<Rug[]>([]);
  const [baits, setBaits] = useState<Bait[]>([]);
  const [equipping, setEquipping] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [invRes, trapsRes, rugsRes, baitsRes] = await Promise.all([
          supabase
            .from("inventory")
            .select("quantity, item:items(*)")
            .order("quantity", { ascending: false }),
          supabase.from("traps").select("*").order("power", { ascending: false }),
          supabase.from("rugs").select("*").order("attraction", { ascending: false }),
          supabase.from("baits").select("*").order("attraction", { ascending: false }),
        ]);

        if (!cancelled) {
          setInvItems((invRes.data as any) || []);
          setTraps((trapsRes.data as any) || []);
          setRugs((rugsRes.data as any) || []);
          setBaits((baitsRes.data as any) || []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const ownedTraps = useMemo(() => {
    const names = new Set(invItems.filter(r => r.item.type === "trap").map(r => r.item.name));
    return traps.filter(t => names.has(t.name));
  }, [invItems, traps]);

  const ownedRugs = useMemo(() => {
    const names = new Set(invItems.filter(r => r.item.type === "rug").map(r => r.item.name));
    return rugs.filter(r => names.has(r.name));
  }, [invItems, rugs]);

  const ownedBaits = useMemo(() => {
    const qtyByName = new Map<string, number>();
    invItems.filter(r => r.item.type === "bait").forEach(r => {
      qtyByName.set(r.item.name, (qtyByName.get(r.item.name) || 0) + r.quantity);
    });
    return baits
      .filter(b => qtyByName.has(b.name))
      .map(b => ({ bait: b, quantity: qtyByName.get(b.name) || 0 }))
      .sort((a, b) => (b.quantity - a.quantity));
  }, [invItems, baits]);

  const handleEquip = async (id: string, type: "trap" | "rug" | "bait") => {
    try {
      setEquipping(`${type}:${id}`);
      await equipItem(id, type);
      toast({ title: "Equipped", description: `Equipped ${type}.` });
    } catch (e) {
      toast({ title: "Equip failed", description: "Please try again", variant: "destructive" });
    } finally {
      setEquipping(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-600">Loading inventory...</div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Traps</h3>
        {ownedTraps.length === 0 ? (
          <p className="text-sm text-gray-500">No traps owned.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ownedTraps.map((t) => (
              <div key={t.id} className="p-4 rounded-lg border bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{t.name}</span>
                  <Badge className="text-xs">{t.rarity}</Badge>
                </div>
                <p className="text-xs text-gray-600 mb-2">Power: {t.power} · Attraction: {t.attraction}</p>
                <Button 
                  type="button"
                  size="sm"
                  onClick={() => handleEquip(t.id, "trap")}
                  disabled={equipping === `trap:${t.id}`}
                  aria-disabled={equipping === `trap:${t.id}`}
                >
                  {equipping === `trap:${t.id}` ? "Equipping..." : "Equip"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Rugs</h3>
        {ownedRugs.length === 0 ? (
          <p className="text-sm text-gray-500">No rugs owned.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ownedRugs.map((r) => (
              <div key={r.id} className="p-4 rounded-lg border bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{r.name}</span>
                  <Badge className="text-xs">{r.rarity}</Badge>
                </div>
                <p className="text-xs text-gray-600 mb-2">Attraction: {r.attraction}</p>
                <Button 
                  type="button"
                  size="sm"
                  onClick={() => handleEquip(r.id, "rug")}
                  disabled={equipping === `rug:${r.id}`}
                  aria-disabled={equipping === `rug:${r.id}`}
                >
                  {equipping === `rug:${r.id}` ? "Equipping..." : "Equip"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Baits</h3>
        {ownedBaits.length === 0 ? (
          <p className="text-sm text-gray-500">No baits owned.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ownedBaits.map(({ bait, quantity }) => (
              <div key={bait.id} className="p-4 rounded-lg border bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{bait.name}</span>
                  <Badge className="text-xs">{bait.rarity}</Badge>
                </div>
                <p className="text-xs text-gray-600 mb-2">Attraction: {bait.attraction}</p>
                <p className="text-sm text-gray-700 mb-2">Quantity: <span className="font-medium">{quantity}</span></p>
                <Button 
                  type="button"
                  size="sm"
                  onClick={() => handleEquip(bait.id, "bait")}
                  disabled={quantity <= 0 || equipping === `bait:${bait.id}`}
                  aria-disabled={quantity <= 0 || equipping === `bait:${bait.id}`}
                >
                  {equipping === `bait:${bait.id}` ? "Equipping..." : "Equip"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


