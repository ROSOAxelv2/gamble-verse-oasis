
import { useState, useEffect } from "react";
import { VipLevel, VipStats } from "@/types";
import { vipService } from "@/services/vip";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Award, Crown, Gift, Star, Trophy } from "lucide-react";

export const VipStatus = () => {
  const [vipStats, setVipStats] = useState<VipStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingReward, setClaimingReward] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  
  useEffect(() => {
    const fetchVipStats = async () => {
      try {
        const stats = await vipService.getUserVipStats();
        setVipStats(stats);
        
        // Calculate progress here where we can properly await the promise
        if (stats) {
          calculateAndSetProgress(stats);
        }
      } catch (error) {
        console.error("Failed to fetch VIP stats:", error);
        toast.error("Could not load VIP information");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVipStats();
  }, []);
  
  const calculateAndSetProgress = async (stats: VipStats) => {
    const { level, lifetimeWagered, nextLevelAt } = stats;
    
    // If at max level, show 100%
    if (nextLevelAt === Infinity) {
      setProgressPercent(100);
      return;
    }
    
    try {
      const config = await vipService.getVipConfig();
      const currentLevelThreshold = config.levelThresholds[level];
      
      // Calculate percentage progress to next level
      const currentProgress = lifetimeWagered - currentLevelThreshold;
      const totalNeeded = nextLevelAt - currentLevelThreshold;
      
      const percent = Math.min(Math.floor((currentProgress / totalNeeded) * 100), 100);
      setProgressPercent(percent);
    } catch (error) {
      console.error("Failed to calculate progress:", error);
      setProgressPercent(0);
    }
  };
  
  const handleClaimDailyReward = async () => {
    if (!vipStats) return;
    
    setClaimingReward(true);
    try {
      const { success, reward } = await vipService.claimDailyReward();
      if (success) {
        toast.success(`You've claimed ${reward} credits as your daily VIP reward!`);
      }
    } catch (error) {
      console.error("Failed to claim reward:", error);
      toast.error("Could not claim your daily reward");
    } finally {
      setClaimingReward(false);
    }
  };
  
  const getVipLevelIcon = (level: VipLevel) => {
    switch (level) {
      case VipLevel.BRONZE:
        return <Trophy className="w-6 h-6 text-amber-700" />;
      case VipLevel.SILVER:
        return <Award className="w-6 h-6 text-gray-400" />;
      case VipLevel.GOLD:
        return <Star className="w-6 h-6 text-yellow-500" />;
      case VipLevel.PLATINUM:
        return <Crown className="w-6 h-6 text-blue-400" />;
      case VipLevel.DIAMOND:
        return <Crown className="w-6 h-6 text-blue-300" />;
    }
  };
  
  const getLevelColor = (level: VipLevel) => {
    switch (level) {
      case VipLevel.BRONZE: return "bg-amber-700";
      case VipLevel.SILVER: return "bg-gray-400";
      case VipLevel.GOLD: return "bg-yellow-500";
      case VipLevel.PLATINUM: return "bg-blue-400";
      case VipLevel.DIAMOND: return "bg-blue-300";
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="animate-pulse bg-gray-200 h-6 w-32 rounded"></CardTitle>
          <CardDescription className="animate-pulse bg-gray-200 h-4 w-48 rounded mt-2"></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse bg-gray-200 h-8 rounded mb-4"></div>
          <div className="animate-pulse bg-gray-200 h-20 rounded"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (!vipStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>VIP Program</CardTitle>
          <CardDescription>Could not load VIP information</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const { level, lifetimeWagered, currentPoints, nextLevelAt, badges } = vipStats;
  const nextLevel = vipService.getNextLevel(level);
  const benefits = vipService.getLevelBenefits(level);
  
  return (
    <Card>
      <CardHeader className={`${getLevelColor(level)} text-white`}>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              {getVipLevelIcon(level)}
              {level.charAt(0).toUpperCase() + level.slice(1)} Level
            </CardTitle>
            <CardDescription className="text-white/80">
              {nextLevel 
                ? `${(nextLevelAt - lifetimeWagered).toLocaleString()} more wagered to reach ${nextLevel}` 
                : "You've reached the highest VIP tier!"}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">{currentPoints.toLocaleString()}</div>
            <div className="text-white/80 text-sm">VIP Points</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress to next level</span>
            <span>{nextLevel ? `${progressPercent}%` : '100%'}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-muted p-3 rounded-lg text-center">
            <Gift className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-lg font-bold">{benefits.dailyFreeSpin}</div>
            <div className="text-sm text-muted-foreground">Daily Free Spins</div>
          </div>
          
          <div className="bg-muted p-3 rounded-lg text-center">
            <div className="text-lg font-bold">{benefits.cashbackPercent}%</div>
            <div className="text-sm text-muted-foreground">Cashback Rate</div>
          </div>
          
          <div className="bg-muted p-3 rounded-lg text-center">
            <div className="text-lg font-bold">{lifetimeWagered.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Lifetime Wagered</div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Your Badges</h3>
          <div className="flex flex-wrap gap-2">
            {badges.map(badge => (
              <Badge key={badge.id} variant="outline" className="px-2 py-1">
                {badge.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleClaimDailyReward}
          disabled={claimingReward}
          className="w-full"
        >
          {claimingReward ? "Claiming..." : "Claim Daily Rewards"}
        </Button>
      </CardFooter>
    </Card>
  );
};
