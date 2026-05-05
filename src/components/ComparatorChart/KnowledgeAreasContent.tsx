import Text from '../Text/Text';
import { Legend } from './Legend';
import { PercentageScale } from './PercentageScale';
import { ChartArea } from './ChartArea';
import { BarChartRow } from './BarChartRow';
import type { KnowledgeAreaData, ComparisonItem } from '../../types/comparator';

export interface KnowledgeAreasContentProps {
  readonly data: KnowledgeAreaData[];
  readonly items: ComparisonItem[];
  readonly title?: string;
}

export function KnowledgeAreasContent({
  data,
  items,
  title = 'Proficiência média das escolas por área do Enem',
}: KnowledgeAreasContentProps) {
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
        {data.map((area) => (
          <BarChartRow
            key={area.area}
            label={area.area}
            values={area.values}
            items={items}
          />
        ))}
      </ChartArea>
    </div>
  );
}
