
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useJiliMoneyComingSlot } from "@/hooks/useJiliMoneyComingSlot";
import { JiliMoneyComingGrid } from "./slots/JiliMoneyComingGrid";
import { JiliMoneyComingFeatures } from "./slots/JiliMoneyComingFeatures";
import { BetControls } from "./slots/BetControls";
import { JiliBonusWheelOverlay } from "./slots/JiliBonusWheelOverlay";
import { useAuth } from "@/contexts/AuthContext";
import { ExternalLink } from "lucide-react";

export const JiliMoneyComingSlotMachine = () => {
  const { user } = useAuth();
  const {
    betAmount,
    loading,
    spinning,
    gameResult,
    bonusWheelResult,
    gameState,
    config,
    engine,
    handleBetAmountChange,
    playSlots,
    spinBonusWheel
  } = useJiliMoneyComingSlot();

  if (!config.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Money Coming</CardTitle>
          <CardDescription>Jili - Official Money Coming Slot</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p>Money Coming is currently unavailable. Please check back later.</p>
        </CardContent>
      </Card>
    );
  }

  const gameInfo = engine.getGameInfo();
  
  return (
    <div className="relative">
      <Card className="bg-gradient-to-b from-yellow-950 via-yellow-900 to-yellow-950 text-yellow-100 border-4 border-yellow-600 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-black">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-3 text-2xl font-bold">
                <span>💰 Money Coming</span>
                <span className="text-xs bg-black text-yellow-400 px-3 py-1 rounded-full border border-yellow-500 font-bold">
                  JILI OFFICIAL
                </span>
              </CardTitle>
              <CardDescription className="text-yellow-900 font-semibold">
                {gameInfo.reels}×{gameInfo.rows} Grid + Multiplier Reel • Single Payline • Respin Feature • Bonus Wheel
              </CardDescription>
            </div>
            
            <div className="text-xs bg-yellow-900 p-4 rounded-lg text-yellow-100 border-2 border-yellow-600 shadow-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span><span className="font-bold text-yellow-400">RTP:</span> {gameInfo.rtp}%</span>
                <span className="text-yellow-400">|</span>
                <span><span className="font-bold text-yellow-400">Volatility:</span> {gameInfo.volatility}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span><span className="font-bold text-yellow-400">Max Respins:</span> {gameInfo.maxRespins}</span>
                <span className="text-yellow-400">|</span>
                <a 
                  href="https://slotcatalog.com/en/slots/Money-Coming" 
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
          <JiliMoneyComingFeatures 
            gameState={gameState}
            gameResult={gameResult}
            engine={engine}
          />
          
          <JiliMoneyComingGrid 
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
            gameResult={null}
            onSpin={playSlots}
            isSpinning={spinning}
            isDisabled={loading || !user || gameState.showBonusWheel}
            isBonus={gameState.showBonusWheel}
            freeSpins={0}
          />
        </CardContent>
        
        <CardFooter className="text-xs text-yellow-300/70 bg-yellow-950/50 border-t-2 border-yellow-600/30">
          <div className="w-full">
            <div className="font-bold mb-2 text-yellow-400 text-center">💰 OFFICIAL JILI MONEY COMING MECHANICS 💰</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="font-semibold text-yellow-300 mb-1">Main Game:</div>
                • 3×3 main reels + multiplier reel (4th reel)
                <br />
                • Single payline across center row only
                <br />
                • Symbols: 0, 1, 5, 10, 00 (highest paying)
              </div>
              <div>
                <div className="font-semibold text-yellow-300 mb-1">Special Features:</div>
                • Multiplier reel: x2-x10 multipliers
                <br />
                • Respin feature: up to 3 consecutive respins
                <br />
                • Bonus Wheel: 12 segments with massive multipliers
              </div>
            </div>
            <div className="mt-3 text-center text-yellow-400/60 text-xs">
              Authentic Jili Money Coming slot mechanics - RTP: {gameInfo.rtp}%
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Bonus Wheel Overlay */}
      {gameState.showBonusWheel && (
        <JiliBonusWheelOverlay
          onSpin={spinBonusWheel}
          result={bonusWheelResult}
          baseWin={gameResult?.baseWin || 0}
        />
      )}
    </div>
  );
};
