
import { useState } from "react";
import { gameService } from "../../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameType, DiceGameResult } from "../../types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

export const DiceGame = () => {
  const { user } = useAuth();
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState<string>("50");
  const [result, setResult] = useState<DiceGameResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const diceNumbers = [1, 2, 3, 4, 5, 6];

  const handleNumberSelect = (num: number) => {
    setSelectedNumber(num);
    setResult(null);
    setShowResult(false);
  };

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setBetAmount(value);
    }
  };

  const handleRoll = async () => {
    if (!selectedNumber || !betAmount) {
      toast.error("Please select a number and enter a bet amount");
      return;
    }

    const betValue = parseInt(betAmount);
    if (isNaN(betValue) || betValue <= 0) {
      toast.error("Please enter a valid bet amount");
      return;
    }

    try {
      setIsRolling(true);
      setShowResult(false);
      
      // Animate the dice rolling
      setTimeout(async () => {
        try {
          const result = await gameService.playDiceGame(selectedNumber, betValue);
          setResult(result);
          setShowResult(true);
          
          if (result.isWin) {
            toast.success(`You won ${result.winAmount} credits!`);
          } else {
            toast.error("Better luck next time!");
          }
        } catch (error) {
          toast.error((error as Error).message);
        } finally {
          setIsRolling(false);
        }
      }, 1500);
    } catch (error) {
      toast.error((error as Error).message);
      setIsRolling(false);
    }
  };

  return (
    <Card className="game-card max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Dice Game</CardTitle>
        <CardDescription>
          Pick a number, place your bet, and roll the dice!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Select Your Number:</h3>
          <div className="grid grid-cols-3 gap-3">
            {diceNumbers.map((num) => (
              <Button
                key={num}
                variant={selectedNumber === num ? "default" : "outline"}
                className={`dice ${selectedNumber === num ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => handleNumberSelect(num)}
                disabled={isRolling}
              >
                {num}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Your Bet:</h3>
          <div className="flex space-x-2">
            <Input
              type="text"
              value={betAmount}
              onChange={handleBetAmountChange}
              placeholder="Enter amount"
              disabled={isRolling}
              className="text-right"
            />
            <Button
              variant="outline"
              onClick={() => setBetAmount("50")}
              disabled={isRolling}
            >
              Min
            </Button>
            <Button
              variant="outline"
              onClick={() => setBetAmount("100")}
              disabled={isRolling}
            >
              +100
            </Button>
            <Button
              variant="outline"
              onClick={() => setBetAmount(user?.balance?.toString() || "0")}
              disabled={isRolling}
            >
              Max
            </Button>
          </div>
        </div>

        {showResult && result && (
          <div className="p-4 rounded-lg bg-muted text-center">
            <h3 className="text-lg font-semibold mb-2">
              {result.isWin ? "You Won!" : "You Lost!"}
            </h3>
            <div className="text-5xl mb-2 font-bold">{result.actualNumber}</div>
            <p>
              {result.isWin
                ? `You bet ${result.betAmount} and won ${result.winAmount}!`
                : `Better luck next time! The dice showed ${result.actualNumber}`}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleRoll}
          disabled={isRolling || selectedNumber === null || !betAmount}
          className="w-full bg-gradient-to-r from-casino-purple to-casino-blue hover:opacity-90"
        >
          {isRolling ? (
            <span className="animate-dice-roll inline-block">Rolling...</span>
          ) : (
            "Roll the Dice"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
