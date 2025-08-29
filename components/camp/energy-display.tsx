"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { applyEnergyRefillAction } from '@/lib/actions/energy';
import { 
  calculateRefillableEnergy, 
  getNextRefillTime, 
  formatTimeUntilRefill,
  getEnergyProgress 
} from '@/lib/utils/energy';
import { useToast } from '@/components/ui/use-toast';
import { RefreshCw, Zap } from 'lucide-react';

interface EnergyDisplayProps {
  currentEnergy: number;
  lastRefill: string;
  maxEnergy?: number;
}

export function EnergyDisplay({ currentEnergy, lastRefill, maxEnergy = 15 }: EnergyDisplayProps) {
  const [energy, setEnergy] = useState(currentEnergy);
  const [lastRefillTime, setLastRefillTime] = useState(new Date(lastRefill));
  const [nextRefillTime, setNextRefillTime] = useState<Date>();
  const [isRefilling, setIsRefilling] = useState(false);
  const [timeUntilRefill, setTimeUntilRefill] = useState('');
  const { toast } = useToast();

  // Calculate initial values with persistence so refresh doesn't reset timer
  useEffect(() => {
    // Try to restore persisted nextRefill target
    let restored: Date | undefined;
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem('energy_next_refill') : null;
      if (stored) {
        const ts = Number(stored);
        if (!Number.isNaN(ts)) {
          const d = new Date(ts);
          if (d.getTime() > Date.now()) {
            restored = d;
          }
        }
      }
    } catch {}

    const nextRefill = restored ?? getNextRefillTime(lastRefillTime, energy, maxEnergy);
    setNextRefillTime(nextRefill);
    setTimeUntilRefill(formatTimeUntilRefill(nextRefill));

    // Persist the target so reload keeps countdown
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('energy_next_refill', String(nextRefill.getTime()));
      }
    } catch {}
  }, [lastRefillTime, energy, maxEnergy]);

  // Update countdown timer (every second for mm:ss accuracy)
  useEffect(() => {
    const interval = setInterval(() => {
      if (nextRefillTime) {
        setTimeUntilRefill(formatTimeUntilRefill(nextRefillTime));
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [nextRefillTime]);

  const canRefill = calculateRefillableEnergy(lastRefillTime, energy, maxEnergy) > 0;
  const progress = getEnergyProgress(energy, maxEnergy);

  const handleRefill = async () => {
    if (!canRefill || isRefilling) return;

    setIsRefilling(true);
    
    try {
      const result = await applyEnergyRefillAction();
      
      if (result.success && typeof result.newEnergy === 'number') {
        setEnergy(result.newEnergy);
        setLastRefillTime(new Date());
        const nextRefill = getNextRefillTime(new Date(), result.newEnergy, maxEnergy);
        setNextRefillTime(nextRefill);
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('energy_next_refill', String(nextRefill.getTime()));
          }
        } catch {}
        
        toast({
          title: "Energy Refilled!",
          description: `Your energy is now ${result.newEnergy}/${maxEnergy}`,
        });
      } else {
        toast({
          title: "Refill Failed",
          description: result.error || "Unable to refill energy",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Refill Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRefilling(false);
    }
  };

  // Auto-apply refill when available while on the camp page
  useEffect(() => {
    const interval = setInterval(() => {
      const autoRefillAvailable = calculateRefillableEnergy(lastRefillTime, energy, maxEnergy) > 0;
      if (autoRefillAvailable && !isRefilling) {
        void handleRefill();
      }
    }, 1000); // Check every second to trigger right at 00:00

    // Also check immediately on mount/update
    const autoRefillAvailableNow = calculateRefillableEnergy(lastRefillTime, energy, maxEnergy) > 0;
    if (autoRefillAvailableNow && !isRefilling) {
      void handleRefill();
    }

    return () => clearInterval(interval);
  }, [lastRefillTime, energy, maxEnergy, isRefilling]);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Energy
        </h3>
        <Button
          onClick={handleRefill}
          disabled={!canRefill || isRefilling}
          aria-disabled={!canRefill || isRefilling}
          aria-label={canRefill ? 'Refill energy' : 'Refill unavailable'}
          title={canRefill ? 'Refill energy' : 'Refill unavailable'}
          type="button"
          size="sm"
          variant="outline"
          className="text-blue-700 border-blue-300 hover:bg-blue-200"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${isRefilling ? 'animate-spin' : ''}`} />
          {isRefilling ? 'Refilling...' : 'Refill'}
        </Button>
      </div>

      {/* Energy Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-blue-700 mb-1">
          <span>{energy}/{maxEnergy}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Refill Info */}
      <div className="text-sm text-blue-700" aria-live="polite" aria-atomic="true">
        {canRefill ? (
          <p>You can refill {calculateRefillableEnergy(lastRefillTime, energy, maxEnergy)} energy now!</p>
        ) : (
          <p>Next refill in: <span className="font-medium">{timeUntilRefill}</span></p>
        )}
      </div>

      {/* Refill Schedule */}
      <div className="mt-3 text-xs text-blue-600">
        <p>Energy refills every 15 minutes (1 per refill)</p>
      </div>
    </div>
  );
}
