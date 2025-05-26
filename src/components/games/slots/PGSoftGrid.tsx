
import React from "react";
import { PragmaticGameState, GiantSymbolPosition } from "../../../types/slots";

interface PGSoftGridProps {
  gameState: PragmaticGameState;
  spinning: boolean;
  winningPositions?: [number, number][];
  cascading?: boolean;
}

export const PGSoftGrid = ({ 
  gameState, 
  spinning, 
  winningPositions = [], 
  cascading = false 
}: PGSoftGridProps) => {
  
  const isWinningPosition = (reel: number, row: number): boolean => {
    return winningPositions.some(([r, c]) => r === reel && c === row);
  };

  const isPartOfGiantSymbol = (reel: number, row: number): GiantSymbolPosition | null => {
    return gameState.giantSymbols.find(giant => 
      reel >= giant.startCol && reel < giant.startCol + giant.width &&
      row >= giant.startRow && row < giant.startRow + giant.height
    ) || null;
  };

  const isGiantSymbolOrigin = (reel: number, row: number): boolean => {
    return gameState.giantSymbols.some(giant => 
      giant.startCol === reel && giant.startRow === row
    );
  };

  return (
    <div className="relative">
      {/* Main Grid Container */}
      <div className="grid grid-cols-6 gap-1 p-4 bg-gradient-to-b from-amber-900/70 to-amber-950/70 rounded-lg border-4 border-yellow-600 shadow-2xl">
        {/* Grid Cells */}
        {Array.from({ length: 6 }, (_, reelIndex) => 
          Array.from({ length: 5 }, (_, rowIndex) => {
            const symbol = gameState.grid[reelIndex]?.[rowIndex] || "⬛";
            const isWinning = isWinningPosition(reelIndex, rowIndex);
            const giantSymbol = isPartOfGiantSymbol(reelIndex, rowIndex);
            const isGiantOrigin = isGiantSymbolOrigin(reelIndex, rowIndex);
            
            // Don't render cell if it's part of a giant symbol but not the origin
            if (giantSymbol && !isGiantOrigin) {
              return null;
            }

            return (
              <div
                key={`${reelIndex}-${rowIndex}`}
                className={`
                  aspect-square flex items-center justify-center text-3xl font-bold
                  border-2 border-amber-700/50 rounded-md transition-all duration-300
                  ${spinning ? 'animate-pulse blur-sm' : ''}
                  ${cascading ? 'animate-bounce' : ''}
                  ${isWinning ? 'animate-pulse bg-yellow-400/80 border-yellow-300 shadow-lg shadow-yellow-400/50' : 'bg-amber-800/60'}
                  ${giantSymbol ? `col-span-2 row-span-2 text-5xl bg-gradient-to-br from-yellow-500/80 to-amber-600/80 border-yellow-400 shadow-xl` : ''}
                  ${symbol === "⬛" ? 'bg-amber-950/90 opacity-50' : ''}
                `}
                style={{
                  gridColumn: giantSymbol ? `span 2` : undefined,
                  gridRow: giantSymbol ? `span 2` : undefined,
                }}
              >
                {symbol !== "⬛" && (
                  <span className={`
                    drop-shadow-lg
                    ${spinning ? 'animate-spin' : ''}
                    ${isWinning ? 'animate-pulse scale-110' : ''}
                    ${giantSymbol ? 'animate-pulse' : ''}
                  `}>
                    {symbol}
                  </span>
                )}
              </div>
            );
          })
        ).flat().filter(Boolean)}
      </div>

      {/* Winning Lines Overlay */}
      {winningPositions.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full bg-yellow-400/10 rounded-lg animate-pulse" />
        </div>
      )}

      {/* Free Spin Overlay */}
      {gameState.isFreeSpin && (
        <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-bounce">
          FREE SPIN
        </div>
      )}

      {/* Cascade Counter */}
      {cascading && gameState.cascadeCount > 0 && (
        <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
          CASCADE #{gameState.cascadeCount}
        </div>
      )}
    </div>
  );
};
