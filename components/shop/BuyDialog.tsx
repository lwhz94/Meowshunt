"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { purchaseItemAction } from "@/lib/actions/shop";

export function BuyDialog({
  item,
  onPurchased,
}: {
  item: { id: string; name: string; price: number };
  onPurchased: (newGold: number | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();

  const total = item.price * (quantity || 0);

  const handlePurchase = () => {
    startTransition(async () => {
      try {
        const res = await purchaseItemAction(item.id, quantity);
        if (res.success) {
          toast({ title: "Purchased!", description: `Bought ${quantity} × ${item.name} for ${total} gold.` });
          onPurchased(res.newGold ?? null);
          setOpen(false);
        } else {
          toast({ title: "Purchase failed", description: res.error || "Unknown error", variant: "destructive" });
        }
      } catch {
        // Handle unexpected errors
        toast({ title: "Purchase failed", description: "An unexpected error occurred.", variant: "destructive" });
      }
    });
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>Buy</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-gray-700">{item.name}</div>
            <div className="flex items-center gap-2">
              <label htmlFor="qty" className="text-sm text-gray-600">Quantity</label>
              <input
                id="qty"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="w-20 border rounded px-2 py-1"
              />
            </div>
            <div className="text-sm text-gray-600">Price per item: {item.price}g</div>
            <div className="text-base font-medium">Total: {total}g</div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handlePurchase} disabled={isPending}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


