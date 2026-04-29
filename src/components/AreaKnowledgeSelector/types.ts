/**
 * Special ID for essay (Redação) area
 */
export const ESSAY_AREA_ID = 'essay';

/**
 * Area performance data (subset of GeneralOverviewSection types)
 */
export interface AreaKnowledgeItem {
  id: string;
  name: string;
}

/**
 * Props for AreaKnowledgeSelector component
 */
export interface AreaKnowledgeSelectorProps {
  /** List of areas from general overview */
  readonly areas: AreaKnowledgeItem[];
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
