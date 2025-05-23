
import React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { SlotGameResult } from "../../../types";
import { SlotGameTheme } from "../../../types/slots";
import { Button } from "@/components/ui/button";

interface BetControlsProps {
  betAmount: number;
  onBetChange: (value: number[]) => void;
  minBet: number;
  maxBet: number;
  gameTheme: SlotGameTheme;
  gameResult: SlotGameResult | null;
  onSpin: () => void;
  isSpinning: boolean;
  isDisabled: boolean;
  isBonus: boolean;
  freeSpins: number;
}

export const BetControls: React.FC<BetControlsProps> = ({
  betAmount,
  onBetChange,
  minBet,
  maxBet,
  gameTheme,
  gameResult,
  onSpin,
  isSpinning,
  isDisabled,
  isBonus,
  freeSpins,
}) => {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex justify-between">
          <Label className={gameTheme === SlotGameTheme.TREASURE_OF_AZTEC ? "text-amber-200" : ""}>
            Bet Amount: {betAmount}
          </Label>
          <span className={`text-sm ${gameTheme === SlotGameTheme.TREASURE_OF_AZTEC ? "text-amber-300" : "text-muted-foreground"}`}>
            Min: {minBet} | Max: {maxBet}
          </span>
        </div>
        <Slider
          value={[betAmount]}
          min={minBet}
          max={maxBet}
          step={25}
          onValueChange={onBetChange}
          disabled={isSpinning || isDisabled}
          className={gameTheme === SlotGameTheme.TREASURE_OF_AZTEC ? "bg-amber-800" : ""}
        />
      </div>
      
      {gameResult && (
        <div className={`p-3 rounded-md border ${
          gameTheme === SlotGameTheme.TREASURE_OF_AZTEC 
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
      
      <Button 
        onClick={onSpin} 
        disabled={isSpinning || isDisabled} 
        className={`w-full ${
          gameTheme === SlotGameTheme.TREASURE_OF_AZTEC 
            ? 'bg-yellow-600 hover:bg-yellow-700' 
            : 'bg-yellow-600 hover:bg-yellow-700'
        } ${isBonus ? 'animate-pulse' : ''}`}
      >
        {isSpinning ? "Spinning..." : isBonus ? `Free Spin (${freeSpins})` : "Spin"}
      </Button>
    </div>
  );
};
