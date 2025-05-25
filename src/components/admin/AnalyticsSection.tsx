
import { User } from "../../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface AnalyticsSectionProps {
  users: User[];
}

export const AnalyticsSection = ({ users }: AnalyticsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Casino Analytics</span>
        </CardTitle>
        <CardDescription>
          View performance metrics and statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Wagers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156,780</div>
              <p className="text-sm text-muted-foreground">+12% from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">House Edge</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2%</div>
              <p className="text-sm text-muted-foreground">+0.3% from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Active Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-sm text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <h3 className="font-medium mb-4">Game Popularity</h3>
          <div className="bg-muted p-4 rounded-lg flex items-end h-60 space-x-4">
            <div className="flex flex-col items-center flex-1">
              <div className="bg-primary w-full" style={{ height: '80%' }}></div>
              <div className="mt-2 text-sm">Dice</div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className="bg-primary w-full opacity-70" style={{ height: '60%' }}></div>
              <div className="mt-2 text-sm">Aztec</div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className="bg-primary w-full opacity-70" style={{ height: '10%' }}></div>
              <div className="mt-2 text-sm">Plinko</div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className="bg-primary w-full opacity-70" style={{ height: '5%' }}></div>
              <div className="mt-2 text-sm">Slots</div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className="bg-primary w-full opacity-70" style={{ height: '40%' }}></div>
              <div className="mt-2 text-sm">Crash</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
