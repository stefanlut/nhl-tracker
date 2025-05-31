'use client';

interface StatBarProps {
  value: number;
  maxValue?: number;
  greenScale?: boolean;
  showAsPercentage?: boolean;
  customThresholds?: {
    excellent: number;
    good: number;
    poor: number;
  };
}

export default function StatBar({ value, maxValue = 100, greenScale = false, showAsPercentage = false, customThresholds }: StatBarProps) {
  // Calculate percentage - ensure it's between 0 and 100
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  
  // For percentage stats (0-100)
  let barColor = '';
  let labelColor = '';
  
  if (greenScale) {
    // Use custom thresholds if provided, otherwise use defaults
    const thresholds = customThresholds || { excellent: 75, good: 50, poor: 25 };
    
    // Green scale for values where higher is better (e.g., win percentage)
    if (percentage >= thresholds.excellent) {
      barColor = 'bg-green-500';
      labelColor = 'text-green-500';
    } else if (percentage >= thresholds.good) {
      barColor = 'bg-green-400';
      labelColor = 'text-green-400';
    } else if (percentage >= thresholds.poor) {
      barColor = 'bg-yellow-400';
      labelColor = 'text-yellow-400';
    } else {
      barColor = 'bg-red-400';
      labelColor = 'text-red-400';
    }
  } else {
    // Blue scale for neutral values
    barColor = 'bg-blue-500';
    labelColor = 'text-blue-500';
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1 text-xs">
        <span className={`font-medium ${labelColor} text-right`}>
          {showAsPercentage ? `${percentage.toFixed(1)}%` : value}
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {showAsPercentage ? '100%' : maxValue}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-300 ease-in-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
