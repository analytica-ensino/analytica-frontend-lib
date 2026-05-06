import Text from '../Text/Text';
import { Legend } from './Legend';
import { PercentageScale } from './PercentageScale';
import { ChartArea } from './ChartArea';
import { BarChartRow } from './BarChartRow';
import type {
  CurricularComponentData,
  ComparisonItem,
} from '../../types/comparator';

export interface CurricularComponentsContentProps {
  readonly data: CurricularComponentData[];
  readonly items: ComparisonItem[];
  readonly title?: string;
}

export function CurricularComponentsContent({
  data,
  items,
  title = 'Proficiência média por componente curricular',
}: CurricularComponentsContentProps) {
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
        {data.map((component) => (
          <BarChartRow
            key={component.component}
            label={component.component}
            values={component.values}
            items={items}
          />
        ))}
      </ChartArea>
    </div>
  );
}
