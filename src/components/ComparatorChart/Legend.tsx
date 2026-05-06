import Text from '../Text/Text';

export interface LegendItem {
  id: string;
  name: string;
  color: string;
}

export interface LegendProps {
  readonly items: LegendItem[];
}

export function Legend({ items }: LegendProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-4 items-center">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <Text size="sm" className="text-text-700">
              {item.name}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
