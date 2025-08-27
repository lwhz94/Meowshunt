"use client";

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Target, AlertCircle } from 'lucide-react';
import type { Trap, Rug, Bait } from '@/types/db';

interface HuntButtonProps {
  energy: number;
  trap: Trap | null;
  rug: Rug | null;
  bait: Bait | null;
}

export function HuntButton({ energy, trap, rug, bait }: HuntButtonProps) {
  const { toast } = useToast();
  
  const isFullyEquipped = !!(trap && rug && bait);
  const hasEnergy = energy > 0;
  const canHunt = isFullyEquipped && hasEnergy;

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
      const reason = getDisabledReason();
      toast({
        title: "Cannot Hunt",
        description: reason,
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement hunting logic
    toast({
      title: "Starting Hunt!",
      description: "Redirecting to hunting location...",
    });
    
    // For now, redirect to locations page
    setTimeout(() => {
      window.location.href = '/locations';
    }, 1000);
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
          size="lg"
          className={`px-8 py-4 text-lg font-semibold ${
            canHunt
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
              : 'bg-gray-400 cursor-not-allowed'
          } transition-all duration-200`}
        >
          {canHunt ? '🎯 Start Hunting!' : 'Cannot Hunt'}
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
            {hasEnergy ? '✅' : '❌'} Energy ({energy}/15)
          </div>
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
    </div>
  );
}
