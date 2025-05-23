
import React from "react";
import { PragmaticGameState, GiantSymbolPosition } from "../../../types/slots";
import { getSymbolByChar, isSymbolType } from "../../../utils/pragmaticSlotSymbols";

interface PragmaticGridProps {
  gameState: PragmaticGameState;
  spinning: boolean;
}

export const PragmaticGrid: React.FC<PragmaticGridProps> = ({ gameState, spinning }) => {
  const { grid, giantSymbols, isFreeSpin } = gameState;
  
  // Helper to check if a cell is part of a giant symbol
  const isPartOfGiantSymbol = (row: number, col: number): GiantSymbolPosition | null => {
    return giantSymbols.find(
      g => row >= g.startRow && row < g.startRow + g.height && 
           col >= g.startCol && col < g.startCol + g.width
    ) || null;
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className={`p-4 rounded-lg border-4 bg-amber-950 border-yellow-600`}>
        <div className="grid grid-cols-6 gap-1">
          {grid.map((row, rowIndex) => (
            <React.Fragment key={`row-${rowIndex}`}>
              {row.map((symbol, colIndex) => {
                // Check if this cell is part of a giant symbol
                const giantSymbol = isPartOfGiantSymbol(rowIndex, colIndex);
                
                // If it's part of a giant symbol but not the top-left corner, don't render
                if (giantSymbol && 
                   (rowIndex !== giantSymbol.startRow || colIndex !== giantSymbol.startCol)) {
                  return null;
                }
                
                // Determine symbol display class
                const isBlank = isSymbolType(symbol, "blank");
                const isPremium = isSymbolType(symbol, "premium");
                const isWild = symbol === "⭐"; // Wild symbol
                const isScatter = symbol === "🌞"; // Scatter symbol
                
                // Determine cell styling based on symbol type
                const cellBaseClasses = "flex items-center justify-center rounded-md";
                
                let cellClasses = `${cellBaseClasses} w-10 h-10 text-xl`;
                let symbolClasses = "";
                
                if (giantSymbol) {
                  // Giant symbol
                  cellClasses = `${cellBaseClasses} w-[5.25rem] h-[5.25rem] text-3xl col-span-2 row-span-2 bg-gradient-to-br`;
                  symbolClasses = "animate-pulse";
                } else if (isBlank) {
                  // Blank space
                  cellClasses += " bg-amber-900/40";
                } else if (isPremium) {
                  // Premium symbol
                  cellClasses += " bg-gradient-to-br from-amber-100 to-amber-300 text-amber-950";
                } else if (isWild) {
                  // Wild symbol
                  cellClasses += " bg-gradient-to-br from-yellow-300 to-yellow-600 text-white";
                  symbolClasses = "animate-pulse";
                } else if (isScatter) {
                  // Scatter symbol
                  cellClasses += " bg-gradient-to-br from-orange-300 to-red-600 text-white";
                  symbolClasses = "animate-spin-slow";
                } else {
                  // Regular symbol
                  cellClasses += " bg-amber-100 text-amber-950";
                }
                
                // Add spinning animation if the reels are spinning
                if (spinning) {
                  symbolClasses += " animate-spin";
                }
                
                // Handle giant symbols with gridspan
                const gridSpanStyle = giantSymbol ? {
                  gridRow: `span ${giantSymbol.height}`,
                  gridColumn: `span ${giantSymbol.width}`
                } : {};
                
                return (
                  <div 
                    key={`cell-${rowIndex}-${colIndex}`} 
                    className={cellClasses}
                    style={gridSpanStyle}
                  >
                    <span className={symbolClasses}>
                      {giantSymbol ? giantSymbol.symbol : symbol}
                    </span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
