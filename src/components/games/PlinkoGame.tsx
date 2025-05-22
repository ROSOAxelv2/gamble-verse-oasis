
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { gameService, userService } from "../../services/api";
import { GameType, PlinkoGameResult, TransactionType } from "../../types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

// Define constants at the top level for use throughout the component
const COLORS = {
  peg: "#9b87f5",
  path: "#e5deff",
  ball: "#f97316",
  bucket: {
    high: "#0ea5e9",
    medium: "#8b5cf6",
    low: "#d946ef"
  }
};

// Define pegRadius as a constant to be used throughout the component
const PEG_RADIUS = 5;

export const PlinkoGame = () => {
  const { user } = useAuth();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<PlinkoGameResult | null>(null);
  const [config, setConfig] = useState<{ minBet: number; maxBet: number; rows: number; enabled: boolean }>({
    minBet: 50,
    maxBet: 2000,
    rows: 8,
    enabled: false
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    const fetchGameConfig = async () => {
      try {
        const plinkoConfig = await gameService.getGameConfig(GameType.PLINKO);
        setConfig({
          minBet: plinkoConfig.minBet,
          maxBet: plinkoConfig.maxBet,
          rows: 8, // Default rows
          enabled: plinkoConfig.enabled
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load game configuration");
      }
    };
    
    fetchGameConfig();
  }, []);

  useEffect(() => {
    if (canvasRef.current && config) {
      drawBoard();
    }
  }, [canvasRef, config]);
  
  useEffect(() => {
    if (gameResult && canvasRef.current) {
      animateBall(gameResult.path);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameResult]);
  
  const handleBetAmountChange = (value: number[]) => {
    setBetAmount(value[0]);
  };
  
  const drawBoard = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rows = config.rows;
    const width = canvas.width;
    const height = canvas.height;
    const pegSpacing = width / (rows + 2);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw pegs
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col <= row; col++) {
        const x = width / 2 + (col - row / 2) * pegSpacing;
        const y = (row + 1) * pegSpacing;
        
        ctx.beginPath();
        ctx.arc(x, y, PEG_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = COLORS.peg;
        ctx.fill();
      }
    }
    
    // Draw buckets
    const bucketWidth = pegSpacing;
    const bucketCount = rows + 1;
    const bucketY = (rows + 1) * pegSpacing + PEG_RADIUS * 2;
    
    for (let i = 0; i < bucketCount; i++) {
      const x = (i * bucketWidth) + (width - bucketCount * bucketWidth) / 2;
      
      // Determine bucket color based on position
      let bucketColor;
      if (i < bucketCount / 3) {
        bucketColor = COLORS.bucket.low;
      } else if (i > bucketCount * 2 / 3) {
        bucketColor = COLORS.bucket.high;
      } else {
        bucketColor = COLORS.bucket.medium;
      }
      
      // Draw bucket
      ctx.beginPath();
      ctx.rect(x, bucketY, bucketWidth, PEG_RADIUS * 4);
      ctx.fillStyle = bucketColor;
      ctx.fill();
    }
  };
  
  const animateBall = (path: number[]) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rows = config.rows;
    const width = canvas.width;
    const pegSpacing = width / (rows + 2);
    const ballRadius = 6;
    
    let currentStep = 0;
    const startX = width / 2;
    const startY = 0;
    
    const animate = () => {
      // Clear ball trail
      drawBoard();
      
      if (currentStep < path.length) {
        const row = currentStep;
        const direction = path[currentStep]; // 0 = left, 1 = right
        const col = Math.floor(row / 2) + (direction ? 1 : 0);
        
        const x = width / 2 + (col - row / 2) * pegSpacing;
        const y = (row + 1) * pegSpacing;
        
        // Draw ball
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, 2 * Math.PI);
        ctx.fillStyle = COLORS.ball;
        ctx.fill();
        
        // Draw path to this point
        if (currentStep > 0) {
          const prevRow = currentStep - 1;
          const prevDirection = path[prevRow];
          const prevCol = Math.floor(prevRow / 2) + (prevDirection ? 1 : 0);
          
          const prevX = width / 2 + (prevCol - prevRow / 2) * pegSpacing;
          const prevY = (prevRow + 1) * pegSpacing;
          
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.strokeStyle = COLORS.path;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        
        currentStep++;
        animationRef.current = requestAnimationFrame(animate);
      }
      
      // Final position (bucket)
      if (currentStep === path.length) {
        const bucketWidth = pegSpacing;
        const bucketCount = rows + 1;
        const bucketY = (rows + 1) * pegSpacing + PEG_RADIUS * 4;
        const finalBucket = gameResult?.finalBucket || 0;
        const bucketX = ((finalBucket) * bucketWidth) + (width - bucketCount * bucketWidth) / 2 + bucketWidth / 2;
        
        // Draw ball in bucket
        ctx.beginPath();
        ctx.arc(bucketX, bucketY, ballRadius, 0, 2 * Math.PI);
        ctx.fillStyle = COLORS.ball;
        ctx.fill();
      }
    };
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = requestAnimationFrame(animate);
  };
  
  const playPlinko = async () => {
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
      const result = await gameService.playPlinkoGame(betAmount);
      setGameResult(result);
      
      // Update user balance
      await userService.getProfile();
      
      if (result.isWin) {
        toast.success(`You won ${result.winAmount} credits!`);
      } else {
        toast.error("Better luck next time!");
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
          <CardTitle>Plinko</CardTitle>
          <CardDescription>Drop the ball and win big!</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p>Plinko is currently unavailable. Please check back later.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Plinko</CardTitle>
        <CardDescription>Drop the ball and win big!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center mb-6">
          <canvas 
            ref={canvasRef} 
            width={320} 
            height={400} 
            className="border border-border rounded-lg"
          />
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between">
              <Label>Bet Amount: {betAmount}</Label>
              <span className="text-sm text-muted-foreground">
                Min: {config.minBet} | Max: {config.maxBet}
              </span>
            </div>
            <Slider
              value={[betAmount]}
              min={config.minBet}
              max={config.maxBet}
              step={10}
              onValueChange={handleBetAmountChange}
              disabled={loading}
            />
          </div>
          
          {gameResult && (
            <div className="p-3 rounded-md border border-border">
              <div className="flex justify-between items-center">
                <span>Result:</span>
                <span className={gameResult.isWin ? "font-bold text-green-500" : "font-bold text-red-500"}>
                  {gameResult.isWin ? `Won ${gameResult.winAmount}` : "Lost"}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={playPlinko} 
          disabled={loading || !user} 
          className="w-full"
        >
          {loading ? "Dropping Ball..." : "Drop Ball"}
        </Button>
      </CardFooter>
    </Card>
  );
};

