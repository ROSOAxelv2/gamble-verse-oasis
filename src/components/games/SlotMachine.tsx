
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { gameService, userService } from "../../services/api";
import { GameType, SlotGameResult, TransactionType } from "../../types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

// Slot machine symbols
const SYMBOLS = {
  CHERRY: "🍒",
  LEMON: "🍋",
  ORANGE: "🍊",
  PLUM: "🍇",
  BELL: "🔔",
  BAR: "7️⃣",
  SEVEN: "💰",
};

export const SlotMachine = () => {
  const { user } = useAuth();
  const [betAmount, setBetAmount] = useState<number>(25);
  const [loading, setLoading] = useState<boolean>(false);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<SlotGameResult | null>(null);
  const [visibleReels, setVisibleReels] = useState<string[][]>([
    [SYMBOLS.CHERRY, SYMBOLS.CHERRY, SYMBOLS.CHERRY],
    [SYMBOLS.LEMON, SYMBOLS.LEMON, SYMBOLS.LEMON],
    [SYMBOLS.ORANGE, SYMBOLS.ORANGE, SYMBOLS.ORANGE],
  ]);
  const [config, setConfig] = useState<{ minBet: number; maxBet: number; enabled: boolean }>({
    minBet: 25,
    maxBet: 1500,
    enabled: false
  });
  
  useEffect(() => {
    const fetchGameConfig = async () => {
      try {
        const slotsConfig = await gameService.getGameConfig(GameType.SLOTS);
        setConfig({
          minBet: slotsConfig.minBet,
          maxBet: slotsConfig.maxBet,
          enabled: slotsConfig.enabled
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load game configuration");
      }
    };
    
    fetchGameConfig();
  }, []);
  
  const handleBetAmountChange = (value: number[]) => {
    setBetAmount(value[0]);
  };
  
  const animateReels = (finalState: string[][]) => {
    setSpinning(true);
    
    const symbolKeys = Object.keys(SYMBOLS);
    const totalFrames = 30;
    let frame = 0;
    
    const spin = () => {
      if (frame < totalFrames) {
        const tempReels: string[][] = [[], [], []];
        
        // Generate random symbols for each reel
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            // Gradually slow down and converge to final state
            if (frame > totalFrames - 10 && i < finalState.length && j < finalState[i].length) {
              if (frame > totalFrames - 5 - i * 2) {
                tempReels[i][j] = finalState[i][j];
              } else {
                const randomIndex = Math.floor(Math.random() * symbolKeys.length);
                const symbol = SYMBOLS[symbolKeys[randomIndex] as keyof typeof SYMBOLS];
                tempReels[i][j] = symbol;
              }
            } else {
              const randomIndex = Math.floor(Math.random() * symbolKeys.length);
              const symbol = SYMBOLS[symbolKeys[randomIndex] as keyof typeof SYMBOLS];
              tempReels[i][j] = symbol;
            }
          }
        }
        
        setVisibleReels(tempReels);
        frame++;
        requestAnimationFrame(spin);
      } else {
        setVisibleReels(finalState);
        setSpinning(false);
      }
    };
    
    requestAnimationFrame(spin);
  };
  
  const playSlots = async () => {
    if (!user) {
      toast.error("You must be logged in to play");
      return;
    }
    
    if (betAmount < config.minBet || betAmount > config.maxBet) {
      toast.error(`Bet must be between ${config.minBet} and ${config.maxBet}`);
      return;
    }
    
    try {
      setLoading(true);
      const result = await gameService.playSlotsGame(betAmount);
      
      // Animate spinning reels
      animateReels(result.reels);
      
      setGameResult(result);
      
      // Update user balance
      await userService.getProfile();
      
      if (result.isWin) {
        toast.success(`You won ${result.winAmount} credits!`);
      } else {
        toast.error("Better luck next time!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to play: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!config.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Slot Machine</CardTitle>
          <CardDescription>Spin to win the jackpot!</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p>Slot Machine is currently unavailable. Please check back later.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Slot Machine</CardTitle>
        <CardDescription>Spin to win the jackpot!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="bg-black p-4 rounded-lg border-4 border-yellow-500">
            <div className="grid grid-cols-3 gap-2 text-center">
              {visibleReels.map((reel, reelIndex) => (
                <div key={`reel-${reelIndex}`} className="flex flex-col">
                  {reel.map((symbol, symbolIndex) => (
                    <div 
                      key={`symbol-${reelIndex}-${symbolIndex}`} 
                      className="flex items-center justify-center bg-white text-black w-16 h-16 text-3xl rounded-md"
                    >
                      {symbol}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between">
              <Label>Bet Amount: {betAmount}</Label>
              <span className="text-sm text-muted-foreground">
                Min: {config.minBet} | Max: {config.maxBet}
              </span>
            </div>
            <Slider
              value={[betAmount]}
              min={config.minBet}
              max={config.maxBet}
              step={25}
              onValueChange={handleBetAmountChange}
              disabled={loading || spinning}
            />
          </div>
          
          {gameResult && (
            <div className="p-3 rounded-md border border-border">
              <div className="flex justify-between items-center">
                <span>Result:</span>
                <span className={gameResult.isWin ? "font-bold text-green-500" : "font-bold text-red-500"}>
                  {gameResult.isWin ? `Won ${gameResult.winAmount}` : "Lost"}
                </span>
              </div>
              {gameResult.isWin && gameResult.paylines && (
                <div className="text-sm mt-1">
                  <span>Winning lines: {gameResult.paylines.join(", ")}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={playSlots} 
          disabled={loading || spinning || !user} 
          className="w-full bg-yellow-600 hover:bg-yellow-700"
        >
          {loading || spinning ? "Spinning..." : "Spin"}
        </Button>
      </CardFooter>
    </Card>
  );
};
