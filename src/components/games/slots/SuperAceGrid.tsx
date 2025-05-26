
import React from "react";

interface SuperAceGridProps {
  reels: string[][];
  spinning: boolean;
  winningLines?: number[];
  superAceActive?: boolean;
}

export const SuperAceGrid = ({ 
  reels, 
  spinning, 
  winningLines = [], 
  superAceActive = false 
}: SuperAceGridProps) => {
  
  const isWinningPosition = (reelIndex: number, rowIndex: number): boolean => {
    return winningLines.includes(rowIndex + 1);
  };

  const isAceSymbol = (symbol: string): boolean => {
    return ["🃁", "♠️", "♥️", "♦️", "♣️"].includes(symbol);
  };

  return (
    <div className="relative">
      {/* Main Grid Container */}
      <div className={`
        grid grid-cols-5 gap-2 p-6 rounded-xl border-4 shadow-2xl
        ${superAceActive 
          ? 'bg-gradient-to-b from-yellow-600/80 to-yellow-800/80 border-yellow-400 animate-pulse' 
          : 'bg-gradient-to-b from-blue-900/70 to-blue-950/70 border-blue-600'
        }
      `}>
        {/* Grid Cells */}
        {reels.map((reel, reelIndex) => 
          reel.map((symbol, rowIndex) => {
            const isWinning = isWinningPosition(reelIndex, rowIndex);
            const isAce = isAceSymbol(symbol);
            
            return (
              <div
                key={`${reelIndex}-${rowIndex}`}
                className={`
                  aspect-square flex items-center justify-center text-4xl font-bold
                  border-2 rounded-lg transition-all duration-300
                  ${spinning ? 'animate-spin blur-sm' : ''}
                  ${isWinning ? 'animate-pulse bg-yellow-400/80 border-yellow-300 shadow-lg shadow-yellow-400/50' : 'bg-white/90 border-blue-300'}
                  ${isAce && !spinning ? 'animate-bounce bg-gradient-to-br from-red-200 to-red-400 border-red-500' : ''}
                  ${superAceActive && isAce ? 'animate-pulse shadow-xl shadow-yellow-500/50' : ''}
                `}
              >
                <span className={`
                  drop-shadow-lg
                  ${spinning ? 'animate-pulse' : ''}
                  ${isWinning ? 'animate-pulse scale-110' : ''}
                  ${isAce ? 'text-red-800' : 'text-blue-900'}
                `}>
                  {symbol}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Winning Lines Overlay */}
      {winningLines.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {winningLines.map(line => (
            <div 
              key={line}
              className="absolute w-full h-1/3 bg-yellow-400/20 animate-pulse"
              style={{ 
                top: `${((line - 1) * 33.33) + 16.5}%`,
                left: '1.5rem',
                right: '1.5rem'
              }}
            />
          ))}
        </div>
      )}

      {/* Super Ace Mode Overlay */}
      {superAceActive && (
        <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce">
          🌟 SUPER ACE MODE
        </div>
      )}
    </div>
  );
};
