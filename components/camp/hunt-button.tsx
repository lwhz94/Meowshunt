"use client";

import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Target, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { Trap, Rug, Bait } from '@/types/db';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/context';
import { errorHandler } from '@/lib/utils/error-handler';
import { 
  showEquipmentErrorToast, 
  showResourceErrorToast, 
  showErrorToast,
  showSuccessToast 
} from '@/lib/utils/toast';

interface HuntButtonProps {
  energy: number;
  trap: Trap | null;
  rug: Rug | null;
  bait: Bait | null;
}

export function HuntButton({ energy, trap, rug, bait }: HuntButtonProps) {
  const { user } = useAuth();

  const [energyState, setEnergyState] = useState(energy);
  const [baitQty, setBaitQty] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const isFullyEquipped = !!(trap && rug && bait);
  const hasEnergy = energyState > 0;
  const canHunt = isFullyEquipped && hasEnergy && !isPending;

  // Resolve item id for current bait and load quantity
  useEffect(() => {
    const loadBaitQty = async () => {
      if (!user || !bait) { setBaitQty(null); return; }
      // Find items row that corresponds to this bait by name/type
      const { data: itemsRow, error: itemErr } = await supabase
        .from('items')
        .select('id')
        .eq('type', 'bait')
        .eq('name', bait.name)
        .maybeSingle();
      if (itemErr || !itemsRow) { setBaitQty(null); return; }
      const { data: inv, error: invErr } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('user_id', user.id)
        .eq('item_id', itemsRow.id)
        .maybeSingle();
      if (invErr) { setBaitQty(null); return; }
      setBaitQty(inv?.quantity ?? 0);
    };
    loadBaitQty();
  }, [user, bait]);

  // Result modal state
  const [resultOpen, setResultOpen] = useState(false);
  const [result, setResult] = useState<null | {
    outcome: 'catch' | 'miss';
    rewards: { gold: number; exp: number };
    displayMeow: { id: string; name: string; image_url: string | null; rarity: string };
  }>(null);

  const getDisabledReason = () => {
    if (!isFullyEquipped) {
      return "You need to equip a trap, rug, and bait to hunt";
    }
    if (!hasEnergy) {
      return "You need energy to hunt";
    }
    return null;
  };

  const handleHunt = () => {
    if (!canHunt) {
      // Use centralized error handling for specific scenarios
      if (!isFullyEquipped) {
        // Determine which equipment is missing and show appropriate error
        if (!trap) {
          showEquipmentErrorToast('trap');
        } else if (!rug) {
          showEquipmentErrorToast('rug');
        } else if (!bait) {
          showEquipmentErrorToast('bait');
        }
        return;
      }
      
      if (!hasEnergy) {
        showResourceErrorToast('energy');
        return;
      }
      
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/hunt', { method: 'POST' });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Hunt failed (${res.status})`);
        }
        const data = await res.json();
        setResult(data);
        setResultOpen(true);
        
        // Show success toast for catch
        if (data.outcome === 'catch') {
          showSuccessToast(
            'Hunt Successful! 🎉',
            `You caught ${data.displayMeow.name}! +${data.rewards.gold} gold, +${data.rewards.exp} XP`
          );
        }
        
        // Update local state: consume 1 energy and 1 bait if known
        setEnergyState((e) => Math.max(0, e - 1));
        setBaitQty((q) => (typeof q === 'number' ? Math.max(0, q - 1) : q));
      } catch (e) {
        // Use centralized error handling
        const appError = errorHandler.handleError(e, {
          action: 'hunt',
          user_id: user?.id,
          equipment: { trap: !!trap, rug: !!rug, bait: !!bait },
          energy: energyState
        });
        
        showErrorToast(
          'Hunt Failed',
          appError.userMessage
        );
      }
    });
  };

  return (
    <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-6 rounded-lg border border-orange-200">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Target className="w-8 h-8 text-orange-600" />
          <h3 className="text-2xl font-bold text-gray-900">Ready to Hunt?</h3>
        </div>
        
        <p className="text-gray-600 max-w-md mx-auto">
          Make sure you have all equipment equipped and energy available before starting your hunt!
        </p>

        <Button
          onClick={handleHunt}
          disabled={!canHunt}
          aria-disabled={!canHunt}
          aria-label={canHunt ? 'Start hunting' : getDisabledReason() ?? 'Cannot hunt'}
          title={canHunt ? 'Start hunting' : getDisabledReason() ?? 'Cannot hunt'}
          type="button"
          size="lg"
          className={`px-8 py-4 text-lg font-semibold ${
            canHunt
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
              : 'bg-gray-400 cursor-not-allowed'
          } transition-all duration-200`}
        >
          {isPending ? 'Hunting…' : (canHunt ? '🎯 Start Hunting!' : 'Cannot Hunt')}
        </Button>

        {/* Status Indicators */}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className={`flex items-center gap-2 ${
            isFullyEquipped ? 'text-green-600' : 'text-red-600'
          }`}>
            {isFullyEquipped ? '✅' : '❌'} Equipment
          </div>
          <div className={`flex items-center gap-2 ${
            hasEnergy ? 'text-green-600' : 'text-red-600'
          }`}>
            {hasEnergy ? '✅' : '❌'} Energy ({energyState}/15)
          </div>
          {bait && (
            <div className="flex items-center gap-2 text-gray-600">
              🪙 Bait qty: {baitQty ?? '—'}
            </div>
          )}
        </div>

        {/* Warning Message */}
        {!canHunt && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {getDisabledReason()}
              </span>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!canHunt && (
          <div className="flex flex-wrap justify-center gap-3">
            {!isFullyEquipped && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/inventory'}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                Manage Equipment
              </Button>
            )}
            {!hasEnergy && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/camp'}
                className="text-green-600 border-green-300 hover:bg-green-50"
              >
                Check Energy
              </Button>
            )}
          </div>
        )}
      </div>
      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{result?.outcome === 'catch' ? 'You caught a Meow! 🎉' : 'It got away…'}</DialogTitle>
          </DialogHeader>
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {result.displayMeow.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={result.displayMeow.image_url} alt={result.displayMeow.name} className="w-12 h-12 rounded object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">🐱</div>
                )}
                <div>
                  <div className="font-semibold">{result.displayMeow.name}</div>
                  <div className="text-sm text-gray-600">Rarity: {result.displayMeow.rarity}</div>
                </div>
              </div>
              {result.outcome === 'catch' ? (
                <div className="text-sm text-green-700">Rewards: +{result.rewards.gold} gold, +{result.rewards.exp} XP</div>
              ) : (
                <div className="text-sm text-gray-600">No rewards this time. Try again!</div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResultOpen(false)}>Close</Button>
            <Button onClick={handleHunt} disabled={!canHunt}>Hunt Again</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
