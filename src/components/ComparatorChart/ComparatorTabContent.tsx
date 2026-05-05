import { KnowledgeAreasContent } from './KnowledgeAreasContent';
import { CurricularComponentsContent } from './CurricularComponentsContent';
import { CompetenciesContent } from './CompetenciesContent';
import { NationalAveragesContent } from './NationalAveragesContent';
import type {
  ComparatorTabType,
  ComparatorData,
  ComparisonItem,
  ComparatorLabels,
} from '../../types/comparator';

export interface ComparatorTabContentProps {
  readonly activeTab: ComparatorTabType;
  readonly data: ComparatorData;
  readonly selectedItems: ComparisonItem[];
  readonly labels?: Partial<ComparatorLabels>;
}

export function ComparatorTabContent({
  activeTab,
  data,
  selectedItems,
  labels,
}: ComparatorTabContentProps) {
  switch (activeTab) {
    case 'knowledge-areas':
      return (
        <KnowledgeAreasContent
          data={data.knowledgeAreas}
          items={selectedItems}
          title={labels?.knowledgeAreasTitle}
        />
      );
    case 'curricular-components':
      return (
        <CurricularComponentsContent
          data={data.curricularComponents}
          items={selectedItems}
          title={labels?.curricularComponentsTitle}
        />
      );
    case 'competencies':
      return (
        <CompetenciesContent
          data={data.competencies}
          items={selectedItems}
          title={labels?.competenciesTitle}
        />
      );
    case 'national-averages':
      return (
        <NationalAveragesContent
          data={data.nationalAverages}
          items={selectedItems}
          title={labels?.nationalAveragesTitle}
          labels={labels}
        />
      );
    default:
      return null;
  }
}
