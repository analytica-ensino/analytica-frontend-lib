// Reuse types from GeneralOverviewSection
import type { AreaKnowledgePerformance } from '../GeneralOverviewSection/types';

/**
 * Special ID for essay (Redação) area
 */
export const ESSAY_AREA_ID = 'essay';

/**
 * Props for AreaKnowledgeSelector component
 */
export interface AreaKnowledgeSelectorProps {
  /** List of areas from general overview (only id and name are used) */
  readonly areas: AreaKnowledgePerformance[];
  /** Currently selected area ID (null means "Todos") */
  readonly selectedAreaId: string | null;
  /** Callback when area changes */
  readonly onAreaChange: (areaId: string | null) => void;
  /** Loading state */
  readonly loading?: boolean;
  /** Label text (default: "Área de conhecimento") */
  readonly label?: string;
  /** Include essay option at the end (default: true) */
  readonly includeEssay?: boolean;
}
