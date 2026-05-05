import { useState } from 'react';
import Text from '../Text/Text';
import type { LegendItem } from './Legend';

export interface BarChartValue {
  itemId: string;
  percentage: number;
}

export interface BarChartRowProps {
  readonly label: string;
  readonly values: BarChartValue[];
  readonly items: LegendItem[];
}

export function BarChartRow({ label, values, items }: BarChartRowProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-4">
      <Text size="sm" className="text-text-700 w-64 shrink-0">
        {label}
      </Text>
      <div className="flex-1 space-y-1.5">
        {items.map((item) => {
          const value = values.find((v) => v.itemId === item.id);
          const percentage = value?.percentage ?? 0;
          const clampedPercentage = Math.max(0, Math.min(percentage, 100));
          const isHovered = hoveredItem === item.id;

          return (
            <div
              key={item.id}
              className="relative group"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="flex-1 h-5 bg-secondary-100 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHovered ? 'opacity-90' : ''
                  }`}
                  style={{
                    width: `${clampedPercentage}%`,
                    backgroundColor: item.color,
                    minWidth: clampedPercentage > 0 ? '8px' : '0px',
                  }}
                />
              </div>
              {/* Tooltip */}
              {isHovered && (
                <div
                  className="absolute z-10 px-2 py-1 text-xs font-medium text-white bg-text-900 rounded shadow-lg whitespace-nowrap"
                  style={{
                    left: `${Math.min(Math.max(percentage, 5), 95)}%`,
                    top: '-28px',
                    transform: 'translateX(-50%)',
                  }}
                >
                  {item.name}: {percentage.toFixed(1)}%
                  <div
                    className="absolute w-2 h-2 bg-text-900 rotate-45"
                    style={{
                      left: '50%',
                      bottom: '-4px',
                      transform: 'translateX(-50%)',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
