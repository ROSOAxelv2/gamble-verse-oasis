
import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { DiceGame } from "../components/games/DiceGame";
import { PlinkoGame } from "../components/games/PlinkoGame";
import { SlotMachine } from "../components/games/SlotMachine";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GamesPage = () => {
  const [activeGame, setActiveGame] = useState("dice");

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Games</h1>
        
        <Tabs defaultValue="dice" value={activeGame} onValueChange={setActiveGame} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="dice">Dice</TabsTrigger>
            <TabsTrigger value="plinko">Plinko</TabsTrigger>
            <TabsTrigger value="slots">Slots</TabsTrigger>
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
              <SlotMachine />
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h2 className="text-xl font-bold mb-4">How to Play Slots</h2>
              
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
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default GamesPage;
