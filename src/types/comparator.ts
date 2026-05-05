export type ComparisonType = 'school' | 'schoolYear';

export type ComparatorTabType =
  | 'knowledge-areas'
  | 'curricular-components'
  | 'competencies'
  | 'national-averages';

export interface ComparisonItem {
  id: string;
  name: string;
  color: string;
}

export interface KnowledgeAreaData {
  area: string;
  values: { itemId: string; percentage: number }[];
}

export interface CurricularComponentData {
  component: string;
  values: { itemId: string; percentage: number }[];
}

export interface CompetencyData {
  competency: string;
  values: { itemId: string; percentage: number }[];
}

export interface NationalAverageData {
  itemId: string;
  itemName: string;
  simulatedProficiency: number;
  publicAverage: number;
  privateAverage: number;
  details: {
    languages: number;
    humanities: number;
    essay: number;
    naturalSciences: number;
    mathematics: number;
  };
  status: 'above' | 'below';
}

export interface ComparatorData {
  knowledgeAreas: KnowledgeAreaData[];
  curricularComponents: CurricularComponentData[];
  competencies: CompetencyData[];
  nationalAverages: NationalAverageData[];
}

// API Response types
export interface AreaPerformance {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  percentage: number;
  questionsTotal: number;
  questionsCorrect: number;
}

export interface KnowledgeAreasApiItem {
  itemId: string;
  itemName: string;
  areas: AreaPerformance[];
}

export interface CurricularComponentsApiItem {
  itemId: string;
  itemName: string;
  subjects: AreaPerformance[];
}

export interface CompetencyPerformance {
  competencyNumber: number;
  name: string;
  averageScore: number;
  averagePercentage: number;
  essaysCount: number;
  studentsCount: number;
}

export interface CompetenciesApiItem {
  itemId: string;
  itemName: string;
  competencies: CompetencyPerformance[];
  totalEssays: number;
  totalStudents: number;
}

export interface NationalAverageAreaPerformance {
  id: string;
  name: string;
  triScore: number;
  questionsTotal: number;
  questionsCorrect: number;
}

export interface NationalAveragesApiItem {
  itemId: string;
  itemName: string;
  overallTriScore: number;
  areas: NationalAverageAreaPerformance[];
  publicSchoolAverage: number;
  privateSchoolAverage: number;
  status: 'above' | 'below';
}

// API Client interface for dependency injection
export interface ComparatorApiClient {
  post: <T>(url: string, data: unknown) => Promise<{ data: { data: T } }>;
}

// Store types
export interface ComparatorStoreState {
  comparisonType: ComparisonType | null;
  selectedItems: ComparisonItem[];
  setComparisonType: (type: ComparisonType | null) => void;
  setSelectedItems: (items: ComparisonItem[]) => void;
  addItem: (item: ComparisonItem) => void;
  removeItem: (itemId: string) => void;
  clearSelection: () => void;
}

// Hook return type
export interface UseComparatorReturn {
  data: ComparatorData;
  loading: boolean;
  error: string | null;
  fetchData: (
    ids: string[],
    type: ComparisonType,
    tab: ComparatorTabType,
    itemNames?: Map<string, string>
  ) => Promise<void>;
}

// Labels for customization
export interface ComparatorLabels {
  title: string;
  selectComparison: string;
  selectSchools: string;
  selectSchoolYears: string;
  schools: string;
  schoolYears: string;
  compareSchoolsDescription: string;
  compareSchoolYearsDescription: string;
  selectComparisonType: string;
  noAccessMessage: string;
  search: string;
  maxLimitWarning: string;
  confirm: string;
  back: string;
  filters: string;
  knowledgeAreasTitle: string;
  curricularComponentsTitle: string;
  competenciesTitle: string;
  nationalAveragesTitle: string;
  simulatedProficiency: string;
  publicSchoolAverage: string;
  privateSchoolAverage: string;
  aboveAverage: string;
  belowAverage: string;
  ofSelected: string;
}

export const DEFAULT_COMPARATOR_LABELS: ComparatorLabels = {
  title: 'Comparador',
  selectComparison: 'Selecionar comparação',
  selectSchools: 'Selecionar escolas',
  selectSchoolYears: 'Selecionar turmas',
  schools: 'Escolas',
  schoolYears: 'Turmas',
  compareSchoolsDescription: 'Compare o desempenho entre escolas',
  compareSchoolYearsDescription: 'Compare o desempenho entre turmas',
  selectComparisonType: 'Selecione o tipo de comparação.',
  noAccessMessage:
    'Você precisa ter acesso a mais de uma escola ou turma para usar o comparador.',
  search: 'Buscar',
  maxLimitWarning: 'Limite máximo de 5 itens atingido',
  confirm: 'Confirmar',
  back: 'Voltar',
  filters: 'Filtros',
  knowledgeAreasTitle: 'Proficiência média das escolas por área do Enem',
  curricularComponentsTitle: 'Proficiência média por componente curricular',
  competenciesTitle: 'Proficiência média por competência',
  nationalAveragesTitle:
    'Proficiência média dos simulados comparada com dados oficiais do INEP',
  simulatedProficiency: 'Proficiência Simulados',
  publicSchoolAverage: 'Média Escolas Públicas (INEP)',
  privateSchoolAverage: 'Média Escolas Privadas (INEP)',
  aboveAverage: 'Esta escola está acima da média nacional.',
  belowAverage: 'Esta escola está abaixo da média nacional.',
  ofSelected: 'selecionadas',
};

// Tab configuration
export interface ComparatorTab {
  value: ComparatorTabType;
  label: string;
}

export const DEFAULT_COMPARATOR_TABS: ComparatorTab[] = [
  { value: 'knowledge-areas', label: 'Áreas do conhecimento' },
  { value: 'curricular-components', label: 'Componentes curriculares' },
  { value: 'competencies', label: 'Competências' },
  { value: 'national-averages', label: 'Médias Nacionais ENEM' },
];

// Chart colors
export const COMPARATOR_CHART_COLORS = [
  '#1E40AF',
  '#F59E0B',
  '#10B981',
  '#EF4444',
  '#8B5CF6',
];
