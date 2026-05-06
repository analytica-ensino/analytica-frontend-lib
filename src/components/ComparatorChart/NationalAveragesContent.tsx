import Text from '../Text/Text';
import { NationalAverageCard } from './NationalAverageCard';
import type {
  NationalAverageData,
  ComparisonItem,
  ComparatorLabels,
} from '../../types/comparator';
import { DEFAULT_COMPARATOR_LABELS } from '../../types/comparator';

export interface NationalAveragesContentProps {
  readonly data: NationalAverageData[];
  readonly items: ComparisonItem[];
  readonly title?: string;
  readonly labels?: Partial<ComparatorLabels>;
}

export function NationalAveragesContent({
  data,
  items,
  title,
  labels: customLabels,
}: NationalAveragesContentProps) {
  const labels = { ...DEFAULT_COMPARATOR_LABELS, ...customLabels };

  return (
    <div className="space-y-6">
      <Text size="md" weight="semibold" className="text-text-950">
        {title || labels.nationalAveragesTitle}
      </Text>
      {data.map((item) => {
        const selectedItem = items.find((i) => i.id === item.itemId);
        return (
          <NationalAverageCard
            key={item.itemId}
            data={item}
            color={selectedItem?.color}
            labels={labels}
          />
        );
      })}
    </div>
  );
}
