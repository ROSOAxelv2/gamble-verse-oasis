
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { gameService, userService } from "@/services/api";
import { CrashGameResult, GameType } from "@/types";
import { toast } from "sonner";
import { TrendingUp, DollarSign } from "lucide-react";

export const CrashGame = () => {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isCashing, setIsCashing] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<CrashGameResult | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.00);
  const [autoCashoutAt, setAutoCashoutAt] = useState<number>(2.00);
  const [gameHistory, setGameHistory] = useState<number[]>([]);
  
  const animationFrameRef = useRef<number | null>(null);
  const gameStartTimeRef = useRef<number | null>(null);
  const targetCrashPointRef = useRef<number | null>(null);
  
  // Fetch user balance on component mount
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const user = await userService.getProfile();
        setBalance(user.balance);
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      }
    };
    
    fetchBalance();
    
    // Cleanup animation frame on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  const updateMultiplier = (timestamp: number) => {
    if (!gameStartTimeRef.current || !targetCrashPointRef.current) return;
    
    // Calculate elapsed time since game start
    const elapsedTime = timestamp - gameStartTimeRef.current;
    
    // Use exponential growth formula to calculate the current multiplier
    // This formula ensures the crash reaches the target point at the right time
    const targetPoint = targetCrashPointRef.current;
    const targetTime = 1000 * Math.log2(targetPoint); // Time in ms to reach target
    
    // Calculate current multiplier
    const newMultiplier = Math.pow(2, elapsedTime / 1000);
    
    // Update UI
    setCurrentMultiplier(parseFloat(newMultiplier.toFixed(2)));
    
    // Auto-cashout if enabled
    if (newMultiplier >= autoCashoutAt && isPlaying) {
      handleCashout();
      return;
    }
    
    // Check if we've hit the crash point
    if (newMultiplier >= targetPoint) {
      // Game over - crashed
      handleCrash(targetPoint);
      return;
    }
    
    // Continue animation
    animationFrameRef.current = requestAnimationFrame(updateMultiplier);
  };
  
  const startGame = async () => {
    setIsCashing(false);
    
    try {
      // Validate bet amount
      if (betAmount <= 0) {
        toast.error("Please enter a valid bet amount");
        return;
      }
      
      if (balance < betAmount) {
        toast.error("Insufficient balance");
        return;
      }
      
      // Start the game
      setIsPlaying(true);
      setGameResult(null);
      
      // Define a target crash point - this will be determined by the server in a real game
      // to prevent client-side manipulation. For now, we'll simulate it locally.
      const targetPoint = 1 + Math.random() * 9; // Random between 1 and 10
      targetCrashPointRef.current = targetPoint;
      gameStartTimeRef.current = performance.now();
      
      // Start animation
      animationFrameRef.current = requestAnimationFrame(updateMultiplier);
      
      // Update balance (place bet)
      const user = await userService.updateBalance(betAmount, 'bet', GameType.CRASH);
      setBalance(user.balance);
      
    } catch (error) {
      console.error("Failed to start game:", error);
      toast.error("An error occurred while starting the game");
      setIsPlaying(false);
    }
  };
  
  const handleCashout = async () => {
    if (!isPlaying || isCashing) return;
    
    setIsCashing(true);
    
    try {
      // Stop animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Calculate win amount based on current multiplier
      const winAmount = betAmount * currentMultiplier;
      
      // Update user balance
      const user = await userService.updateBalance(winAmount, 'win', GameType.CRASH);
      setBalance(user.balance);
      
      // Update game result
      const result: CrashGameResult = {
        betAmount,
        winAmount,
        cashoutMultiplier: currentMultiplier,
        crashPoint: targetCrashPointRef.current || 0,
        isWin: true,
      };
      
      setGameResult(result);
      setIsPlaying(false);
      
      toast.success(`You won ${winAmount.toFixed(2)} credits!`);
      
    } catch (error) {
      console.error("Failed to cash out:", error);
      toast.error("An error occurred while cashing out");
      setIsPlaying(false);
    } finally {
      setIsCashing(false);
    }
  };
  
  const handleCrash = (crashPoint: number) => {
    // Stop animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Update game history
    setGameHistory(prev => [crashPoint, ...prev].slice(0, 10));
    
    // Update game result
    const result: CrashGameResult = {
      betAmount,
      winAmount: 0,
      cashoutMultiplier: 0,
      crashPoint,
      isWin: false,
    };
    
    setGameResult(result);
    setIsPlaying(false);
    toast.error(`Crashed at ${crashPoint.toFixed(2)}x!`);
  };
  
  const handleBetChange = (value: string) => {
    const newValue = parseInt(value);
    if (!isNaN(newValue) && newValue >= 0) {
      setBetAmount(newValue);
    }
  };
  
  const handleAutoCashoutChange = (value: string) => {
    const newValue = parseFloat(value);
    if (!isNaN(newValue) && newValue >= 1) {
      setAutoCashoutAt(parseFloat(newValue.toFixed(2)));
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm">Balance: {balance.toLocaleString()} credits</div>
            {gameHistory.length > 0 && (
              <div className="flex gap-2">
                {gameHistory.map((point, index) => (
                  <div 
                    key={index} 
                    className={`text-xs px-2 py-1 rounded ${point < 2 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                  >
                    {point.toFixed(2)}x
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="relative h-60 bg-gray-100 rounded-lg mb-6 flex flex-col items-center justify-center overflow-hidden">
            {isPlaying ? (
              <>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl font-bold">{currentMultiplier.toFixed(2)}x</div>
                </div>
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-green-500 transition-all" 
                  style={{ 
                    height: `${Math.min((currentMultiplier - 1) / 9 * 100, 100)}%`,
                    transition: 'height 0.1s linear'
                  }}
                ></div>
                <Button
                  onClick={handleCashout}
                  className="absolute bottom-4 right-4 bg-green-500 hover:bg-green-600 z-10"
                  disabled={!isPlaying || isCashing}
                >
                  {isCashing ? "Cashing Out..." : "Cash Out"}
                </Button>
              </>
            ) : (
              gameResult ? (
                <div className="text-center">
                  {gameResult.isWin ? (
                    <div className="space-y-2">
                      <div className="text-green-600 text-2xl font-bold">
                        You won {gameResult.winAmount.toFixed(2)} credits!
                      </div>
                      <div>Cashed out at {gameResult.cashoutMultiplier.toFixed(2)}x</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-red-600 text-2xl font-bold">
                        Crashed at {gameResult.crashPoint.toFixed(2)}x!
                      </div>
                      <div>You lost {gameResult.betAmount} credits</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <TrendingUp size={48} className="mb-2 text-primary"/>
                  <div className="text-xl font-semibold mb-2">Crash Game</div>
                  <div className="text-sm text-muted-foreground text-center max-w-md">
                    Place your bet and watch the multiplier increase. 
                    Cash out before it crashes to win!
                  </div>
                </div>
              )
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm">Bet Amount</label>
                  <span className="text-sm">{betAmount} credits</span>
                </div>
                <div className="flex gap-2">
                  <Input 
                    type="number"
                    value={betAmount}
                    onChange={(e) => handleBetChange(e.target.value)}
                    disabled={isPlaying}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setBetAmount(Math.max(0, betAmount / 2))}
                    disabled={isPlaying}
                  >
                    ½
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setBetAmount(betAmount * 2)}
                    disabled={isPlaying}
                  >
                    2×
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm">Auto Cashout At</label>
                  <span className="text-sm">{autoCashoutAt.toFixed(2)}×</span>
                </div>
                <div className="flex gap-2">
                  <Input 
                    type="number"
                    value={autoCashoutAt}
                    onChange={(e) => handleAutoCashoutChange(e.target.value)}
                    disabled={isPlaying}
                    step="0.1"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={startGame}
                disabled={isPlaying || balance < betAmount}
                className="w-full h-16 text-lg"
              >
                {isPlaying ? "Game in Progress" : "Start Game"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
