
import React from 'react';
import { JiliGameState, JiliMoneyComingEngine } from '@/utils/jiliMoneyComingEngine';

interface JiliMoneyComingGridProps {
  gameState: JiliGameState;
  spinning: boolean;
  engine: JiliMoneyComingEngine;
}

export const JiliMoneyComingGrid = ({ gameState, spinning, engine }: JiliMoneyComingGridProps) => {
  const { mainGrid, multiplierReel, lastSpinResult } = gameState;

  const getSymbolDisplay = (symbolId: string) => {
    return engine.getSymbolDisplay(symbolId);
  };

  const isCenterLineWinning = (reelIndex: number, rowIndex: number): boolean => {
    return rowIndex === 1 && lastSpinResult?.isWin === true;
  };

  return (
    <div className="relative">
      {/* Main Game Grid */}
      <div className="flex items-center justify-center space-x-6">
        {/* Main 3x3 Reels */}
        <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-b from-yellow-900/50 to-yellow-800/50 rounded-lg border-2 border-yellow-500/30 shadow-inner">
          {mainGrid.map((reel, reelIndex) => (
            <div key={reelIndex} className="space-y-2">
              {reel.map((symbol, rowIndex) => {
                const isWinning = isCenterLineWinning(reelIndex, rowIndex);
                const isCenterRow = rowIndex === 1;
                const symbolDisplay = getSymbolDisplay(symbol);
                
                return (
                  <div
                    key={`${reelIndex}-${rowIndex}`}
                    className={`
                      aspect-square flex items-center justify-center text-5xl
                      rounded-lg border-2 transition-all duration-300
                      ${spinning ? 'animate-spin' : ''}
                      ${isWinning ? 'bg-yellow-400/30 border-yellow-400 shadow-lg shadow-yellow-400/50 animate-pulse scale-110' : 
                        isCenterRow ? 'bg-yellow-800/40 border-yellow-500/70 shadow-md' :
                        'bg-yellow-900/30 border-yellow-600/50'}
                      ${!spinning && isWinning ? 'animate-bounce' : ''}
                      backdrop-blur-sm
                    `}
                  >
                    <span className={`
                      drop-shadow-lg font-bold
                      ${isWinning ? 'animate-pulse text-yellow-100' : 'text-yellow-200'}
                      ${spinning ? 'blur-sm' : ''}
                    `}>
                      {symbolDisplay}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Multiplier Reel (4th Reel) */}
        <div className="flex flex-col items-center">
          <div className="text-sm text-yellow-400 mb-2 font-bold">MULTIPLIER</div>
          <div className={`
            w-20 h-20 flex items-center justify-center text-3xl
            rounded-lg border-3 transition-all duration-300
            ${spinning ? 'animate-spin' : ''}
            ${multiplierReel === 'respin' ? 'bg-blue-400/30 border-blue-400 shadow-lg shadow-blue-400/50' :
              multiplierReel === 'bonus_wheel' ? 'bg-purple-400/30 border-purple-400 shadow-lg shadow-purple-400/50' :
              'bg-green-400/30 border-green-400 shadow-lg shadow-green-400/50'}
            backdrop-blur-sm
          `}>
            <span className={`
              drop-shadow-lg font-bold text-white
              ${spinning ? 'blur-sm' : ''}
              ${multiplierReel === 'respin' || multiplierReel === 'bonus_wheel' ? 'animate-pulse' : ''}
            `}>
              {getSymbolDisplay(multiplierReel)}
            </span>
          </div>
          <div className="text-xs text-yellow-300 mt-1 text-center">
            {multiplierReel === 'respin' ? 'RESPIN!' :
             multiplierReel === 'bonus_wheel' ? 'BONUS!' :
             multiplierReel}
          </div>
        </div>
      </div>

      {/* Center Line Indicator */}
      <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <div className={`
          h-1 w-full mx-auto bg-gradient-to-r from-transparent via-yellow-400 to-transparent
          ${lastSpinResult?.isWin ? 'opacity-100 animate-pulse' : 'opacity-30'}
          transition-opacity duration-500
        `} />
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xs text-yellow-400 font-bold">
          PAYLINE
        </div>
      </div>

      {/* Spinning Overlay */}
      {spinning && (
        <div className="absolute inset-0 bg-yellow-900/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="text-6xl animate-spin">💰</div>
        </div>
      )}

      {/* Win Animation */}
      {!spinning && lastSpinResult?.isWin && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-yellow-300/20 to-yellow-400/10 rounded-lg animate-pulse" />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-yellow-300 font-bold text-lg animate-bounce">
            WIN! 💰
          </div>
        </div>
      )}
    </div>
  );
};
