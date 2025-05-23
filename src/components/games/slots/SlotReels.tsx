
import React from "react";
import { SlotGameTheme } from "../../../types/slots";

interface SlotReelsProps {
  reels: string[][];
  gameTheme: SlotGameTheme;
}

export const SlotReels: React.FC<SlotReelsProps> = ({ reels, gameTheme }) => {
  return (
    <div className="flex justify-center">
      <div className={`p-4 rounded-lg border-4 ${gameTheme === SlotGameTheme.TREASURE_OF_AZTEC ? 'bg-amber-950 border-yellow-600' : 'bg-black border-yellow-500'}`}>
        <div className="grid grid-cols-3 gap-2 text-center">
          {reels.map((reel, reelIndex) => (
            <div key={`reel-${reelIndex}`} className="flex flex-col">
              {reel.map((symbol, symbolIndex) => (
                <div 
                  key={`symbol-${reelIndex}-${symbolIndex}`} 
                  className={`flex items-center justify-center ${
                    gameTheme === SlotGameTheme.TREASURE_OF_AZTEC 
                      ? 'bg-amber-100 text-amber-950' 
                      : 'bg-white text-black'
                  } w-16 h-16 text-3xl rounded-md`}
                >
                  {symbol}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
