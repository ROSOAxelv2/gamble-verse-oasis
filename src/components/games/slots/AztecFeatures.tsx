
import React from "react";

interface AztecFeaturesProps {
  wildCollection: number;
  maxWildCollection: number;
  multiplier: number;
  isBonus: boolean;
  freeSpins: number;
}

export const AztecFeatures: React.FC<AztecFeaturesProps> = ({
  wildCollection,
  maxWildCollection,
  multiplier,
  isBonus,
  freeSpins,
}) => {
  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className="bg-amber-800 p-2 rounded-md">
        <div className="text-xs text-amber-200 uppercase font-bold mb-1">Wild Collection</div>
        <div className="w-full bg-amber-950 rounded-full h-2.5">
          <div 
            className="bg-yellow-400 h-2.5 rounded-full" 
            style={{ width: `${(wildCollection / maxWildCollection) * 100}%` }}
          ></div>
        </div>
        <div className="text-xs mt-1 text-center">{wildCollection}/{maxWildCollection}</div>
      </div>
      
      <div className="bg-amber-800 p-2 rounded-md">
        <div className="text-xs text-amber-200 uppercase font-bold mb-1">Multiplier</div>
        <div className="text-center text-lg font-bold text-yellow-400">{multiplier}x</div>
      </div>
      
      {isBonus && (
        <div className="col-span-2 bg-yellow-600 p-2 rounded-md">
          <div className="text-xs text-white uppercase font-bold mb-1">Free Spins</div>
          <div className="text-center text-lg font-bold text-white">{freeSpins} remaining</div>
        </div>
      )}
    </div>
  );
};
