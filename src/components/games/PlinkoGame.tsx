
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { gameService } from "../../services/api";
import { GameType } from "../../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PlinkoAdvanced } from "./PlinkoAdvanced";

export const PlinkoGame = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState({
    enabled: false
  });

  useEffect(() => {
    const fetchGameConfig = async () => {
      try {
        const plinkoConfig = await gameService.getGameConfig(GameType.PLINKO);
        setConfig({
          enabled: plinkoConfig.enabled
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load game configuration");
      }
    };
    
    fetchGameConfig();
  }, []);

  if (!config.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plinko</CardTitle>
          <CardDescription>Advanced physics-based Plinko experience</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p>Plinko is currently unavailable. Please check back later.</p>
        </CardContent>
      </Card>
    );
  }

  return <PlinkoAdvanced />;
};
