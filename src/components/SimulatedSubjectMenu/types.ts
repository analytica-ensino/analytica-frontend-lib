import type { BaseApiClient } from '../../types/api';

/**
 * Subject item from simulated subjects API
 */
export interface SimulatedSubjectItem {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
}

/**
 * API response for simulated subjects
 */
export interface SimulatedSubjectsApiResponse {
  message: string;
  data: SimulatedSubjectItem[];
}

/**
 * Hook state
 */
export interface UseSimulatedSubjectsState {
  subjects: SimulatedSubjectItem[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook return type
 */
export interface UseSimulatedSubjectsReturn extends UseSimulatedSubjectsState {
  fetchSubjects: (areaKnowledgeIds?: string[] | null) => Promise<void>;
  reset: () => void;
}

/**
 * Props for SimulatedSubjectMenu component
 */
export interface SimulatedSubjectMenuProps {
  /** API client instance */
  readonly api: BaseApiClient;
  /** Area knowledge ID to filter subjects (null for all) */
  readonly areaKnowledgeId: string | null;
  /** Related IDs for merged areas (includes all IDs when area was deduplicated) */
  readonly relatedIds?: string[];
  /** Currently selected subject ID (null means "Todos") */
  readonly selectedSubjectId: string | null;
  /** Callback when subject changes (null means "Todos") */
  readonly onSubjectChange: (subjectId: string | null) => void;
  /** External loading state */
  readonly loading?: boolean;
  /** Label text (default: "Disciplina") */
  readonly label?: string;
}
