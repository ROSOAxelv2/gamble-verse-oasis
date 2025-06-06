
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMoneyComingSlot } from "@/hooks/useMoneyComingSlot";
import { MoneyComingGrid } from "./slots/MoneyComingGrid";
import { MoneyComingFeatures } from "./slots/MoneyComingFeatures";
import { BetControls } from "./slots/BetControls";
import { useAuth } from "@/contexts/AuthContext";
import { ExternalLink } from "lucide-react";

export const MoneyComingSlotMachine = () => {
  const { user } = useAuth();
  const {
    betAmount,
    loading,
    spinning,
    gameResult,
    gameState,
    config,
    engine,
    handleBetAmountChange,
    playSlots
  } = useMoneyComingSlot();

  if (!config.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Money Coming</CardTitle>
          <CardDescription>Jili - Cash collection & bonus mayhem!</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p>Money Coming is currently unavailable. Please check back later.</p>
        </CardContent>
      </Card>
    );
  }

  const gameInfo = engine.getGameInfo();
  
  return (
    <Card className="bg-gradient-to-b from-green-950 via-green-900 to-green-950 text-green-100 border-4 border-green-600 shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-black">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-3 text-2xl font-bold">
              <span>💰 Money Coming</span>
              <span className="text-xs bg-black text-green-400 px-3 py-1 rounded-full border border-green-500 font-bold">
                JILI OFFICIAL
              </span>
            </CardTitle>
            <CardDescription className="text-green-900 font-semibold">
              {gameInfo.reels}×{gameInfo.rows} Grid • {config.minBet/config.minBet} Paylines • Free Spins • Bonus Vault • Jackpot
            </CardDescription>
          </div>
          
          <div className="text-xs bg-green-900 p-4 rounded-lg text-green-100 border-2 border-green-600 shadow-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span><span className="font-bold text-green-400">RTP:</span> {gameInfo.rtp}%</span>
              <span className="text-green-400">|</span>
              <span><span className="font-bold text-green-400">Volatility:</span> {gameInfo.volatility}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span><span className="font-bold text-green-400">Max Win:</span> {gameInfo.maxWin}</span>
              <span className="text-green-400">|</span>
              <a 
                href="https://www.jilislot.net/money-coming/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-green-300 hover:text-green-100 transition-colors"
              >
                <span>Rules</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        <MoneyComingFeatures 
          gameState={gameState}
          engine={engine}
        />
        
        <MoneyComingGrid 
          gameState={gameState}
          spinning={spinning}
          engine={engine}
        />
        
        <BetControls
          betAmount={betAmount}
          onBetChange={handleBetAmountChange}
          minBet={config.minBet}
          maxBet={config.maxBet}
          gameTheme="money-coming"
          gameResult={gameResult}
          onSpin={playSlots}
          isSpinning={spinning}
          isDisabled={loading || !user}
          isBonus={gameState.bonusActive}
          freeSpins={gameState.freeSpinsRemaining}
        />
      </CardContent>
      
      <CardFooter className="text-xs text-green-300/70 bg-green-950/50 border-t-2 border-green-600/30">
        <div className="w-full">
          <div className="font-bold mb-2 text-green-400 text-center">💰 OFFICIAL JILI MONEY COMING MECHANICS 💰</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-semibold text-green-300 mb-1">Winning Features:</div>
              • 25 paylines with left-to-right wins
              <br />
              • Wild symbols (🌟) substitute for all symbols except scatter
              <br />
              • Money Bag (💰) = highest paying symbol
            </div>
            <div>
              <div className="font-semibold text-green-300 mb-1">Bonus Features:</div>
              • Money Tree (🌳): 3+ = 10-25 free spins with 2x multiplier
              <br />
              • Vault Bonus (🔒): 3+ = Pick & win bonus game
              <br />
              • Jackpot: 5 Money Bags = Fixed jackpot win
            </div>
          </div>
          <div className="mt-3 text-center text-green-400/60 text-xs">
            Game mechanics inspired by Jili's Money Coming slot
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
