
import React from "react";
import { PragmaticGameState } from "../../../types/slots";

interface PragmaticGridProps {
  gameState: PragmaticGameState;
  spinning: boolean;
}

export const PragmaticGrid = ({ gameState, spinning }: PragmaticGridProps) => {
  return (
    <div className="grid grid-cols-5 gap-1 p-4 bg-amber-900/50 rounded-lg border-2 border-amber-600">
      {gameState.grid.map((row, rowIndex) =>
        row.map((symbol, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`
              aspect-square flex items-center justify-center text-2xl
              bg-amber-800/70 border border-amber-600 rounded
              ${spinning ? 'animate-pulse' : ''}
              transition-all duration-300
            `}
          >
            {symbol}
          </div>
        ))
      )}
    </div>
  );
};
