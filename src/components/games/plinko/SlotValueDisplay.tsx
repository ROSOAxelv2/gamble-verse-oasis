
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import plinkoLayout from '@/config/plinkoLayout.json';

interface SlotValueDisplayProps {
  highlightedBucket: number | null;
  onAnimationComplete?: () => void;
}

export const SlotValueDisplay = ({ highlightedBucket, onAnimationComplete }: SlotValueDisplayProps) => {
  const [animatingBucket, setAnimatingBucket] = useState<number | null>(null);

  useEffect(() => {
    if (highlightedBucket !== null) {
      setAnimatingBucket(highlightedBucket);
      const timer = setTimeout(() => {
        setAnimatingBucket(null);
        onAnimationComplete?.();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [highlightedBucket, onAnimationComplete]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {plinkoLayout.buckets.map((bucket, index) => {
        const isAnimating = animatingBucket === index;
        const isHighlighted = highlightedBucket === index;
        
        return (
          <div
            key={index}
            className={`absolute transition-all duration-300 ${
              isAnimating ? 'animate-bounce scale-125' : ''
            } ${isHighlighted ? 'animate-pulse' : ''}`}
            style={{
              left: bucket.x + bucket.width / 2 - 30,
              top: bucket.y - 40,
              transform: 'translateX(-50%)'
            }}
          >
            <Badge 
              variant={bucket.multiplier > 1 ? "default" : "destructive"}
              className={`text-lg font-bold px-3 py-1 ${
                isAnimating ? 'bg-yellow-500 text-yellow-900 shadow-lg' : ''
              }`}
            >
              {bucket.multiplier}x
            </Badge>
          </div>
        );
      })}
    </div>
  );
};
