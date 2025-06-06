
import React from 'react';
import { MoneyComingGameState, MoneyComingSlotEngine } from '@/utils/moneyComingSlotEngine';

interface MoneyComingGridProps {
  gameState: MoneyComingGameState;
  spinning: boolean;
  engine: MoneyComingSlotEngine;
}

export const MoneyComingGrid = ({ gameState, spinning, engine }: MoneyComingGridProps) => {
  const { reels, winningLines, wildPositions } = gameState;

  const getSymbolDisplay = (symbolId: string) => {
    const symbol = engine.getSymbolByID(symbolId);
    return symbol?.emoji || '❓';
  };

  const isWinningPosition = (reel: number, row: number): boolean => {
    return winningLines.some(line => 
      line.positions.some(pos => pos.reel === reel && pos.row === row)
    );
  };

  const isWildPosition = (reel: number, row: number): boolean => {
    return wildPositions.some(pos => pos.reel === reel && pos.row === row);
  };

  return (
    <div className="relative">
      {/* Main Grid */}
      <div className="grid grid-cols-5 gap-2 p-4 bg-gradient-to-b from-green-900/50 to-green-800/50 rounded-lg border-2 border-green-500/30 shadow-inner">
        {reels.map((reel, reelIndex) => (
          <div key={reelIndex} className="space-y-2">
            {reel.map((symbol, rowIndex) => {
              const isWinning = isWinningPosition(reelIndex, rowIndex);
              const isWild = isWildPosition(reelIndex, rowIndex);
              const symbolDisplay = getSymbolDisplay(symbol);
              
              return (
                <div
                  key={`${reelIndex}-${rowIndex}`}
                  className={`
                    aspect-square flex items-center justify-center text-4xl
                    rounded-lg border-2 transition-all duration-300
                    ${spinning ? 'animate-spin' : ''}
                    ${isWinning ? 'bg-yellow-400/20 border-yellow-400 shadow-lg shadow-yellow-400/50 animate-pulse' : 
                      isWild ? 'bg-purple-400/20 border-purple-400 shadow-lg shadow-purple-400/50' :
                      'bg-green-800/30 border-green-600/50'}
                    ${!spinning && isWinning ? 'scale-110' : ''}
                    backdrop-blur-sm
                  `}
                >
                  <span className={`
                    drop-shadow-lg
                    ${isWinning ? 'animate-bounce' : ''}
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

      {/* Winning Lines Overlay */}
      {!spinning && winningLines.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {winningLines.map((line, index) => (
            <div
              key={line.line}
              className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-yellow-300/20 to-yellow-400/10 rounded-lg animate-pulse"
              style={{
                animationDelay: `${index * 200}ms`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>
      )}

      {/* Spinning Overlay */}
      {spinning && (
        <div className="absolute inset-0 bg-green-900/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="text-6xl animate-spin">💰</div>
        </div>
      )}

      {/* Payline Numbers */}
      <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-around text-xs text-green-400/70">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="text-center font-mono">
            {[1, 6, 11, 16, 21][i]}
          </div>
        ))}
      </div>
      
      <div className="absolute -right-8 top-0 bottom-0 flex flex-col justify-around text-xs text-green-400/70">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="text-center font-mono">
            {[5, 10, 15, 20, 25][i]}
          </div>
        ))}
      </div>
    </div>
  );
};
