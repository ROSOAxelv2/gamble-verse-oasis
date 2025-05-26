
import { useState } from "react";
import { GameConfig, GameType, User } from "../../types";
import { adminService } from "../../services/api";
import { rbacService } from "../../services/rbac";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings } from "lucide-react";

interface GameConfigSectionProps {
  gameConfigs: GameConfig[];
  setGameConfigs: React.Dispatch<React.SetStateAction<GameConfig[]>>;
  loading: boolean;
  user: User | null;
}

export const GameConfigSection = ({ 
  gameConfigs, 
  setGameConfigs, 
  loading, 
  user 
}: GameConfigSectionProps) => {
  const getGameDisplayName = (gameType: GameType): string => {
    switch (gameType) {
      case GameType.TREASURE_OF_AZTEC:
        return "Treasures of Aztec (PG Soft)";
      case GameType.DICE:
        return "Dice Game";
      case GameType.PLINKO:
        return "Plinko";
      case GameType.SLOTS:
        return "Classic Slots";
      case GameType.CRASH:
        return "Crash Game";
      default:
        return String(gameType).charAt(0).toUpperCase() + String(gameType).slice(1);
    }
  };

  const updateGameConfig = async (config: GameConfig) => {
    if (!rbacService.canManageGameConfigs(user)) {
      toast.error("Insufficient permissions");
      return;
    }

    try {
      console.log('Updating game config:', config);
      await adminService.updateGameConfig(config);
      toast.success(`${config.gameType} configuration updated`);
      
      setGameConfigs(prevConfigs =>
        prevConfigs.map(c => (c.id === config.id ? config : c))
      );
    } catch (error) {
      console.error('Failed to update game configuration:', error);
      toast.error("Failed to update game configuration");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Game Configurations</span>
        </CardTitle>
        <CardDescription>
          Manage game settings, betting limits, and enable/disable games
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading configurations...</div>
        ) : (
          <div className="space-y-6">
            {gameConfigs.map(config => (
              <Card key={config.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="capitalize">{getGameDisplayName(config.gameType)}</CardTitle>
                      {config.gameType === GameType.TREASURE_OF_AZTEC && (
                        <CardDescription className="text-xs mt-1">
                          Source: <a href="https://www.slotstemple.com/us/free-slots/treasures-of-aztec/" 
                                   target="_blank" rel="noopener noreferrer" 
                                   className="text-blue-500 hover:underline">
                            PG Soft Official Rules
                          </a>
                          <br />
                          RTP: 96.71% | Volatility: High | Max Win: 5000x
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`enable-${config.id}`}>
                        {config.enabled ? "Enabled" : "Disabled"}
                      </Label>
                      <Switch
                        id={`enable-${config.id}`}
                        checked={config.enabled}
                        onCheckedChange={(checked) => {
                          const updatedConfig = { ...config, enabled: checked };
                          updateGameConfig(updatedConfig);
                        }}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`minBet-${config.id}`}>Minimum Bet</Label>
                      <Input
                        id={`minBet-${config.id}`}
                        type="number"
                        value={config.minBet}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 0) {
                            const updatedConfig = { ...config, minBet: value };
                            setGameConfigs(prevConfigs =>
                              prevConfigs.map(c => (c.id === config.id ? updatedConfig : c))
                            );
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`maxBet-${config.id}`}>Maximum Bet</Label>
                      <Input
                        id={`maxBet-${config.id}`}
                        type="number"
                        value={config.maxBet}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 0) {
                            const updatedConfig = { ...config, maxBet: value };
                            setGameConfigs(prevConfigs =>
                              prevConfigs.map(c => (c.id === config.id ? updatedConfig : c))
                            );
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`payout-${config.id}`}>
                        {config.gameType === GameType.TREASURE_OF_AZTEC ? "Max Win (x)" : "Payout Multiplier"}
                      </Label>
                      <Input
                        id={`payout-${config.id}`}
                        type="number"
                        value={config.payoutMultiplier}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value) && value >= 0) {
                            const updatedConfig = { ...config, payoutMultiplier: value };
                            setGameConfigs(prevConfigs =>
                              prevConfigs.map(c => (c.id === config.id ? updatedConfig : c))
                            );
                          }
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => updateGameConfig(config)}>
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
