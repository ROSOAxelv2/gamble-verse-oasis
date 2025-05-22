
import { useState, useEffect } from "react";
import { vipService } from "../../services/vip";
import { VipLevel, VipProgramConfig } from "../../types";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const VipConfigTab = () => {
  const [vipConfig, setVipConfig] = useState<VipProgramConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchVipConfig = async () => {
      try {
        const config = await vipService.getVipConfig();
        setVipConfig(config);
      } catch (error) {
        toast.error("Failed to load VIP configuration");
      } finally {
        setLoading(false);
      }
    };

    fetchVipConfig();
  }, []);

  const handleSaveConfig = async () => {
    if (!vipConfig) return;

    setSaving(true);
    try {
      const updatedConfig = await vipService.updateVipConfig(vipConfig);
      setVipConfig(updatedConfig);
      toast.success("VIP configuration updated successfully");
    } catch (error) {
      toast.error("Failed to update VIP configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleLevelThresholdChange = (level: VipLevel, value: string) => {
    if (!vipConfig) return;

    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) return;

    setVipConfig({
      ...vipConfig,
      levelThresholds: {
        ...vipConfig.levelThresholds,
        [level]: numValue
      }
    });
  };

  const handleBenefitChange = (level: VipLevel, benefit: keyof typeof vipConfig.levelBenefits[typeof level], value: any) => {
    if (!vipConfig) return;

    setVipConfig({
      ...vipConfig,
      levelBenefits: {
        ...vipConfig.levelBenefits,
        [level]: {
          ...vipConfig.levelBenefits[level],
          [benefit]: value
        }
      }
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="animate-pulse bg-gray-200 h-6 w-32 rounded"></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse bg-gray-200 h-48 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!vipConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>VIP Configuration</CardTitle>
          <CardDescription>Could not load VIP configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>VIP Program Configuration</CardTitle>
            <CardDescription>Configure VIP levels, thresholds, and benefits</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="vip-program-enabled">
              {vipConfig.enabled ? "Enabled" : "Disabled"}
            </Label>
            <Switch
              id="vip-program-enabled"
              checked={vipConfig.enabled}
              onCheckedChange={(enabled) => {
                setVipConfig({
                  ...vipConfig,
                  enabled
                });
              }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Level Thresholds (Lifetime Wagered)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(VipLevel).map((level) => (
                <div key={level} className="space-y-2">
                  <Label htmlFor={`threshold-${level}`} className="capitalize">{level}</Label>
                  <Input
                    id={`threshold-${level}`}
                    type="number"
                    value={vipConfig.levelThresholds[level]}
                    onChange={(e) => handleLevelThresholdChange(level, e.target.value)}
                    min={0}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Level Benefits</h3>
            
            {Object.values(VipLevel).map((level) => (
              <div key={level} className="mb-6 p-4 border rounded-lg">
                <h4 className="font-medium capitalize mb-3">{level} Level Benefits</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`dailySpins-${level}`}>Daily Free Spins</Label>
                    <Input
                      id={`dailySpins-${level}`}
                      type="number"
                      value={vipConfig.levelBenefits[level].dailyFreeSpin}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value >= 0) {
                          handleBenefitChange(level, 'dailyFreeSpin', value);
                        }
                      }}
                      min={0}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`cashback-${level}`}>Cashback Percentage</Label>
                    <Input
                      id={`cashback-${level}`}
                      type="number"
                      value={vipConfig.levelBenefits[level].cashbackPercent}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value) && value >= 0) {
                          handleBenefitChange(level, 'cashbackPercent', value);
                        }
                      }}
                      min={0}
                      step={0.1}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSaveConfig}
          disabled={saving}
          className="ml-auto"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
};
