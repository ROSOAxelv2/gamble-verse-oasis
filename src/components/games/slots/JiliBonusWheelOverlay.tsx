
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BonusWheelResult } from '@/utils/jiliMoneyComingEngine';
import moneyComingWheel from '@/config/moneyComingWheel.json';

interface JiliBonusWheelOverlayProps {
  onSpin: () => void;
  result: BonusWheelResult | null;
  baseWin: number;
}

export const JiliBonusWheelOverlay = ({ onSpin, result, baseWin }: JiliBonusWheelOverlayProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const segments = moneyComingWheel.segments;

  const handleSpin = () => {
    setIsSpinning(true);
    
    // Calculate rotation for winning segment
    const segmentAngle = 360 / segments.length;
    const targetRotation = result ? (360 - (result.selectedSegment - 1) * segmentAngle) + (Math.random() * segmentAngle - segmentAngle / 2) : 0;
    const finalRotation = rotation + 1800 + targetRotation; // 5 full spins + target
    
    setRotation(finalRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      onSpin();
    }, 3000);
  };

  useEffect(() => {
    if (result) {
      // Show result after wheel stops
      setTimeout(() => {
        setIsSpinning(false);
      }, 500);
    }
  }, [result]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gradient-to-b from-purple-900 to-purple-950 p-8 rounded-2xl border-4 border-purple-500 shadow-2xl max-w-2xl w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-purple-100 mb-2">🎡 BONUS WHEEL</h2>
          <p className="text-purple-300">
            Base Win: <span className="text-yellow-400 font-bold">${baseWin.toFixed(2)}</span>
          </p>
          <p className="text-purple-300">Spin for massive multipliers!</p>
        </div>

        {/* Wheel */}
        <div className="relative w-80 h-80 mx-auto mb-6">
          {/* Wheel Container */}
          <div 
            className="w-full h-full rounded-full border-8 border-purple-400 relative overflow-hidden transition-transform duration-[3000ms] ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {segments.map((segment, index) => {
              const angle = (360 / segments.length) * index;
              const nextAngle = (360 / segments.length) * (index + 1);
              
              return (
                <div
                  key={segment.id}
                  className="absolute w-1/2 h-1/2 origin-bottom-right flex items-center justify-center text-white font-bold text-sm"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    background: `conic-gradient(from ${angle}deg, ${segment.color} 0deg, ${segment.color} ${360/segments.length}deg, transparent ${360/segments.length}deg)`,
                    clipPath: `polygon(0 0, 100% 0, 50% 100%)`
                  }}
                >
                  <span className="transform -rotate-90 text-xs">
                    x{segment.multiplier}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
            <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400"></div>
          </div>

          {/* Center Hub */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-purple-800 rounded-full border-4 border-purple-400 flex items-center justify-center">
            <span className="text-2xl">🎡</span>
          </div>
        </div>

        {/* Controls */}
        <div className="text-center">
          {!result && !isSpinning && (
            <Button 
              onClick={handleSpin}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
              disabled={isSpinning}
            >
              SPIN THE WHEEL! 🎡
            </Button>
          )}
          
          {isSpinning && (
            <div className="text-purple-300 animate-pulse">
              🎡 Spinning... Good luck! 🎡
            </div>
          )}

          {result && !isSpinning && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-2">
                  🎉 x{result.multiplier} MULTIPLIER! 🎉
                </div>
                <div className="text-purple-300">
                  ${baseWin.toFixed(2)} × {result.multiplier} = 
                  <span className="text-green-400 font-bold text-xl ml-2">
                    ${result.finalWin.toFixed(2)}
                  </span>
                </div>
                {result.multiplier >= 1000 && (
                  <div className="text-yellow-400 animate-bounce text-lg mt-2">
                    💎 MEGA WIN! 💎
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
