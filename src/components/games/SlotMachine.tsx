
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { gameService, userService } from "../../services/api";
import { GameType, SlotGameResult, TransactionType } from "../../types";
import { SlotGameTheme, SlotMachineProps } from "../../types/slots";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Slot machine symbols for classic theme
const CLASSIC_SYMBOLS = {
  CHERRY: "🍒",
  LEMON: "🍋",
  ORANGE: "🍊",
  PLUM: "🍇",
  BELL: "🔔",
  BAR: "7️⃣",
  SEVEN: "💰",
};

// Treasure of Aztec symbols
const AZTEC_SYMBOLS = {
  LOW_A: "🔹", // Low value symbols
  LOW_B: "🔸",
  LOW_C: "🟡",
  LOW_D: "🟢",
  HIGH_A: "🐆", // High value symbols
  HIGH_B: "🦅",
  HIGH_C: "🐍",
  HIGH_D: "🌋",
  WILD: "⭐", // Special symbols
  SCATTER: "🌞",
  BONUS: "🏆",
};

export const SlotMachine = ({ gameTheme = SlotGameTheme.CLASSIC }: SlotMachineProps) => {
  const { user } = useAuth();
  const [betAmount, setBetAmount] = useState<number>(25);
  const [loading, setLoading] = useState<boolean>(false);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<SlotGameResult | null>(null);
  const [activeGame, setActiveGame] = useState<SlotGameTheme>(gameTheme);
  const [visibleReels, setVisibleReels] = useState<string[][]>([
    [CLASSIC_SYMBOLS.CHERRY, CLASSIC_SYMBOLS.CHERRY, CLASSIC_SYMBOLS.CHERRY],
    [CLASSIC_SYMBOLS.LEMON, CLASSIC_SYMBOLS.LEMON, CLASSIC_SYMBOLS.LEMON],
    [CLASSIC_SYMBOLS.ORANGE, CLASSIC_SYMBOLS.ORANGE, CLASSIC_SYMBOLS.ORANGE],
  ]);
  const [config, setConfig] = useState<{ minBet: number; maxBet: number; enabled: boolean }>({
    minBet: 25,
    maxBet: 1500,
    enabled: false
  });
  
  // New state for Aztec game features
  const [wildCollection, setWildCollection] = useState<number>(0);
  const [maxWildCollection, setMaxWildCollection] = useState<number>(10);
  const [freeSpins, setFreeSpins] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [isBonus, setIsBonus] = useState<boolean>(false);
  
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

  useEffect(() => {
    // Reset or initialize game specific state when game changes
    if (activeGame === SlotGameTheme.TREASURE_OF_AZTEC) {
      setVisibleReels([
        [AZTEC_SYMBOLS.LOW_A, AZTEC_SYMBOLS.LOW_B, AZTEC_SYMBOLS.LOW_C],
        [AZTEC_SYMBOLS.HIGH_A, AZTEC_SYMBOLS.WILD, AZTEC_SYMBOLS.HIGH_B],
        [AZTEC_SYMBOLS.LOW_D, AZTEC_SYMBOLS.SCATTER, AZTEC_SYMBOLS.HIGH_C],
      ]);
    } else {
      // Reset to classic layout
      setVisibleReels([
        [CLASSIC_SYMBOLS.CHERRY, CLASSIC_SYMBOLS.CHERRY, CLASSIC_SYMBOLS.CHERRY],
        [CLASSIC_SYMBOLS.LEMON, CLASSIC_SYMBOLS.LEMON, CLASSIC_SYMBOLS.LEMON],
        [CLASSIC_SYMBOLS.ORANGE, CLASSIC_SYMBOLS.ORANGE, CLASSIC_SYMBOLS.ORANGE],
      ]);
    }
    
    // Reset bonus states
    setWildCollection(0);
    setFreeSpins(0);
    setMultiplier(1);
    setIsBonus(false);
  }, [activeGame]);
  
  const handleBetAmountChange = (value: number[]) => {
    setBetAmount(value[0]);
  };
  
  const getSymbolsForActiveGame = () => {
    switch (activeGame) {
      case SlotGameTheme.TREASURE_OF_AZTEC:
        return AZTEC_SYMBOLS;
      case SlotGameTheme.WILD_BOUNTY_SHOWDOWN:
        // Placeholder for future game
        return CLASSIC_SYMBOLS;
      default:
        return CLASSIC_SYMBOLS;
    }
  };
  
  const animateReels = (finalState: string[][]) => {
    setSpinning(true);
    
    const symbols = getSymbolsForActiveGame();
    const symbolKeys = Object.keys(symbols);
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
                const symbol = symbols[symbolKeys[randomIndex] as keyof typeof symbols];
                tempReels[i][j] = symbol;
              }
            } else {
              const randomIndex = Math.floor(Math.random() * symbolKeys.length);
              const symbol = symbols[symbolKeys[randomIndex] as keyof typeof symbols];
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
        
        // Process special symbols for Aztec game
        if (activeGame === SlotGameTheme.TREASURE_OF_AZTEC) {
          processAztecSymbols(finalState);
        }
      }
    };
    
    requestAnimationFrame(spin);
  };
  
  const processAztecSymbols = (reels: string[][]) => {
    // Count wilds and scatters
    let wildCount = 0;
    let scatterCount = 0;
    
    for (let i = 0; i < reels.length; i++) {
      for (let j = 0; j < reels[i].length; j++) {
        if (reels[i][j] === AZTEC_SYMBOLS.WILD) {
          wildCount++;
        }
        if (reels[i][j] === AZTEC_SYMBOLS.SCATTER) {
          scatterCount++;
        }
      }
    }
    
    // Collect wilds for the meter
    if (wildCount > 0) {
      setWildCollection(prev => {
        const newValue = Math.min(prev + wildCount, maxWildCollection);
        
        // If meter is full, trigger free spins
        if (newValue >= maxWildCollection && !isBonus) {
          triggerFreeSpins();
        }
        
        return newValue;
      });
      
      // Increase multiplier based on wilds
      setMultiplier(prev => Math.min(prev + (wildCount * 0.5), 5));
    }
    
    // Trigger free spins with 3+ scatters
    if (scatterCount >= 3 && !isBonus) {
      triggerFreeSpins();
    }
  };
  
  const triggerFreeSpins = () => {
    setIsBonus(true);
    setFreeSpins(7);
    toast.success("🌟 FREE SPINS TRIGGERED! 🌟");
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
      
      // Use free spin if available, otherwise place a bet
      if (freeSpins > 0 && isBonus) {
        setFreeSpins(prev => prev - 1);
      } else {
        // Regular spin - place bet
        await userService.updateBalance(betAmount, TransactionType.BET, GameType.SLOTS);
      }
      
      // Get result from backend
      const result = await gameService.playSlotsGame(betAmount);
      
      // Animate spinning reels
      animateReels(result.reels);
      
      // Apply multiplier for Aztec game if in bonus mode
      if (activeGame === SlotGameTheme.TREASURE_OF_AZTEC && isBonus && result.isWin) {
        result.winAmount *= multiplier;
      }
      
      setGameResult(result);
      
      // Add win to balance if there's a win
      if (result.isWin) {
        await userService.updateBalance(result.winAmount, TransactionType.WIN, GameType.SLOTS);
        toast.success(`You won ${result.winAmount} credits!`);
      } else {
        toast.error("Better luck next time!");
      }
      
      // Check if free spins ended
      if (freeSpins === 1 && isBonus) {
        setIsBonus(false);
        setMultiplier(1);
        toast.info("Free spins round ended");
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
    <Card className={activeGame === SlotGameTheme.TREASURE_OF_AZTEC ? "bg-gradient-to-b from-amber-950 to-amber-900 text-amber-100" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{activeGame === SlotGameTheme.TREASURE_OF_AZTEC ? "Treasure of Aztec" : "Classic Slots"}</CardTitle>
            <CardDescription className={activeGame === SlotGameTheme.TREASURE_OF_AZTEC ? "text-amber-200" : ""}>
              Spin to win the jackpot!
            </CardDescription>
          </div>
          
          <Tabs defaultValue={activeGame} onValueChange={(v) => setActiveGame(v as SlotGameTheme)} className="w-[200px]">
            <TabsList>
              <TabsTrigger value={SlotGameTheme.CLASSIC}>Classic</TabsTrigger>
              <TabsTrigger value={SlotGameTheme.TREASURE_OF_AZTEC}>Aztec</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {activeGame === SlotGameTheme.TREASURE_OF_AZTEC && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-amber-800 p-2 rounded-md">
              <div className="text-xs text-amber-200 uppercase font-bold mb-1">Wild Collection</div>
              <div className="w-full bg-amber-950 rounded-full h-2.5">
                <div 
                  className="bg-yellow-400 h-2.5 rounded-full" 
                  style={{ width: `${(wildCollection / maxWildCollection) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs mt-1 text-center">{wildCollection}/{maxWildCollection}</div>
            </div>
            
            <div className="bg-amber-800 p-2 rounded-md">
              <div className="text-xs text-amber-200 uppercase font-bold mb-1">Multiplier</div>
              <div className="text-center text-lg font-bold text-yellow-400">{multiplier}x</div>
            </div>
            
            {isBonus && (
              <div className="col-span-2 bg-yellow-600 p-2 rounded-md">
                <div className="text-xs text-white uppercase font-bold mb-1">Free Spins</div>
                <div className="text-center text-lg font-bold text-white">{freeSpins} remaining</div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-center">
          <div className={`p-4 rounded-lg border-4 ${activeGame === SlotGameTheme.TREASURE_OF_AZTEC ? 'bg-amber-950 border-yellow-600' : 'bg-black border-yellow-500'}`}>
            <div className="grid grid-cols-3 gap-2 text-center">
              {visibleReels.map((reel, reelIndex) => (
                <div key={`reel-${reelIndex}`} className="flex flex-col">
                  {reel.map((symbol, symbolIndex) => (
                    <div 
                      key={`symbol-${reelIndex}-${symbolIndex}`} 
                      className={`flex items-center justify-center ${
                        activeGame === SlotGameTheme.TREASURE_OF_AZTEC 
                          ? 'bg-amber-100 text-amber-950' 
                          : 'bg-white text-black'
                      } w-16 h-16 text-3xl rounded-md`}
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
              <Label className={activeGame === SlotGameTheme.TREASURE_OF_AZTEC ? "text-amber-200" : ""}>
                Bet Amount: {betAmount}
              </Label>
              <span className={`text-sm ${activeGame === SlotGameTheme.TREASURE_OF_AZTEC ? "text-amber-300" : "text-muted-foreground"}`}>
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
              className={activeGame === SlotGameTheme.TREASURE_OF_AZTEC ? "bg-amber-800" : ""}
            />
          </div>
          
          {gameResult && (
            <div className={`p-3 rounded-md border ${
              activeGame === SlotGameTheme.TREASURE_OF_AZTEC 
                ? 'border-amber-600 bg-amber-900/50' 
                : 'border-border'
            }`}>
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
          className={`w-full ${
            activeGame === SlotGameTheme.TREASURE_OF_AZTEC 
              ? 'bg-yellow-600 hover:bg-yellow-700' 
              : 'bg-yellow-600 hover:bg-yellow-700'
          } ${isBonus ? 'animate-pulse' : ''}`}
        >
          {loading || spinning ? "Spinning..." : isBonus ? `Free Spin (${freeSpins})` : "Spin"}
        </Button>
      </CardFooter>
    </Card>
  );
};
