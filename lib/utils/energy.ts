/**
 * Calculate how much energy can be refilled based on time since last refill
 */
export function calculateRefillableEnergy(lastRefill: Date, currentEnergy: number, maxEnergy: number = 15): number {
  const now = new Date();
  const minutesSinceRefill = (now.getTime() - lastRefill.getTime()) / (1000 * 60);
  const energyPer15Minutes = 1;
  const refillableEnergy = Math.floor(minutesSinceRefill / 15) * energyPer15Minutes;
  
  return Math.min(refillableEnergy, maxEnergy - currentEnergy);
}

/**
 * Calculate when the next energy refill will occur
 */
export function getNextRefillTime(lastRefill: Date, currentEnergy: number, maxEnergy: number = 15): Date {
  if (currentEnergy >= maxEnergy) {
    return lastRefill; // Already at max energy
  }

  const now = new Date();
  const minutesSinceRefill = (now.getTime() - lastRefill.getTime()) / (1000 * 60);
  const minutesUntilNextRefill = 15 - (minutesSinceRefill % 15);
  
  return new Date(now.getTime() + minutesUntilNextRefill * 60 * 1000);
}

/**
 * Format the time until next refill in a human-readable format
 */
export function formatTimeUntilRefill(nextRefill: Date): string {
  const now = new Date();
  const diffMs = nextRefill.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return 'Now';
  }
  
  const diffMinutes = Math.ceil(diffMs / (1000 * 60));
  
  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }
  
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes}m`;
}

/**
 * Check if energy refill is available
 */
export function canRefillEnergy(lastRefill: Date, currentEnergy: number, maxEnergy: number = 15): boolean {
  return calculateRefillableEnergy(lastRefill, currentEnergy, maxEnergy) > 0;
}

/**
 * Get energy progress percentage (0-100)
 */
export function getEnergyProgress(currentEnergy: number, maxEnergy: number = 15): number {
  return Math.round((currentEnergy / maxEnergy) * 100);
}
