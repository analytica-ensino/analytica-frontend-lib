import Text from '../Text/Text';
import { Legend } from './Legend';
import { PercentageScale } from './PercentageScale';
import { ChartArea } from './ChartArea';
import { BarChartRow } from './BarChartRow';
import type { CompetencyData, ComparisonItem } from '../../types/comparator';

export interface CompetenciesContentProps {
  readonly data: CompetencyData[];
  readonly items: ComparisonItem[];
  readonly title?: string;
}

export function CompetenciesContent({
  data,
  items,
  title = 'Proficiência média por competência',
}: CompetenciesContentProps) {
  return (
    <div className="bg-secondary-50 rounded-2xl p-6">
      <div className="mb-6">
        <Text size="md" weight="semibold" className="text-text-950 mb-4">
          {title}
        </Text>
        <Legend items={items} />
      </div>
      <PercentageScale />
      <ChartArea>
        {data.map((competency) => (
          <BarChartRow
            key={competency.competency}
            label={competency.competency}
            values={competency.values}
            items={items}
          />
        ))}
      </ChartArea>
    </div>
  );
}
