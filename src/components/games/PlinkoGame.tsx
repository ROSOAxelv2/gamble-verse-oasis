
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { gameService } from "../../services/api";
import { GameType } from "../../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EnhancedPlinkoGame } from "./EnhancedPlinkoGame";

export const PlinkoGame = () => {
  const { user } = useAuth();
  const [useEnhanced, setUseEnhanced] = useState(false);
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
          <CardDescription>Drop the ball and win big!</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p>Plinko is currently unavailable. Please check back later.</p>
        </CardContent>
      </Card>
    );
  }

  if (useEnhanced) {
    return <EnhancedPlinkoGame />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plinko - Choose Your Experience</CardTitle>
        <CardDescription>Select between classic or enhanced physics-based Plinko</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Classic Plinko</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Simple, fast-paced Plinko with instant results
            </p>
            <Button onClick={() => setUseEnhanced(false)} variant="outline" className="w-full">
              Play Classic
            </Button>
          </Card>

          <Card className="p-4 border-primary">
            <h3 className="font-semibold mb-2">Enhanced Plinko ⭐</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Realistic physics, multi-ball drops, and professional gameplay
            </p>
            <Button onClick={() => setUseEnhanced(true)} className="w-full">
              Play Enhanced
            </Button>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Enhanced mode features realistic ball physics, multiple simultaneous drops, and detailed result tracking.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
