
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { usePragmaticSlot } from "../../hooks/usePragmaticSlot";
import { PragmaticGrid } from "./slots/PragmaticGrid";
import { PragmaticFeatures } from "./slots/PragmaticFeatures";
import { BetControls } from "./slots/BetControls";
import { useAuth } from "../../contexts/AuthContext";
import { DEFAULT_PRAGMATIC_CONFIG } from "../../utils/pragmaticSlotSymbols";

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
          <CardTitle>Pragmatic Aztec</CardTitle>
          <CardDescription>Adjacency wins & cascading reels!</CardDescription>
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
            <CardTitle>Pragmatic Aztec</CardTitle>
            <CardDescription className="text-amber-200">
              Adjacency wins & cascading reels!
            </CardDescription>
          </div>
          
          <div className="text-xs bg-amber-900 p-2 rounded-md text-amber-200 border border-yellow-700">
            <span>
              <span className="font-bold">RTP:</span> 96.71%
            </span>
            <span className="mx-2">|</span>
            <span>
              <span className="font-bold">Volatility:</span> High
            </span>
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
          gameTheme="pragmatic-aztec"
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
          * Giant symbols appear on reels 2-5 during free spins
          <br />
          * Wild meter triggers multipliers up to 5x
          <br />
          * 4+ scatters trigger free spins (4=7, 5=10, 6=12)
        </div>
      </CardFooter>
    </Card>
  );
};
