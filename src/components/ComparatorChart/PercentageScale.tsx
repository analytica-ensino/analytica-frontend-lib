import Text from '../Text/Text';

export function PercentageScale() {
  return (
    <div className="flex items-center gap-4 mb-2 border-b border-border-100 pb-2">
      {/* Spacer for label column (matches BarChartRow label width) */}
      <div className="w-64 shrink-0" />
      {/* Scale markers */}
      <div className="flex-1 flex justify-between px-1">
        <Text size="xs" className="text-text-400">
          0%
        </Text>
        <Text size="xs" className="text-text-400">
          25%
        </Text>
        <Text size="xs" className="text-text-400">
          50%
        </Text>
        <Text size="xs" className="text-text-400">
          75%
        </Text>
        <Text size="xs" className="text-text-400">
          100%
        </Text>
      </div>
    </div>
  );
}
