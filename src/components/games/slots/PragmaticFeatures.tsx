
import React from "react";
import { Progress } from "@/components/ui/progress";
import { PragmaticGameState } from "../../../types/slots";

interface PragmaticFeaturesProps {
  gameState: PragmaticGameState;
  config: {
    wildMeterThreshold: number;
  };
}

export const PragmaticFeatures: React.FC<PragmaticFeaturesProps> = ({ gameState, config }) => {
  const { wildMeter, currentMultiplier, freeSpinsRemaining, isFreeSpin, totalWin } = gameState;
  
  const meterPercentage = (wildMeter / config.wildMeterThreshold) * 100;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Wild Meter */}
      <div className="bg-amber-900/60 rounded-lg p-3 border border-yellow-600">
        <h3 className="text-amber-200 font-semibold text-sm mb-1">Wild Meter</h3>
        <div className="flex items-center gap-2 mb-2">
          <Progress 
            value={meterPercentage} 
            className="h-3 bg-amber-950" 
          />
          <span className="text-amber-100 text-xs font-bold">
            {wildMeter}/{config.wildMeterThreshold}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-amber-200 text-xs">Next:</span>
          <span className="text-amber-100 font-bold">
            {currentMultiplier > 1 
              ? `Current: ${currentMultiplier}x` 
              : "Random Multiplier"}
          </span>
        </div>
      </div>
      
      {/* Free Spins */}
      <div className={`rounded-lg p-3 border ${
        isFreeSpin 
          ? "bg-gradient-to-r from-amber-700 to-amber-900 border-yellow-400 animate-pulse" 
          : "bg-amber-900/60 border-yellow-600"
      }`}>
        <h3 className="text-amber-200 font-semibold text-sm">Free Spins</h3>
        <div className="flex justify-between items-center mt-2">
          <span className="text-amber-200 text-xs">Remaining:</span>
          <span className={`font-bold ${
            freeSpinsRemaining > 0 ? "text-yellow-300" : "text-amber-100"
          }`}>
            {freeSpinsRemaining > 0 ? freeSpinsRemaining : "0"}
          </span>
        </div>
        {isFreeSpin && (
          <div className="text-center mt-2">
            <span className="text-yellow-300 text-xs font-bold">FREE SPINS ACTIVE!</span>
          </div>
        )}
      </div>
      
      {/* Win Display */}
      <div className="bg-amber-900/60 rounded-lg p-3 border border-yellow-600">
        <h3 className="text-amber-200 font-semibold text-sm">Total Win</h3>
        <div className="text-center mt-2">
          <span className="text-yellow-300 text-xl font-bold">
            {totalWin}
          </span>
        </div>
      </div>
    </div>
  );
};
