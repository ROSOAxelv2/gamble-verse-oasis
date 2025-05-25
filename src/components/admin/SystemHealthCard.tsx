
import { SystemHealth } from "../../types";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Activity, CheckCircle, AlertTriangle } from "lucide-react";

interface SystemHealthCardProps {
  systemHealth: SystemHealth | null;
}

export const SystemHealthCard = ({ systemHealth }: SystemHealthCardProps) => {
  if (!systemHealth) return null;

  return (
    <Card className="w-64">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4" />
          <span className="text-sm font-medium">System Status</span>
          {systemHealth.errorRate < 0.05 ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Error Rate: {(systemHealth.errorRate * 100).toFixed(2)}%
        </div>
      </CardContent>
    </Card>
  );
};
