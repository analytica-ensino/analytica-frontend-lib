import { KnowledgeAreasContent } from './KnowledgeAreasContent';
import { CurricularComponentsContent } from './CurricularComponentsContent';
import { CompetenciesContent } from './CompetenciesContent';
import { NationalAveragesContent } from './NationalAveragesContent';
import {
  ComparatorTabValue,
  type ComparatorTabType,
  type ComparatorData,
  type ComparisonItem,
  type ComparatorLabels,
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
    case ComparatorTabValue.KNOWLEDGE_AREAS:
      return (
        <KnowledgeAreasContent
          data={data.knowledgeAreas}
          items={selectedItems}
          title={labels?.knowledgeAreasTitle}
        />
      );
    case ComparatorTabValue.CURRICULAR_COMPONENTS:
      return (
        <CurricularComponentsContent
          data={data.curricularComponents}
          items={selectedItems}
          title={labels?.curricularComponentsTitle}
        />
      );
    case ComparatorTabValue.COMPETENCIES:
      return (
        <CompetenciesContent
          data={data.competencies}
          items={selectedItems}
          title={labels?.competenciesTitle}
        />
      );
    case ComparatorTabValue.NATIONAL_AVERAGES:
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
