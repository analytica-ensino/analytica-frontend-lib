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
 * API client interface for subjects
 */
export interface SimulatedSubjectsApiClient {
  get: <T>(url: string) => Promise<{ data: T }>;
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
  fetchSubjects: (areaKnowledgeId?: string | null) => Promise<void>;
  reset: () => void;
}

/**
 * Props for SimulatedSubjectMenu component
 */
export interface SimulatedSubjectMenuProps {
  /** API client instance */
  readonly api: SimulatedSubjectsApiClient;
  /** Area knowledge ID to filter subjects (null for all) */
  readonly areaKnowledgeId: string | null;
  /** Currently selected subject ID (null means "Todos") */
  readonly selectedSubjectId: string | null;
  /** Callback when subject changes */
  readonly onSubjectChange: (subjectId: string) => void;
  /** External loading state */
  readonly loading?: boolean;
  /** Label text (default: "Disciplina") */
  readonly label?: string;
}
