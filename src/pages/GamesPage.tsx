
import { Layout } from "../components/layout/Layout";
import { DiceGame } from "../components/games/DiceGame";

const GamesPage = () => {
  return (
    <Layout requireAuth>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Games</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
        </div>
        
        <div className="mt-8 text-center text-muted-foreground">
          <p>More games coming soon! Stay tuned for Plinko and Slot Machine in Phase 2.</p>
        </div>
      </div>
    </Layout>
  );
};

export default GamesPage;
