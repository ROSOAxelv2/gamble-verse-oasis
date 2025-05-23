
import React from "react";
import { SlotGameTheme, SlotMachineProps } from "../../types/slots";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SlotReels } from "./slots/SlotReels";
import { AztecFeatures } from "./slots/AztecFeatures";
import { BetControls } from "./slots/BetControls";
import { useSlotMachine } from "../../hooks/useSlotMachine";
import { useAuth } from "../../contexts/AuthContext";

export const SlotMachine = ({ gameTheme = SlotGameTheme.CLASSIC }: SlotMachineProps) => {
  const { user } = useAuth();
  const {
    betAmount,
    loading,
    spinning,
    gameResult,
    activeGame,
    visibleReels,
    config,
    wildCollection,
    maxWildCollection,
    freeSpins,
    multiplier,
    isBonus,
    handleBetAmountChange,
    setActiveGame,
    playSlots
  } = useSlotMachine(gameTheme);

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
          <AztecFeatures 
            wildCollection={wildCollection}
            maxWildCollection={maxWildCollection}
            multiplier={multiplier}
            isBonus={isBonus}
            freeSpins={freeSpins}
          />
        )}
        
        <SlotReels 
          reels={visibleReels} 
          gameTheme={activeGame} 
        />
        
        <BetControls
          betAmount={betAmount}
          onBetChange={handleBetAmountChange}
          minBet={config.minBet}
          maxBet={config.maxBet}
          gameTheme={activeGame}
          gameResult={gameResult}
          onSpin={playSlots}
          isSpinning={spinning}
          isDisabled={loading || !user}
          isBonus={isBonus}
          freeSpins={freeSpins}
        />
      </CardContent>
      <CardFooter>
        {/* Footer content if needed */}
      </CardFooter>
    </Card>
  );
};
