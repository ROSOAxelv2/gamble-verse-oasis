
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { JiliGameState, JiliSpinResult, JiliMoneyComingEngine } from '@/utils/jiliMoneyComingEngine';

interface JiliMoneyComingFeaturesProps {
  gameState: JiliGameState;
  gameResult: JiliSpinResult | null;
  engine: JiliMoneyComingEngine;
}

export const JiliMoneyComingFeatures = ({ gameState, gameResult, engine }: JiliMoneyComingFeaturesProps) => {
  const { respinCount, totalWin, multiplierReel, showBonusWheel } = gameState;
  const gameInfo = engine.getGameInfo();

  return (
    <div className="space-y-4">
      {/* Feature Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Respin Counter */}
        <div className="bg-yellow-800/30 p-3 rounded-lg border border-yellow-600/50">
          <div className="text-xs text-yellow-400 mb-1">Respins</div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-yellow-100">
              {respinCount}/{gameInfo.maxRespins}
            </span>
            {respinCount > 0 && (
              <Badge variant="secondary" className="bg-blue-600 text-blue-100">
                Active
              </Badge>
            )}
          </div>
          <Progress 
            value={(respinCount / gameInfo.maxRespins) * 100} 
            className="h-1 mt-1"
          />
        </div>

        {/* Current Multiplier */}
        <div className="bg-yellow-800/30 p-3 rounded-lg border border-yellow-600/50">
          <div className="text-xs text-yellow-400 mb-1">Multiplier</div>
          <div className="text-lg font-bold text-yellow-100">
            {multiplierReel === 'respin' ? '🔄' :
             multiplierReel === 'bonus_wheel' ? '🎡' :
             multiplierReel}
            {multiplierReel.startsWith('x') && (
              <span className="ml-1 text-green-400 animate-pulse">✨</span>
            )}
          </div>
        </div>

        {/* Last Win */}
        <div className="bg-yellow-800/30 p-3 rounded-lg border border-yellow-600/50">
          <div className="text-xs text-yellow-400 mb-1">Last Win</div>
          <div className="text-lg font-bold text-yellow-400">
            ${gameResult?.finalWin?.toFixed(2) || '0.00'}
          </div>
        </div>

        {/* Total Win */}
        <div className="bg-yellow-800/30 p-3 rounded-lg border border-yellow-600/50">
          <div className="text-xs text-yellow-400 mb-1">Total Win</div>
          <div className="text-lg font-bold text-green-400">
            ${totalWin.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Active Features */}
      {(respinCount > 0 || showBonusWheel || gameResult?.isWin) && (
        <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 p-4 rounded-lg border border-yellow-500/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {respinCount > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-2xl animate-spin">🔄</span>
                  <div>
                    <div className="font-bold text-yellow-100">RESPIN MODE</div>
                    <div className="text-sm text-yellow-300">
                      {respinCount}/{gameInfo.maxRespins} respins used
                    </div>
                  </div>
                </div>
              )}

              {showBonusWheel && (
                <div className="flex items-center space-x-2">
                  <span className="text-2xl animate-pulse">🎡</span>
                  <div>
                    <div className="font-bold text-yellow-100">BONUS WHEEL</div>
                    <div className="text-sm text-yellow-300">
                      Spin the wheel for mega multipliers!
                    </div>
                  </div>
                </div>
              )}

              {gameResult?.isWin && !showBonusWheel && respinCount === 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-2xl animate-bounce">💰</span>
                  <div>
                    <div className="font-bold text-yellow-100">WINNING COMBINATION</div>
                    <div className="text-sm text-yellow-300">
                      Center line match: {gameResult.centerLine.join('-')}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Game Info */}
            <div className="text-right text-xs text-yellow-300">
              <div>RTP: {gameInfo.rtp}%</div>
              <div>Paylines: {gameInfo.paylines}</div>
              <div>Provider: {gameInfo.provider}</div>
            </div>
          </div>
        </div>
      )}

      {/* Paytable Reference */}
      <div className="bg-yellow-800/20 p-3 rounded-lg border border-yellow-600/30">
        <div className="text-sm font-semibold text-yellow-300 mb-2">Jili Money Coming Paytable</div>
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          <div className="space-y-1">
            <div className="text-2xl">💰</div>
            <div className="text-yellow-400">00-00-00</div>
            <div className="text-green-400 font-bold">50x</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">🔟</div>
            <div className="text-yellow-400">10-10-10</div>
            <div className="text-green-400 font-bold">10x</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">5️⃣</div>
            <div className="text-yellow-400">5-5-5</div>
            <div className="text-green-400 font-bold">5x</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">1️⃣</div>
            <div className="text-yellow-400">1-1-1</div>
            <div className="text-green-400 font-bold">2x</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">0️⃣</div>
            <div className="text-yellow-400">0-0-0</div>
            <div className="text-green-400 font-bold">1x</div>
          </div>
        </div>
      </div>
    </div>
  );
};
