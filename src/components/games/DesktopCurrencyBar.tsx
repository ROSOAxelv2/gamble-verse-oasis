
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { useCurrencyUpdates } from '@/hooks/useCurrencyUpdates';

interface DesktopCurrencyBarProps {
  gameId: string;
  currentBet?: number;
  lastWin?: number;
}

export const DesktopCurrencyBar = ({ 
  gameId, 
  currentBet = 0, 
  lastWin = 0 
}: DesktopCurrencyBarProps) => {
  const { user } = useAuth();
  const { balance, isConnected } = useCurrencyUpdates(gameId);
  const [animatingValue, setAnimatingValue] = useState<number | null>(null);

  // Animate balance changes
  useEffect(() => {
    if (balance !== user?.balance && user?.balance !== undefined) {
      setAnimatingValue(balance);
      const timer = setTimeout(() => setAnimatingValue(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [balance, user?.balance]);

  if (!user) {
    return null;
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Balance */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Balance:</span>
            <span 
              className={`
                text-2xl font-bold transition-all duration-500
                ${animatingValue !== null ? 'animate-pulse text-green-500 scale-110' : 'text-foreground'}
              `}
            >
              ${(balance || user.balance).toFixed(2)}
            </span>
            {!isConnected && (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-2" 
                   title="Connection lost" />
            )}
          </div>
        </div>

        {/* Game Stats */}
        <div className="flex items-center gap-6">
          {currentBet > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Current Bet:</span>
              <span className="text-lg font-semibold text-yellow-600">
                ${currentBet.toFixed(2)}
              </span>
            </div>
          )}

          {lastWin > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Last Win:</span>
              <span className="text-lg font-bold text-green-600 animate-pulse">
                +${lastWin.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-muted-foreground">Live</span>
        </div>
      </div>
    </Card>
  );
};
