
import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SuperAceFeaturesProps {
  aceCount: number;
  multiplier: number;
  superAceActive: boolean;
  freeSpinsRemaining: number;
  totalWin: number;
}

export const SuperAceFeatures = ({
  aceCount,
  multiplier,
  superAceActive,
  freeSpinsRemaining,
  totalWin
}: SuperAceFeaturesProps) => {
  const aceProgress = (aceCount / 4) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Ace Meter */}
      <Card className={`p-4 ${superAceActive ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500' : 'bg-blue-950/30 border-blue-600'}`}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-100">🃁 Ace Meter</span>
            <span className="text-xs text-blue-200">{aceCount}/4</span>
          </div>
          <Progress 
            value={aceProgress} 
            className={`h-3 ${superAceActive ? 'bg-yellow-900' : 'bg-blue-900'}`}
          />
          <p className="text-xs text-blue-300">
            Collect 4 Aces to trigger Super Ace Mode!
          </p>
        </div>
      </Card>

      {/* Multiplier Display */}
      <Card className={`p-4 ${superAceActive ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500' : 'bg-blue-950/30 border-blue-600'}`}>
        <div className="text-center space-y-2">
          <div className="text-sm font-semibold text-blue-100">💫 Multiplier</div>
          <div className={`text-2xl font-bold ${superAceActive ? 'text-yellow-400 animate-pulse' : 'text-blue-200'}`}>
            {multiplier}x
          </div>
          {superAceActive && (
            <p className="text-xs text-yellow-300 animate-bounce">
              SUPER ACE ACTIVE!
            </p>
          )}
        </div>
      </Card>

      {/* Free Spins & Win Display */}
      <Card className={`p-4 ${superAceActive ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500' : 'bg-blue-950/30 border-blue-600'}`}>
        <div className="space-y-2">
          {freeSpinsRemaining > 0 ? (
            <>
              <div className="text-sm font-semibold text-blue-100">🎯 Free Spins</div>
              <div className="text-xl font-bold text-yellow-400 animate-pulse">
                {freeSpinsRemaining}
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold text-blue-100">💰 Total Win</div>
              <div className="text-xl font-bold text-green-400">
                {totalWin.toFixed(2)}
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
