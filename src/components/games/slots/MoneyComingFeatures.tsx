
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MoneyComingGameState, MoneyComingSlotEngine } from '@/utils/moneyComingSlotEngine';

interface MoneyComingFeaturesProps {
  gameState: MoneyComingGameState;
  engine: MoneyComingSlotEngine;
}

export const MoneyComingFeatures = ({ gameState, engine }: MoneyComingFeaturesProps) => {
  const {
    freeSpinsRemaining,
    isFreeSpin,
    bonusActive,
    totalWin,
    multiplier,
    jackpotTriggered,
    scatterCount
  } = gameState;

  const gameInfo = engine.getGameInfo();

  return (
    <div className="space-y-4">
      {/* Feature Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Free Spins */}
        <div className="bg-green-800/30 p-3 rounded-lg border border-green-600/50">
          <div className="text-xs text-green-400 mb-1">Free Spins</div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-green-100">
              {freeSpinsRemaining}
            </span>
            {isFreeSpin && (
              <Badge variant="secondary" className="bg-green-600 text-green-100">
                Active
              </Badge>
            )}
          </div>
        </div>

        {/* Multiplier */}
        <div className="bg-green-800/30 p-3 rounded-lg border border-green-600/50">
          <div className="text-xs text-green-400 mb-1">Multiplier</div>
          <div className="text-lg font-bold text-green-100">
            {multiplier}x
            {multiplier > 1 && (
              <span className="ml-1 text-yellow-400 animate-pulse">🌟</span>
            )}
          </div>
        </div>

        {/* Scatter Progress */}
        <div className="bg-green-800/30 p-3 rounded-lg border border-green-600/50">
          <div className="text-xs text-green-400 mb-1">Money Trees</div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-green-100">
              {scatterCount}/3
            </span>
            {scatterCount >= 3 && (
              <span className="text-green-400 animate-bounce">🌳</span>
            )}
          </div>
          <Progress 
            value={(scatterCount / 3) * 100} 
            className="h-1 mt-1"
          />
        </div>

        {/* Total Win */}
        <div className="bg-green-800/30 p-3 rounded-lg border border-green-600/50">
          <div className="text-xs text-green-400 mb-1">Total Win</div>
          <div className="text-lg font-bold text-yellow-400">
            ${totalWin.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Active Features */}
      {(isFreeSpin || bonusActive || jackpotTriggered) && (
        <div className="bg-gradient-to-r from-yellow-600/20 to-green-600/20 p-4 rounded-lg border border-yellow-500/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isFreeSpin && (
                <div className="flex items-center space-x-2">
                  <span className="text-2xl animate-bounce">🌳</span>
                  <div>
                    <div className="font-bold text-green-100">FREE SPINS MODE</div>
                    <div className="text-sm text-green-300">
                      {freeSpinsRemaining} spins remaining • {multiplier}x multiplier
                    </div>
                  </div>
                </div>
              )}

              {bonusActive && (
                <div className="flex items-center space-x-2">
                  <span className="text-2xl animate-pulse">🔒</span>
                  <div>
                    <div className="font-bold text-green-100">VAULT BONUS</div>
                    <div className="text-sm text-green-300">
                      Pick and win bonus activated!
                    </div>
                  </div>
                </div>
              )}

              {jackpotTriggered && (
                <div className="flex items-center space-x-2">
                  <span className="text-2xl animate-spin">💰</span>
                  <div>
                    <div className="font-bold text-yellow-100">JACKPOT WON!</div>
                    <div className="text-sm text-yellow-300">
                      Maximum payout achieved!
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Game Info */}
            <div className="text-right text-xs text-green-300">
              <div>RTP: {gameInfo.rtp}%</div>
              <div>Max Win: {gameInfo.maxWin}</div>
              <div>Volatility: {gameInfo.volatility}</div>
            </div>
          </div>
        </div>
      )}

      {/* Symbol Guide */}
      <div className="bg-green-800/20 p-3 rounded-lg border border-green-600/30">
        <div className="text-sm font-semibold text-green-300 mb-2">Symbol Values</div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-center">
          <div className="space-y-1">
            <div className="text-2xl">💰</div>
            <div className="text-xs text-green-400">Money Bag</div>
            <div className="text-xs text-yellow-400">1000x</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">🪙</div>
            <div className="text-xs text-green-400">Gold Coin</div>
            <div className="text-xs text-yellow-400">800x</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">💎</div>
            <div className="text-xs text-green-400">Diamond</div>
            <div className="text-xs text-yellow-400">600x</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">🌟</div>
            <div className="text-xs text-green-400">Wild</div>
            <div className="text-xs text-purple-400">SUB</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">🌳</div>
            <div className="text-xs text-green-400">Scatter</div>
            <div className="text-xs text-blue-400">FREE</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">🔒</div>
            <div className="text-xs text-green-400">Bonus</div>
            <div className="text-xs text-orange-400">PICK</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">💲</div>
            <div className="text-xs text-green-400">Dollar</div>
            <div className="text-xs text-yellow-400">400x</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">🏦</div>
            <div className="text-xs text-green-400">Bank</div>
            <div className="text-xs text-yellow-400">300x</div>
          </div>
        </div>
      </div>
    </div>
  );
};
