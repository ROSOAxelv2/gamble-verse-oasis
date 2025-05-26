import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { DiceGame } from "../components/games/DiceGame";
import { PlinkoGame } from "../components/games/PlinkoGame";
import { SlotMachine } from "../components/games/SlotMachine";
import { PragmaticSlotMachine } from "../components/games/PragmaticSlotMachine";
import { SuperAceSlotMachine } from "../components/games/SuperAceSlotMachine";
import { SlotGameTheme } from "../types/slots";
import { CrashGame } from "../components/games/CrashGame";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GamesPage = () => {
  const [activeGame, setActiveGame] = useState("dice");
  const [activeSlotTheme, setActiveSlotTheme] = useState<SlotGameTheme>(SlotGameTheme.CLASSIC);
  const [activeSlotType, setActiveSlotType] = useState<"regular" | "pragmatic" | "super-ace">("regular");

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Games</h1>
        
        <Tabs defaultValue="dice" value={activeGame} onValueChange={setActiveGame} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="dice">Dice</TabsTrigger>
            <TabsTrigger value="plinko">Plinko</TabsTrigger>
            <TabsTrigger value="slots">Slots</TabsTrigger>
            <TabsTrigger value="crash">Crash</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dice" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <DiceGame />
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h2 className="text-xl font-bold mb-4">How to Play</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">1. Select a Number</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a number from 1 to 6 that you think the dice will land on.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">2. Place Your Bet</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter the amount of credits you want to wager.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">3. Roll the Dice</h3>
                  <p className="text-sm text-muted-foreground">
                    Click the "Roll the Dice" button to see if you win!
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">4. Win Big!</h3>
                  <p className="text-sm text-muted-foreground">
                    If the dice lands on your chosen number, you win 5x your bet amount!
                  </p>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-card rounded-lg border border-border">
                <h3 className="font-medium mb-2">Game Rules:</h3>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Minimum bet: 10 credits</li>
                  <li>• Maximum bet: 1,000 credits</li>
                  <li>• Payout: 5x your bet amount</li>
                  <li>• Win chance: 1 in 6 (16.7%)</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="plinko" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <PlinkoGame />
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h2 className="text-xl font-bold mb-4">How to Play Plinko</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">1. Place Your Bet</h3>
                  <p className="text-sm text-muted-foreground">
                    Select your bet amount using the slider.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">2. Drop the Ball</h3>
                  <p className="text-sm text-muted-foreground">
                    Click the "Drop Ball" button to drop the ball from the top of the board.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">3. Watch It Fall</h3>
                  <p className="text-sm text-muted-foreground">
                    The ball will bounce off pegs and fall into one of the buckets at the bottom.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">4. Collect Your Winnings</h3>
                  <p className="text-sm text-muted-foreground">
                    The bucket the ball lands in determines your payout multiplier!
                  </p>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-card rounded-lg border border-border">
                <h3 className="font-medium mb-2">Game Rules:</h3>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Minimum bet: 50 credits</li>
                  <li>• Maximum bet: 2,000 credits</li>
                  <li>• Payout varies by bucket (0x to 10x)</li>
                  <li>• Higher risk, higher reward!</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="slots" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {activeSlotType === "regular" ? (
                <SlotMachine gameTheme={activeSlotTheme} />
              ) : activeSlotType === "pragmatic" ? (
                <PragmaticSlotMachine />
              ) : (
                <SuperAceSlotMachine />
              )}
              
              <div className="mt-4 flex justify-center">
                <Tabs 
                  defaultValue="regular" 
                  value={activeSlotType} 
                  onValueChange={(v) => setActiveSlotType(v as "regular" | "pragmatic" | "super-ace")}
                >
                  <TabsList>
                    <TabsTrigger value="regular">Regular Slots</TabsTrigger>
                    <TabsTrigger value="pragmatic">Pragmatic Aztec</TabsTrigger>
                    <TabsTrigger value="super-ace">Super Ace</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {activeSlotType === "regular" && (
                <div className="mt-2 flex justify-center">
                  <Tabs 
                    defaultValue={activeSlotTheme} 
                    value={activeSlotTheme} 
                    onValueChange={(v) => setActiveSlotTheme(v as SlotGameTheme)}
                  >
                    <TabsList>
                      <TabsTrigger value={SlotGameTheme.CLASSIC}>Classic</TabsTrigger>
                      <TabsTrigger value={SlotGameTheme.TREASURE_OF_AZTEC}>Aztec</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h2 className="text-xl font-bold mb-4">How to Play Slots</h2>
              
              {activeSlotType === "super-ace" ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">1. Place Your Bet</h3>
                    <p className="text-sm text-muted-foreground">
                      Select your bet amount using the slider.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">2. Spin the Reels</h3>
                    <p className="text-sm text-muted-foreground">
                      Click the "Spin" button to start the game.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">3. Collect Aces</h3>
                    <p className="text-sm text-muted-foreground">
                      Collect Ace symbols to fill the meter. 3+ Aces give instant payouts!
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">4. Super Ace Mode</h3>
                    <p className="text-sm text-muted-foreground">
                      Land 4+ Aces to trigger Super Ace Mode with 3x multipliers and free spins!
                    </p>
                  </div>
                  
                  <div className="mt-8 p-4 bg-card rounded-lg border border-border">
                    <h3 className="font-medium mb-2">Game Rules:</h3>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Minimum bet: 100 credits</li>
                      <li>• Maximum bet: 5,000 credits</li>
                      <li>• RTP: 96.80%</li>
                      <li>• Volatility: Medium</li>
                      <li>• 5×3 grid with line wins</li>
                      <li>• Ace collection mechanics</li>
                      <li>• Super Ace bonus mode</li>
                    </ul>
                  </div>
                </div>
              ) : activeSlotType === "pragmatic" ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">1. Place Your Bet</h3>
                    <p className="text-sm text-muted-foreground">
                      Select your bet amount using the slider.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">2. Spin the Reels</h3>
                    <p className="text-sm text-muted-foreground">
                      Click the "Spin" button to start the reels.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">3. Adjacency Wins</h3>
                    <p className="text-sm text-muted-foreground">
                      Win by landing 4+ adjacent matching symbols in a row, starting from the left.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">4. Special Features</h3>
                    <p className="text-sm text-muted-foreground">
                      Collect wild symbols to fill the meter for multipliers. Land 4+ scatters to trigger free spins with giant symbols!
                    </p>
                  </div>
                  
                  <div className="mt-8 p-4 bg-card rounded-lg border border-border">
                    <h3 className="font-medium mb-2">Game Rules:</h3>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Minimum bet: 50 credits</li>
                      <li>• Maximum bet: 2,500 credits</li>
                      <li>• RTP: 96.71%</li>
                      <li>• Volatility: High</li>
                      <li>• 6×5 grid with adjacency wins</li>
                      <li>• Wild meter fills at 5 wilds</li>
                      <li>• Free spins with giant symbols</li>
                    </ul>
                  </div>
                </div>
              ) : activeSlotTheme === SlotGameTheme.TREASURE_OF_AZTEC ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">1. Place Your Bet</h3>
                    <p className="text-sm text-muted-foreground">
                      Select your bet amount using the slider.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">2. Spin the Reels</h3>
                    <p className="text-sm text-muted-foreground">
                      Click the "Spin" button to start the reels.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">3. Wild Collections</h3>
                    <p className="text-sm text-muted-foreground">
                      Collect wild symbols to fill the meter and trigger free spins!
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">4. Free Spins & Multipliers</h3>
                    <p className="text-sm text-muted-foreground">
                      During free spins, win multipliers increase with each wild collected.
                    </p>
                  </div>
                  
                  <div className="mt-8 p-4 bg-card rounded-lg border border-border">
                    <h3 className="font-medium mb-2">Game Rules:</h3>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Minimum bet: 25 credits</li>
                      <li>• Maximum bet: 1,500 credits</li>
                      <li>• RTP: 96.52%</li>
                      <li>• Volatility: High</li>
                      <li>• Trigger free spins with 3+ scatters or by filling the Wild meter</li>
                      <li>• Multipliers can increase up to 5x during free spins</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">1. Place Your Bet</h3>
                    <p className="text-sm text-muted-foreground">
                      Select your bet amount using the slider.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">2. Spin the Reels</h3>
                    <p className="text-sm text-muted-foreground">
                      Click the "Spin" button to start the reels.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">3. Match Symbols</h3>
                    <p className="text-sm text-muted-foreground">
                      Match symbols across paylines to win big!
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">4. Special Combinations</h3>
                    <p className="text-sm text-muted-foreground">
                      Look for special symbol combinations for the biggest payouts!
                    </p>
                  </div>
                  
                  <div className="mt-8 p-4 bg-card rounded-lg border border-border">
                    <h3 className="font-medium mb-2">Game Rules:</h3>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Minimum bet: 25 credits</li>
                      <li>• Maximum bet: 1,500 credits</li>
                      <li>• Multiple paylines available</li>
                      <li>• Payouts vary by symbol combinations</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="crash" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <CrashGame />
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h2 className="text-xl font-bold mb-4">How to Play Crash</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">1. Place Your Bet</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter the amount of credits you want to wager.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">2. Watch the Multiplier</h3>
                  <p className="text-sm text-muted-foreground">
                    When the game starts, watch as the multiplier increases.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">3. Cash Out in Time</h3>
                  <p className="text-sm text-muted-foreground">
                    Click the "Cash Out" button before the game crashes to secure your winnings.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">4. Set Auto-Cashout</h3>
                  <p className="text-sm text-muted-foreground">
                    For safer play, set an auto-cashout point to automatically collect your winnings.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-card rounded-lg border border-border">
                <h3 className="font-medium mb-2">Game Rules:</h3>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Minimum bet: 50 credits</li>
                  <li>• Maximum bet: 5,000 credits</li>
                  <li>• Crash point is random (1x to 10x)</li>
                  <li>• Higher multiplier = higher risk</li>
                  <li>• Auto-cashout feature available</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default GamesPage;
