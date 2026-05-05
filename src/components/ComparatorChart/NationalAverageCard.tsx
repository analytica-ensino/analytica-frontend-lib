import Text from '../Text/Text';
import type {
  NationalAverageData,
  ComparatorLabels,
} from '../../types/comparator';
import { DEFAULT_COMPARATOR_LABELS } from '../../types/comparator';

export interface NationalAverageCardProps {
  readonly data: NationalAverageData;
  readonly color?: string;
  readonly labels?: Partial<ComparatorLabels>;
}

const DETAIL_LABELS = [
  { key: 'languages', label: 'LINGUAGENS, CÓDIGOS E SUAS TECNOLOGIAS' },
  { key: 'humanities', label: 'CIÊNCIAS HUMANAS E SUAS TECNOLOGIAS' },
  { key: 'essay', label: 'REDAÇÃO' },
  { key: 'naturalSciences', label: 'CIÊNCIAS DA NATUREZA E SUAS TECNOLOGIAS' },
  { key: 'mathematics', label: 'MATEMÁTICA E SUAS TECNOLOGIAS' },
] as const;

export function NationalAverageCard({
  data,
  color,
  labels: customLabels,
}: NationalAverageCardProps) {
  const labels = { ...DEFAULT_COMPARATOR_LABELS, ...customLabels };

  return (
    <div className="bg-secondary-50 rounded-2xl p-6">
      <Text size="md" weight="semibold" className="text-text-950 mb-4">
        {data.itemName}
      </Text>

      {/* Main scores */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div
          className="bg-background rounded-xl p-4 text-center border-l-4"
          style={{ borderColor: color }}
        >
          <Text size="2xl" weight="bold" className="text-primary-700">
            {data.simulatedProficiency.toFixed(1)}
          </Text>
          <Text size="xs" className="text-text-500 uppercase">
            {labels.simulatedProficiency}
          </Text>
        </div>
        <div className="bg-warning-50 rounded-xl p-4 text-center">
          <Text size="2xl" weight="bold" className="text-warning-700">
            {data.publicAverage}
          </Text>
          <Text size="xs" className="text-text-500 uppercase">
            {labels.publicSchoolAverage}
          </Text>
        </div>
        <div className="bg-success-50 rounded-xl p-4 text-center">
          <Text size="2xl" weight="bold" className="text-success-700">
            {data.privateAverage}
          </Text>
          <Text size="xs" className="text-text-500 uppercase">
            {labels.privateSchoolAverage}
          </Text>
        </div>
      </div>

      {/* Detail scores */}
      <div className="grid grid-cols-5 gap-4 mb-4">
        {DETAIL_LABELS.map(({ key, label }) => (
          <div key={key} className="bg-background rounded-xl p-3 text-center">
            <Text
              size="xs"
              className="text-text-500 uppercase mb-1 line-clamp-2"
            >
              {label}
            </Text>
            <Text size="lg" weight="bold" className="text-primary-700">
              {data.details[key]}
            </Text>
          </div>
        ))}
      </div>

      {/* Status */}
      <div
        className={`p-3 rounded-lg ${
          data.status === 'above'
            ? 'bg-success-100 text-success-700'
            : 'bg-warning-100 text-warning-700'
        }`}
      >
        <Text size="sm">
          {data.status === 'above' ? labels.aboveAverage : labels.belowAverage}
        </Text>
      </div>
    </div>
  );
}
