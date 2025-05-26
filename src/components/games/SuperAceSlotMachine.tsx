
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSuperAceSlot } from "../../hooks/useSuperAceSlot";
import { SuperAceGrid } from "./slots/SuperAceGrid";
import { SuperAceFeatures } from "./slots/SuperAceFeatures";
import { BetControls } from "./slots/BetControls";
import { useAuth } from "../../contexts/AuthContext";
import { ExternalLink } from "lucide-react";

export const SuperAceSlotMachine = () => {
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
  } = useSuperAceSlot();

  if (!config.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Super Ace</CardTitle>
          <CardDescription>Jili - Ace collecting & multiplier mayhem!</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p>Slot Machine is currently unavailable. Please check back later.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 text-blue-100 border-4 border-blue-600 shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-3 text-2xl font-bold">
              <span>🃁 Super Ace</span>
              <span className="text-xs bg-black text-blue-400 px-3 py-1 rounded-full border border-blue-500 font-bold">
                JILI OFFICIAL
              </span>
            </CardTitle>
            <CardDescription className="text-blue-100 font-semibold">
              5×3 Grid • Ace Collection • Super Multipliers • Free Spins
            </CardDescription>
          </div>
          
          <div className="text-xs bg-blue-900 p-4 rounded-lg text-blue-100 border-2 border-blue-600 shadow-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span><span className="font-bold text-blue-400">RTP:</span> 96.80%</span>
              <span className="text-blue-400">|</span>
              <span><span className="font-bold text-blue-400">Volatility:</span> Medium</span>
            </div>
            <div className="flex items-center space-x-2">
              <span><span className="font-bold text-blue-400">Max Win:</span> 2000x</span>
              <span className="text-blue-400">|</span>
              <a 
                href="https://www.jilislot.net/super-ace/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-blue-300 hover:text-blue-100 transition-colors"
              >
                <span>Rules</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        <SuperAceFeatures 
          aceCount={gameState.aceCount}
          multiplier={gameState.multiplier}
          superAceActive={gameState.superAceActive}
          freeSpinsRemaining={gameState.freeSpinsRemaining}
          totalWin={gameState.totalWin}
        />
        
        <SuperAceGrid 
          reels={gameState.reels}
          spinning={spinning}
          winningLines={gameState.winningLines}
          superAceActive={gameState.superAceActive}
        />
        
        <BetControls
          betAmount={betAmount}
          onBetChange={handleBetAmountChange}
          minBet={config.minBet}
          maxBet={config.maxBet}
          gameTheme="super-ace"
          gameResult={gameResult}
          onSpin={playSlots}
          isSpinning={spinning}
          isDisabled={loading || !user}
          isBonus={gameState.superAceActive}
          freeSpins={gameState.freeSpinsRemaining}
        />
      </CardContent>
      
      <CardFooter className="text-xs text-blue-300/70 bg-blue-950/50 border-t-2 border-blue-600/30">
        <div className="w-full">
          <div className="font-bold mb-2 text-blue-400 text-center">🃁 OFFICIAL JILI SUPER ACE MECHANICS 🃁</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-semibold text-blue-300 mb-1">Ace Collection:</div>
              • Collect Ace symbols (🃁, ♠️, ♥️, ♦️, ♣️) across all reels
              <br />
              • 3+ Aces = Instant bonus payout (10x per Ace)
              <br />
              • 4+ Aces = Triggers Super Ace Mode
            </div>
            <div>
              <div className="font-semibold text-blue-300 mb-1">Super Ace Mode:</div>
              • Activates 3x multiplier on all wins
              <br />
              • Awards 5 free spins with enhanced payouts
              <br />
              • Special animations and visual effects
            </div>
          </div>
          <div className="mt-3 text-center text-blue-400/60 text-xs">
            Game inspired by Jili's Super Ace slot mechanics
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
