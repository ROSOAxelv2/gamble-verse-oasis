
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { useCurrencyUpdates } from '@/hooks/useCurrencyUpdates';

interface CurrencyBarProps {
  gameId: string;
  currentBet?: number;
  lastWin?: number;
  showCurrencyBar?: boolean;
}

export const CurrencyBar = ({ 
  gameId, 
  currentBet = 0, 
  lastWin = 0,
  showCurrencyBar = true 
}: CurrencyBarProps) => {
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

  if (!showCurrencyBar || !user) {
    return null;
  }

  return (
    <Card className="
      fixed top-0 left-0 right-0 z-40
      bg-black/80 backdrop-blur-sm border-0 border-b border-white/20
      rounded-none shadow-lg
    ">
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        {/* Balance */}
        <div className="flex items-center gap-2">
          <span className="text-gray-300">Balance:</span>
          <span 
            className={`
              font-bold text-white transition-all duration-500
              ${animatingValue !== null ? 'animate-pulse text-green-400 scale-110' : ''}
            `}
          >
            ${(balance || user.balance).toFixed(2)}
          </span>
          {!isConnected && (
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" 
                 title="Connection lost" />
          )}
        </div>

        {/* Bet Amount */}
        <div className="flex items-center gap-2">
          <span className="text-gray-300">Bet:</span>
          <span className="font-semibold text-yellow-400">
            ${currentBet.toFixed(2)}
          </span>
        </div>

        {/* Last Win */}
        {lastWin > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-gray-300">Win:</span>
            <span className="font-bold text-green-400 animate-pulse">
              +${lastWin.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
