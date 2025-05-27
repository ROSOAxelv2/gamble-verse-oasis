
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, Lock } from 'lucide-react';

interface PegControlsProps {
  currentRows: number;
  minRows: number;
  maxRows: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled: boolean;
}

export const PegControls = ({
  currentRows,
  minRows,
  maxRows,
  onIncrease,
  onDecrease,
  disabled
}: PegControlsProps) => {
  const canIncrease = currentRows < maxRows && !disabled;
  const canDecrease = currentRows > minRows && !disabled;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Peg Configuration
          {disabled && <Lock className="h-4 w-4 text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{currentRows}</div>
          <div className="text-sm text-muted-foreground">Rows of Pegs</div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onDecrease}
            disabled={!canDecrease}
            className="flex-1"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onIncrease}
            disabled={!canIncrease}
            className="flex-1"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          {disabled 
            ? "Clear all balls to adjust pegs" 
            : `Range: ${minRows}-${maxRows} rows`
          }
        </div>
      </CardContent>
    </Card>
  );
};
