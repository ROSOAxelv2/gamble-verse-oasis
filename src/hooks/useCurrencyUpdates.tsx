
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface CurrencyData {
  balance: number;
  timestamp: number;
}

export const useCurrencyUpdates = (gameId: string) => {
  const { user, updateUserBalance } = useAuth();
  const [balance, setBalance] = useState<number>(user?.balance || 0);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Simulate WebSocket connection for real-time updates
  // In production, this would connect to your WebSocket server
  const simulateBalanceUpdate = useCallback(() => {
    if (!user) return;
    
    // Simulate random balance fluctuations (for demo purposes)
    const randomChange = (Math.random() - 0.5) * 10; // ±5
    const newBalance = Math.max(0, user.balance + randomChange);
    
    setBalance(newBalance);
    setLastUpdate(Date.now());
    
    // Update the auth context
    updateUserBalance(randomChange);
  }, [user, updateUserBalance]);

  // Polling mechanism as fallback
  useEffect(() => {
    if (!gameId || !user) return;

    // Simulate connection status
    setIsConnected(true);

    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      // In production, this would make an API call
      // For demo, we'll occasionally simulate an update
      if (Math.random() < 0.3) { // 30% chance of update
        simulateBalanceUpdate();
      }
    }, 5000);

    // Simulate occasional connection issues
    const connectionCheck = setInterval(() => {
      setIsConnected(Math.random() > 0.1); // 90% uptime
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(connectionCheck);
    };
  }, [gameId, user, simulateBalanceUpdate]);

  // Update local balance when user balance changes
  useEffect(() => {
    if (user?.balance !== undefined) {
      setBalance(user.balance);
    }
  }, [user?.balance]);

  const forceUpdate = useCallback(() => {
    simulateBalanceUpdate();
  }, [simulateBalanceUpdate]);

  return {
    balance,
    isConnected,
    lastUpdate,
    forceUpdate
  };
};
