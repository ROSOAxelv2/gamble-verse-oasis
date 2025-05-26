
import React from "react";
import { PragmaticGameState } from "../../../types/slots";

interface PGSoftFeaturesProps {
  gameState: PragmaticGameState;
  wildMeterThreshold: number;
}

export const PGSoftFeatures = ({ gameState, wildMeterThreshold }: PGSoftFeaturesProps) => {
  const meterProgress = (gameState.wildMeter / wildMeterThreshold) * 100;
  const isMeterFull = gameState.wildMeter >= wildMeterThreshold;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Wild Meter */}
      <div className="bg-gradient-to-r from-amber-800 to-amber-900 p-4 rounded-lg border-2 border-yellow-600 shadow-lg">
        <div className="text-center mb-2">
          <h3 className="text-amber-200 font-bold text-sm uppercase tracking-wider">Wild Meter</h3>
          <div className="text-yellow-400 text-xl font-bold">
            {gameState.wildMeter}/{wildMeterThreshold}
          </div>
        </div>
        
        <div className="relative w-full bg-amber-950 rounded-full h-4 overflow-hidden border border-amber-700">
          <div 
            className={`
              h-full rounded-full transition-all duration-800 ease-out
              ${isMeterFull 
                ? 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 animate-pulse shadow-lg shadow-yellow-400/50' 
                : 'bg-gradient-to-r from-yellow-600 to-yellow-700'
              }
            `}
            style={{ width: `${Math.min(meterProgress, 100)}%` }}
          />
          
          {isMeterFull && (
            <div className="absolute inset-0 bg-yellow-400/30 animate-ping rounded-full" />
          )}
        </div>
        
        {isMeterFull && (
          <div className="text-center text-yellow-300 text-xs font-bold mt-2 animate-bounce">
            METER FULL! MULTIPLIER READY!
          </div>
        )}
      </div>

      {/* Current Multiplier */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-900 p-4 rounded-lg border-2 border-purple-600 shadow-lg">
        <div className="text-center">
          <h3 className="text-purple-200 font-bold text-sm uppercase tracking-wider mb-2">Multiplier</h3>
          <div className={`
            text-4xl font-bold
            ${gameState.currentMultiplier > 1 
              ? 'text-yellow-400 animate-pulse drop-shadow-lg' 
              : 'text-purple-300'
            }
          `}>
            {gameState.currentMultiplier}x
          </div>
        </div>
        
        {gameState.currentMultiplier > 1 && (
          <div className="text-center text-yellow-300 text-xs font-bold mt-2">
            MULTIPLIER ACTIVE!
          </div>
        )}
      </div>

      {/* Free Spins */}
      <div className="bg-gradient-to-r from-green-800 to-green-900 p-4 rounded-lg border-2 border-green-600 shadow-lg">
        <div className="text-center">
          <h3 className="text-green-200 font-bold text-sm uppercase tracking-wider mb-2">Free Spins</h3>
          
          {gameState.isFreeSpin ? (
            <>
              <div className="text-4xl font-bold text-yellow-400 animate-bounce drop-shadow-lg">
                {gameState.freeSpinsRemaining}
              </div>
              <div className="text-green-300 text-xs font-bold mt-2">
                SPINS REMAINING
              </div>
              
              {gameState.giantSymbols.length > 0 && (
                <div className="text-yellow-300 text-xs font-bold mt-1 animate-pulse">
                  🗿 GIANT SYMBOLS ACTIVE
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-green-300">
                READY
              </div>
              <div className="text-green-400 text-xs mt-2">
                4+ scatters to trigger
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cascade Counter (if cascading) */}
      {gameState.cascadeCount > 0 && (
        <div className="col-span-full bg-gradient-to-r from-orange-600 to-red-600 p-3 rounded-lg border-2 border-orange-400 shadow-lg">
          <div className="text-center">
            <h3 className="text-white font-bold text-lg uppercase tracking-wider">
              CASCADE WINS #{gameState.cascadeCount}
            </h3>
            <div className="text-yellow-300 text-sm font-bold mt-1 animate-pulse">
              Symbols falling... More wins possible!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
