// components/BatteryIndicator.tsx
import { BatteryFull, BatteryLow, BatteryMedium, BatteryCharging } from 'lucide-react';

interface BatteryIndicatorProps {
  battery: number;
}

export const BatteryIndicator = ({ battery }: BatteryIndicatorProps) => {
  let color = "green";
  let Icon = BatteryFull;

  if (battery < 20) {
    color = "red";
    Icon = BatteryLow;
  } else if (battery < 50) {
    color = "orange";
    Icon = BatteryMedium;
  } else if (battery > 90) {
    Icon = BatteryCharging;
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded-md shadow-md">
      <Icon color={color} className="w-6 h-6" />
      <span className={`text-sm font-semibold text-${color}-600`}>
        {battery}%
      </span>
    </div>
  );
};
