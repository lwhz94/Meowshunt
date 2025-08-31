"use client";

import { Zap, Clock, Battery } from 'lucide-react';
import { 
  getNextRefillTime, 
  formatTimeUntilRefill,
  getEnergyProgress 
} from '@/lib/utils/energy';

interface EnergyDisplayProps {
  currentEnergy: number;
  lastRefill: string;
  maxEnergy?: number;
}

export function EnergyDisplay({ currentEnergy, lastRefill, maxEnergy = 15 }: EnergyDisplayProps) {
  // Simple display logic - all regeneration happens server-side
  const lastRefillDate = new Date(lastRefill);
  const nextRefillTime = getNextRefillTime(lastRefillDate, currentEnergy, maxEnergy);
  const progress = getEnergyProgress(currentEnergy, maxEnergy);
  const isAtMax = currentEnergy >= maxEnergy;
  const energyNeeded = maxEnergy - currentEnergy;

  // Calculate time to full energy
  const timeToFull = (() => {
    if (isAtMax) return '';
    
    const minutesToFull = energyNeeded * 15;
    
    if (minutesToFull < 60) {
      return `${minutesToFull}m`;
    } else {
      const hours = Math.floor(minutesToFull / 60);
      const minutes = minutesToFull % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  })();

  // Format countdown timer
  const countdownTimer = (() => {
    if (isAtMax) return '00:00';
    return formatTimeUntilRefill(nextRefillTime);
  })();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Energy
        </h3>
        <div className="text-sm text-blue-700 font-medium">
          {currentEnergy}/{maxEnergy}
        </div>
      </div>

      {/* Energy Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-blue-700 mb-2">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
          <div 
            className="h-3 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-500 to-blue-600"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={currentEnergy}
            aria-valuemin={0}
            aria-valuemax={maxEnergy}
            aria-label={`Energy level: ${currentEnergy} out of ${maxEnergy}`}
          />
        </div>
      </div>

      {/* Energy Information */}
      <div className="space-y-3">
        {/* Next Energy Point Countdown */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-blue-800">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Next energy point:</span>
          </div>
          <div className="font-mono font-bold text-lg text-blue-900 bg-white px-3 py-1 rounded border">
            {countdownTimer}
          </div>
        </div>
        
        {/* Time to Full Energy */}
        {timeToFull && (
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <Battery className="w-4 h-4" />
              <span className="text-sm font-medium">Time to full energy:</span>
            </div>
            <div className="font-semibold text-green-900 bg-white px-3 py-1 rounded border">
              {timeToFull}
            </div>
          </div>
        )}

        {/* Energy Regeneration Info */}
        <div className="text-center pt-2 text-xs text-blue-600 bg-white/50 rounded-lg p-2">
          <span className="font-medium">✨ Energy regenerates automatically every 15 minutes!</span>
          <div className="mt-1 text-green-600 font-medium">
            Server-side regeneration - works even when offline! 🎯
          </div>
        </div>
      </div>
    </div>
  );
}
