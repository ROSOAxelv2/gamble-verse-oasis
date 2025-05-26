
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { usePGSoftSlot } from "../../hooks/usePGSoftSlot";
import { PGSoftGrid } from "./slots/PGSoftGrid";
import { PGSoftFeatures } from "./slots/PGSoftFeatures";
import { BetControls } from "./slots/BetControls";
import { useAuth } from "../../contexts/AuthContext";
import { ExternalLink } from "lucide-react";

export const PragmaticSlotMachine = () => {
  const { user } = useAuth();
  const {
    betAmount,
    loading,
    spinning,
    cascading,
    gameResult,
    gameState,
    config,
    handleBetAmountChange,
    playSlots
  } = usePGSoftSlot();

  if (!config.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Treasures of Aztec</CardTitle>
          <CardDescription>PG Soft - Adjacency wins & cascading reels!</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p>Slot Machine is currently unavailable. Please check back later.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-gradient-to-b from-amber-950 via-amber-900 to-amber-950 text-amber-100 border-4 border-yellow-600 shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-black">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-3 text-2xl font-bold">
              <span>🏛️ Treasures of Aztec</span>
              <span className="text-xs bg-black text-yellow-400 px-3 py-1 rounded-full border border-yellow-500 font-bold">
                PG SOFT OFFICIAL
              </span>
            </CardTitle>
            <CardDescription className="text-amber-900 font-semibold">
              6×5 Grid • Adjacency Wins • Cascading Reels • Giant Symbols
            </CardDescription>
          </div>
          
          <div className="text-xs bg-amber-900 p-4 rounded-lg text-amber-100 border-2 border-yellow-600 shadow-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span><span className="font-bold text-yellow-400">RTP:</span> 96.71%</span>
              <span className="text-yellow-400">|</span>
              <span><span className="font-bold text-yellow-400">Volatility:</span> High</span>
            </div>
            <div className="flex items-center space-x-2">
              <span><span className="font-bold text-yellow-400">Max Win:</span> 5000x</span>
              <span className="text-yellow-400">|</span>
              <a 
                href="https://www.slotstemple.com/us/free-slots/treasures-of-aztec/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-yellow-300 hover:text-yellow-100 transition-colors"
              >
                <span>Rules</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        <PGSoftFeatures 
          gameState={gameState}
          wildMeterThreshold={6}
        />
        
        <PGSoftGrid 
          gameState={gameState}
          spinning={spinning}
          cascading={cascading}
        />
        
        <BetControls
          betAmount={betAmount}
          onBetChange={handleBetAmountChange}
          minBet={config.minBet}
          maxBet={config.maxBet}
          gameTheme="pg-soft-aztec"
          gameResult={gameResult}
          onSpin={playSlots}
          isSpinning={spinning || cascading}
          isDisabled={loading || !user}
          isBonus={gameState.isFreeSpin}
          freeSpins={gameState.freeSpinsRemaining}
        />
      </CardContent>
      
      <CardFooter className="text-xs text-amber-300/70 bg-amber-950/50 border-t-2 border-yellow-600/30">
        <div className="w-full">
          <div className="font-bold mb-2 text-yellow-400 text-center">🏛️ OFFICIAL PG SOFT MECHANICS 🏛️</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-semibold text-yellow-300 mb-1">Adjacency Wins:</div>
              • 4+ adjacent symbols on consecutive reels (left→right)
              <br />
              • Blank symbols break adjacency chains
              <br />
              • Wild Ring substitutes for all paying symbols
            </div>
            <div>
              <div className="font-semibold text-yellow-300 mb-1">Bonus Features:</div>
              • Wild Meter: 6 wilds = random 2x-5x multiplier
              <br />
              • Free Spins: 4+ scatters (7/10/12 spins)
              <br />
              • Giant Symbols: 2×2 blocks during free spins
            </div>
          </div>
          <div className="mt-3 text-center text-amber-400/60 text-xs">
            Mechanics source: <a href="https://www.slotstemple.com/us/free-slots/treasures-of-aztec/" 
                 target="_blank" rel="noopener noreferrer" 
                 className="underline hover:text-amber-300">
              SlotsTemple.com Official Rules
            </a>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
