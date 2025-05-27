
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlinkoResult } from '@/utils/plinkoPhysics';

interface ResultsTrackerProps {
  results: PlinkoResult[];
  totalBet: number;
  totalWin: number;
}

export const ResultsTracker = ({ results, totalBet, totalWin }: ResultsTrackerProps) => {
  const netResult = totalWin - totalBet;
  const isProfit = netResult > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted rounded-md">
            <div className="text-sm text-muted-foreground">Total Bet</div>
            <div className="font-bold">${totalBet.toFixed(2)}</div>
          </div>
          <div className="p-3 bg-muted rounded-md">
            <div className="text-sm text-muted-foreground">Total Win</div>
            <div className="font-bold text-green-600">${totalWin.toFixed(2)}</div>
          </div>
        </div>

        {/* Net Result */}
        <div className={`p-3 rounded-md ${isProfit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <div className="text-sm">Net Result</div>
          <div className="font-bold text-lg">
            {isProfit ? '+' : ''}${netResult.toFixed(2)}
          </div>
        </div>

        {/* Recent Results */}
        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Recent Drops ({results.length})</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {results.slice(-10).reverse().map((result, index) => (
                <div key={result.ballId} className="flex items-center justify-between p-2 bg-muted rounded-sm text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={result.isWin ? "default" : "secondary"}>
                      {result.multiplier}x
                    </Badge>
                    <span>${result.betAmount}</span>
                  </div>
                  <div className={`font-semibold ${result.isWin ? 'text-green-600' : 'text-red-600'}`}>
                    {result.isWin ? '+' : ''}${(result.winAmount - result.betAmount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
