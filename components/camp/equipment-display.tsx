"use client";

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Square, Bone } from 'lucide-react';
import type { Trap, Rug, Bait } from '@/types/db';

interface EquipmentDisplayProps {
  trap: Trap | null;
  rug: Rug | null;
  bait: Bait | null;
}

export function EquipmentDisplay({ trap, rug, bait }: EquipmentDisplayProps) {
  const isFullyEquipped = !!(trap && rug && bait);

  const getEquipmentIcon = (type: 'trap' | 'rug' | 'bait') => {
    switch (type) {
      case 'trap':
        return <Target className="w-5 h-5" />;
      case 'rug':
        return <Square className="w-5 h-5" />;
      case 'bait':
        return <Bone className="w-5 h-5" />;
    }
  };

  const getEquipmentColor = (type: 'trap' | 'rug' | 'bait') => {
    switch (type) {
      case 'trap':
        return 'bg-red-100 border-red-200 text-red-800';
      case 'rug':
        return 'bg-orange-100 border-orange-200 text-orange-800';
      case 'bait':
        return 'bg-green-100 border-green-200 text-green-800';
    }
  };

  const renderEquipmentSlot = (
    type: 'trap' | 'rug' | 'bait',
    item: Trap | Rug | Bait | null,
    label: string
  ) => {
    const isEquipped = !!item;
    
    return (
      <div className={`p-4 rounded-lg border-2 ${
        isEquipped 
          ? 'bg-white border-green-300 shadow-sm' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto rounded-lg mb-3 flex items-center justify-center ${
            isEquipped ? 'bg-green-100' : 'bg-gray-200'
          }`}>
            {isEquipped ? (
              <span className="text-2xl">✅</span>
            ) : (
              getEquipmentIcon(type)
            )}
          </div>
          
          <h4 className="font-semibold text-gray-900 mb-1">{label}</h4>
          
          {isEquipped ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              <div className="flex justify-center gap-2">
                {type === 'trap' && (
                  <Badge variant="secondary" className="text-xs">
                    Power: {(item as Trap).power}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  Attraction: {item.attraction}
                </Badge>
                <Badge className={`text-xs ${getEquipmentColor(type)}`}>
                  {item.rarity}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">No {label.toLowerCase()} equipped</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/inventory'}
              >
                Equip {label}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Equipment</h3>
        <Badge 
          variant={isFullyEquipped ? "default" : "secondary"}
          className={isFullyEquipped ? "bg-green-100 text-green-800" : ""}
        >
          {isFullyEquipped ? "Ready to Hunt!" : "Incomplete"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {renderEquipmentSlot('trap', trap, 'Trap')}
        {renderEquipmentSlot('rug', rug, 'Rug')}
        {renderEquipmentSlot('bait', bait, 'Bait')}
      </div>

      {!isFullyEquipped && (
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            ⚠️ You need to equip a trap, rug, and bait before you can hunt!
          </p>
        </div>
      )}
    </div>
  );
}
