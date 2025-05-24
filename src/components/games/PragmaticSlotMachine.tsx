
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { usePragmaticSlot } from "../../hooks/usePragmaticSlot";
import { PragmaticGrid } from "./slots/PragmaticGrid";
import { PragmaticFeatures } from "./slots/PragmaticFeatures";
import { BetControls } from "./slots/BetControls";
import { useAuth } from "../../contexts/AuthContext";
import { DEFAULT_PRAGMATIC_CONFIG } from "../../utils/pragmaticSlotSymbols";
import { ExternalLink } from "lucide-react";

export const PragmaticSlotMachine = () => {
  const { user } = useAuth();
  const {
    betAmount,
    loading,
    spinning,
    gameResult,
    gameState,
    config,
    handleBetAmountChange,
    playSlots
  } = usePragmaticSlot();

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
    <Card className="bg-gradient-to-b from-amber-950 to-amber-900 text-amber-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>Treasures of Aztec</span>
              <span className="text-xs bg-amber-800 px-2 py-1 rounded border border-amber-600">
                PG Soft
              </span>
            </CardTitle>
            <CardDescription className="text-amber-200">
              Official PG Soft clone - Adjacency wins & cascading reels!
            </CardDescription>
          </div>
          
          <div className="text-xs bg-amber-900 p-3 rounded-md text-amber-200 border border-yellow-700">
            <div className="flex items-center space-x-1 mb-1">
              <span><span className="font-bold">RTP:</span> 96.71%</span>
              <span className="mx-2">|</span>
              <span><span className="font-bold">Volatility:</span> High</span>
            </div>
            <div className="flex items-center space-x-1">
              <span><span className="font-bold">Max Win:</span> 5000x</span>
              <span className="mx-2">|</span>
              <a 
                href="https://www.slotstemple.com/us/free-slots/treasures-of-aztec/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-amber-300 hover:text-amber-100 transition-colors"
              >
                <span>Rules</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <PragmaticFeatures 
          gameState={gameState}
          config={{
            wildMeterThreshold: DEFAULT_PRAGMATIC_CONFIG.wildMeterThreshold
          }}
        />
        
        <PragmaticGrid 
          gameState={gameState}
          spinning={spinning}
        />
        
        <BetControls
          betAmount={betAmount}
          onBetChange={handleBetAmountChange}
          minBet={config.minBet}
          maxBet={config.maxBet}
          gameTheme="pg-soft-aztec"
          gameResult={gameResult}
          onSpin={playSlots}
          isSpinning={spinning}
          isDisabled={loading || !user}
          isBonus={gameState.isFreeSpin}
          freeSpins={gameState.freeSpinsRemaining}
        />
      </CardContent>
      <CardFooter className="text-xs text-amber-300/70">
        <div>
          <div className="font-semibold mb-1">PG Soft Official Rules:</div>
          * 4+ adjacent symbols trigger wins (any direction)
          <br />
          * Giant symbols (2x2) appear on reels 2-5 during free spins
          <br />
          * Wild meter fills with wilds, triggers multipliers up to 5x
          <br />
          * 4+ scatters trigger free spins: 4=7, 5=10, 6=12 spins
          <br />
          * Cascading reels remove winning symbols for new ones
          <br />
          <div className="mt-2 text-amber-400/60">
            Source: <a href="https://www.slotstemple.com/us/free-slots/treasures-of-aztec/" 
                     target="_blank" rel="noopener noreferrer" 
                     className="underline hover:text-amber-300">
              SlotsTemple.com PG Soft Rules
            </a>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
