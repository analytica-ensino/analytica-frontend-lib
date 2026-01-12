import type { Story } from '@ladle/react';
import {
  RecommendedLessonsHistory,
  GoalPageTab,
} from './RecommendedLessonsHistory';
import type { RecommendedLessonsHistoryProps } from './RecommendedLessonsHistory';
import type {
  GoalsHistoryApiResponse,
  GoalModelsApiResponse,
} from '../../types/recommendedLessons';
import { GoalDraftType } from '../../types/recommendedLessons';
import { SubjectEnum } from '../../enums/SubjectEnum';

/**
 * Mock UUIDs for models data
 */
const MOCK_UUIDS = {
  models: {
    model1: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    model2: '00000000-0000-0000-0000-000000000001',
    model3: '00000000-0000-0000-0000-000000000002',
    model4: '00000000-0000-0000-0000-000000000003',
    model5: '00000000-0000-0000-0000-000000000004',
  },
  subjects: {
    math: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    physics: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    chemistry: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    portuguese: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    biology: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  },
  users: {
    creator: '11111111-1111-1111-1111-111111111111',
  },
};

/**
 * Mock subjects map for models
 */
const mockSubjectsMap = new Map<string, string>([
  [MOCK_UUIDS.subjects.math, 'Matemática'],
  [MOCK_UUIDS.subjects.physics, 'Física'],
  [MOCK_UUIDS.subjects.chemistry, 'Química'],
  [MOCK_UUIDS.subjects.portuguese, 'Português'],
  [MOCK_UUIDS.subjects.biology, 'Biologia'],
]);

/**
 * Mock goal models data
 */
const mockGoalModelsResponse: GoalModelsApiResponse = {
  message: 'Success',
  data: {
    drafts: [
      {
        id: MOCK_UUIDS.models.model1,
        type: GoalDraftType.MODELO,
        title: 'Modelo de Aula - Álgebra Linear',
        description: 'Modelo para aulas de álgebra com foco em matrizes',
        creatorUserInstitutionId: MOCK_UUIDS.users.creator,
        subjectId: MOCK_UUIDS.subjects.math,
        startDate: null,
        finalDate: null,
        createdAt: '2024-10-15T10:00:00Z',
        updatedAt: '2024-11-01T14:30:00Z',
      },
      {
        id: MOCK_UUIDS.models.model2,
        type: GoalDraftType.MODELO,
        title: 'Modelo de Aula - Mecânica Clássica',
        description: 'Modelo para aulas de física sobre leis de Newton',
        creatorUserInstitutionId: MOCK_UUIDS.users.creator,
        subjectId: MOCK_UUIDS.subjects.physics,
        startDate: null,
        finalDate: null,
        createdAt: '2024-09-20T08:00:00Z',
        updatedAt: '2024-10-05T16:45:00Z',
      },
      {
        id: MOCK_UUIDS.models.model3,
        type: GoalDraftType.MODELO,
        title: 'Modelo de Aula - Química Orgânica',
        description: 'Modelo para aulas de química sobre hidrocarbonetos',
        creatorUserInstitutionId: MOCK_UUIDS.users.creator,
        subjectId: MOCK_UUIDS.subjects.chemistry,
        startDate: null,
        finalDate: null,
        createdAt: '2024-08-01T09:30:00Z',
        updatedAt: '2024-08-15T11:00:00Z',
      },
      {
        id: MOCK_UUIDS.models.model4,
        type: GoalDraftType.MODELO,
        title: 'Modelo de Aula - Literatura Brasileira',
        description: 'Modelo para aulas de português sobre modernismo',
        creatorUserInstitutionId: MOCK_UUIDS.users.creator,
        subjectId: MOCK_UUIDS.subjects.portuguese,
        startDate: null,
        finalDate: null,
        createdAt: '2024-07-10T14:00:00Z',
        updatedAt: '2024-07-20T10:30:00Z',
      },
      {
        id: MOCK_UUIDS.models.model5,
        type: GoalDraftType.MODELO,
        title: 'Modelo de Aula - Biologia Celular',
        description: 'Modelo para aulas de biologia sobre mitose e meiose',
        creatorUserInstitutionId: MOCK_UUIDS.users.creator,
        subjectId: MOCK_UUIDS.subjects.biology,
        startDate: null,
        finalDate: null,
        createdAt: '2024-06-05T11:00:00Z',
        updatedAt: '2024-06-15T09:00:00Z',
      },
    ],
    total: 5,
  },
};

/**
 * Empty models response
 */
const emptyModelsResponse: GoalModelsApiResponse = {
  message: 'Success',
  data: {
    drafts: [],
    total: 0,
  },
};

/**
 * Mock goals history data
 */
const mockGoalsHistoryData: GoalsHistoryApiResponse = {
  message: 'Success',
  data: {
    goals: [
      {
        goal: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Álgebra Linear - Matrizes e Determinantes',
          startDate: '2024-06-01',
          finalDate: '2024-06-30',
          createdAt: '2024-05-28T10:00:00Z',
          progress: 75,
          totalLessons: 8,
        },
        subject: {
          id: '550e8400-e29b-41d4-a716-446655440010',
          name: 'Matemática',
        },
        creator: {
          id: '550e8400-e29b-41d4-a716-446655440020',
          name: 'Prof. João Silva',
        },
        stats: {
          totalStudents: 35,
          completedCount: 28,
          completionPercentage: 80,
        },
        breakdown: [
          {
            classId: '550e8400-e29b-41d4-a716-446655440030',
            className: 'Turma A - 3º Ano',
            schoolId: 'school-1',
            schoolName: 'Escola Estadual São Paulo',
            studentCount: 35,
            completedCount: 28,
          },
        ],
      },
      {
        goal: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          title: 'Mecânica Clássica - Leis de Newton',
          startDate: '2024-05-15',
          finalDate: '2024-06-15',
          createdAt: '2024-05-10T14:30:00Z',
          progress: 100,
          totalLessons: 6,
        },
        subject: {
          id: '550e8400-e29b-41d4-a716-446655440011',
          name: 'Física',
        },
        creator: {
          id: '550e8400-e29b-41d4-a716-446655440021',
          name: 'Prof. Maria Santos',
        },
        stats: {
          totalStudents: 30,
          completedCount: 30,
          completionPercentage: 100,
        },
        breakdown: [
          {
            classId: '550e8400-e29b-41d4-a716-446655440031',
            className: 'Turma B - 2º Ano',
            schoolId: 'school-1',
            schoolName: 'Escola Estadual São Paulo',
            studentCount: 30,
            completedCount: 30,
          },
        ],
      },
      {
        goal: {
          id: '550e8400-e29b-41d4-a716-446655440003',
          title: 'Química Orgânica - Hidrocarbonetos',
          startDate: '2024-04-01',
          finalDate: '2024-05-01',
          createdAt: '2024-03-25T09:00:00Z',
          progress: 45,
          totalLessons: 10,
        },
        subject: {
          id: '550e8400-e29b-41d4-a716-446655440012',
          name: 'Química',
        },
        creator: {
          id: '550e8400-e29b-41d4-a716-446655440022',
          name: 'Prof. Carlos Lima',
        },
        stats: {
          totalStudents: 40,
          completedCount: 18,
          completionPercentage: 45,
        },
        breakdown: [
          {
            classId: '550e8400-e29b-41d4-a716-446655440032',
            className: 'Turma C - 3º Ano',
            schoolId: 'school-2',
            schoolName: 'Colégio Municipal Centro',
            studentCount: 40,
            completedCount: 18,
          },
        ],
      },
      {
        goal: {
          id: '550e8400-e29b-41d4-a716-446655440004',
          title: 'Literatura Brasileira - Modernismo',
          startDate: '2024-06-10',
          finalDate: '2024-07-10',
          createdAt: '2024-06-05T11:00:00Z',
          progress: 25,
          totalLessons: 12,
        },
        subject: {
          id: '550e8400-e29b-41d4-a716-446655440013',
          name: 'Português',
        },
        creator: {
          id: '550e8400-e29b-41d4-a716-446655440023',
          name: 'Prof. Ana Costa',
        },
        stats: {
          totalStudents: 45,
          completedCount: 11,
          completionPercentage: 25,
        },
        breakdown: [
          {
            classId: '550e8400-e29b-41d4-a716-446655440033',
            className: 'Turma A - 2º Ano',
            schoolId: 'school-1',
            schoolName: 'Escola Estadual São Paulo',
            studentCount: 25,
            completedCount: 6,
          },
          {
            classId: '550e8400-e29b-41d4-a716-446655440034',
            className: 'Turma B - 2º Ano',
            schoolId: 'school-2',
            schoolName: 'Colégio Municipal Centro',
            studentCount: 20,
            completedCount: 5,
          },
        ],
      },
      {
        goal: {
          id: '550e8400-e29b-41d4-a716-446655440005',
          title: 'Biologia Celular - Mitose e Meiose',
          startDate: '2024-05-01',
          finalDate: '2024-05-31',
          createdAt: '2024-04-25T08:00:00Z',
          progress: 60,
          totalLessons: 8,
        },
        subject: {
          id: '550e8400-e29b-41d4-a716-446655440014',
          name: 'Biologia',
        },
        creator: {
          id: '550e8400-e29b-41d4-a716-446655440024',
          name: 'Prof. Roberto Ferreira',
        },
        stats: {
          totalStudents: 32,
          completedCount: 19,
          completionPercentage: 60,
        },
        breakdown: [
          {
            classId: '550e8400-e29b-41d4-a716-446655440035',
            className: 'Turma D - 1º Ano',
            schoolId: 'school-1',
            schoolName: 'Escola Estadual São Paulo',
            studentCount: 32,
            completedCount: 19,
          },
        ],
      },
    ],
    total: 5,
  },
};

/**
 * Empty data response
 */
const emptyDataResponse: GoalsHistoryApiResponse = {
  message: 'Success',
  data: {
    goals: [],
    total: 0,
  },
};

/**
 * User filter data for dropdowns
 */
const mockUserFilterData = {
  schools: [
    { id: 'school-1', name: 'Escola Estadual São Paulo' },
    { id: 'school-2', name: 'Colégio Municipal Centro' },
    { id: 'school-3', name: 'Instituto Educacional Norte' },
  ],
  classes: [
    { id: 'class-1', name: 'Turma A - 3º Ano' },
    { id: 'class-2', name: 'Turma B - 2º Ano' },
    { id: 'class-3', name: 'Turma C - 3º Ano' },
    { id: 'class-4', name: 'Turma D - 1º Ano' },
  ],
  subjects: [
    { id: 'subject-1', name: 'Matemática' },
    { id: 'subject-2', name: 'Física' },
    { id: 'subject-3', name: 'Química' },
    { id: 'subject-4', name: 'Português' },
    { id: 'subject-5', name: 'Biologia' },
  ],
  schoolYears: [
    { id: 'year-1', name: '1º Ano' },
    { id: 'year-2', name: '2º Ano' },
    { id: 'year-3', name: '3º Ano' },
  ],
};

/**
 * Map subject name to enum for icon display
 */
const mapSubjectNameToEnum = (subjectName: string): SubjectEnum | null => {
  const mapping: Record<string, SubjectEnum> = {
    Matemática: SubjectEnum.MATEMATICA,
    Física: SubjectEnum.FISICA,
    Química: SubjectEnum.QUIMICA,
    Português: SubjectEnum.PORTUGUES,
    Biologia: SubjectEnum.BIOLOGIA,
  };
  return mapping[subjectName] || null;
};

/**
 * Default props for stories
 */
const defaultProps: RecommendedLessonsHistoryProps = {
  fetchGoalsHistory: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockGoalsHistoryData;
  },
  onCreateLesson: () => console.log('Create lesson clicked'),
  onRowClick: (row) => console.log('Row clicked:', row),
  onDeleteGoal: (id) => console.log('Delete goal:', id),
  onEditGoal: (id) => console.log('Edit goal:', id),
  mapSubjectNameToEnum,
  userFilterData: mockUserFilterData,
  // Model props - enables Models tab in all stories
  fetchGoalModels: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockGoalModelsResponse;
  },
  deleteGoalModel: async (id) => {
    console.log('Delete model:', id);
  },
  onCreateModel: () => console.log('Create model clicked'),
  onSendLesson: (model) => console.log('Send lesson:', model),
  onEditModel: (model) => console.log('Edit model:', model),
  subjectsMap: mockSubjectsMap,
};

/**
 * Default story - shows the component with sample data
 */
export const Default: Story = () => (
  <RecommendedLessonsHistory {...defaultProps} />
);
Default.meta = {
  name: 'Default',
};

/**
 * Loading state - shows the component in loading state
 */
export const Loading: Story = () => (
  <RecommendedLessonsHistory
    {...defaultProps}
    fetchGoalsHistory={() => new Promise(() => {})}
  />
);
Loading.meta = {
  name: 'Loading State',
};

/**
 * Empty state - shows the component when no goals exist
 */
export const Empty: Story = () => (
  <RecommendedLessonsHistory
    {...defaultProps}
    fetchGoalsHistory={async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return emptyDataResponse;
    }}
  />
);
Empty.meta = {
  name: 'Empty State',
};

/**
 * Error state - shows the component when API fails
 */
export const ErrorState: Story = () => (
  <RecommendedLessonsHistory
    {...defaultProps}
    fetchGoalsHistory={() =>
      Promise.reject(new Error('Erro ao carregar dados'))
    }
  />
);
ErrorState.meta = {
  name: 'Error State',
};

/**
 * Custom title - shows the component with custom title and button text
 */
export const CustomTitle: Story = () => (
  <RecommendedLessonsHistory
    {...defaultProps}
    title="Minhas Aulas Recomendadas"
    createButtonText="Nova Aula Recomendada"
    searchPlaceholder="Pesquisar aulas..."
  />
);
CustomTitle.meta = {
  name: 'Custom Title',
};

/**
 * Without subject icons - shows the component without subject enum mapping
 */
export const WithoutSubjectIcons: Story = () => (
  <RecommendedLessonsHistory
    {...defaultProps}
    mapSubjectNameToEnum={undefined}
  />
);
WithoutSubjectIcons.meta = {
  name: 'Without Subject Icons',
};

/**
 * Many goals - shows the component with pagination
 */
export const ManyGoals: Story = () => {
  const generateGoals = (count: number) => {
    const subjects = [
      'Matemática',
      'Física',
      'Química',
      'Português',
      'Biologia',
    ];
    const classes = ['Turma A', 'Turma B', 'Turma C', 'Turma D'];
    const schools = ['Escola Estadual', 'Colégio Municipal', 'Instituto Norte'];

    return Array.from({ length: count }, (_, i) => ({
      goal: {
        id: `550e8400-e29b-41d4-a716-4466554400${String(i).padStart(2, '0')}`,
        title: `Aula ${i + 1} - ${subjects[i % subjects.length]}`,
        startDate: '2024-06-01',
        finalDate: '2024-06-30',
        createdAt: '2024-05-28T10:00:00Z',
        progress: Math.floor(Math.random() * 100),
        totalLessons: Math.floor(Math.random() * 10) + 5,
      },
      subject: {
        id: `550e8400-e29b-41d4-a716-4466554401${String(i % 5).padStart(2, '0')}`,
        name: subjects[i % subjects.length],
      },
      creator: {
        id: `550e8400-e29b-41d4-a716-4466554402${String(i % 3).padStart(2, '0')}`,
        name: `Professor ${i + 1}`,
      },
      stats: {
        totalStudents: 30 + (i % 20),
        completedCount: Math.floor(Math.random() * 30),
        completionPercentage: Math.floor(Math.random() * 100),
      },
      breakdown: [
        {
          classId: `550e8400-e29b-41d4-a716-4466554403${String(i % 4).padStart(2, '0')}`,
          className: `${classes[i % classes.length]} - ${(i % 3) + 1}º Ano`,
          schoolId: `school-${(i % 3) + 1}`,
          schoolName: schools[i % schools.length],
          studentCount: 30 + (i % 20),
          completedCount: Math.floor(Math.random() * 30),
        },
      ],
    }));
  };

  return (
    <RecommendedLessonsHistory
      {...defaultProps}
      fetchGoalsHistory={async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          message: 'Success',
          data: {
            goals: generateGoals(25),
            total: 25,
          },
        };
      }}
    />
  );
};
ManyGoals.meta = {
  name: 'Many Goals (Pagination)',
};

/**
 * Multiple classes per goal - shows goals assigned to multiple classes
 */
export const MultipleClasses: Story = () => {
  const multipleClassesData: GoalsHistoryApiResponse = {
    message: 'Success',
    data: {
      goals: [
        {
          goal: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            title: 'Trigonometria - Funções Trigonométricas',
            startDate: '2024-06-01',
            finalDate: '2024-06-30',
            createdAt: '2024-05-28T10:00:00Z',
            progress: 60,
            totalLessons: 10,
          },
          subject: {
            id: '550e8400-e29b-41d4-a716-446655440010',
            name: 'Matemática',
          },
          creator: {
            id: '550e8400-e29b-41d4-a716-446655440020',
            name: 'Prof. João Silva',
          },
          stats: {
            totalStudents: 90,
            completedCount: 54,
            completionPercentage: 60,
          },
          breakdown: [
            {
              classId: '550e8400-e29b-41d4-a716-446655440030',
              className: 'Turma A - 3º Ano',
              schoolId: 'school-1',
              schoolName: 'Escola Estadual São Paulo',
              studentCount: 30,
              completedCount: 20,
            },
            {
              classId: '550e8400-e29b-41d4-a716-446655440031',
              className: 'Turma B - 3º Ano',
              schoolId: 'school-1',
              schoolName: 'Escola Estadual São Paulo',
              studentCount: 30,
              completedCount: 18,
            },
            {
              classId: '550e8400-e29b-41d4-a716-446655440032',
              className: 'Turma C - 3º Ano',
              schoolId: 'school-2',
              schoolName: 'Colégio Municipal Centro',
              studentCount: 30,
              completedCount: 16,
            },
          ],
        },
      ],
      total: 1,
    },
  };

  return (
    <RecommendedLessonsHistory
      {...defaultProps}
      fetchGoalsHistory={async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return multipleClassesData;
      }}
    />
  );
};
MultipleClasses.meta = {
  name: 'Multiple Classes Per Goal',
};

/**
 * Helper to format date as YYYY-MM-DD
 */
const formatDate = (date: Date): string => date.toISOString().split('T')[0];

/**
 * Helper to get relative date from now
 */
const getRelativeDate = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return formatDate(date);
};

/**
 * All statuses - shows goals with different status states
 */
export const AllStatuses: Story = () => {
  // Dynamic dates relative to current date
  const now = new Date();
  const activeStartDate = getRelativeDate(-30); // Started 30 days ago
  const activeFinalDate = getRelativeDate(60); // Ends in 60 days
  const activeCreatedAt = new Date(
    now.getTime() - 35 * 24 * 60 * 60 * 1000
  ).toISOString();

  const completedStartDate = getRelativeDate(-90); // Started 90 days ago
  const completedFinalDate = getRelativeDate(-30); // Ended 30 days ago
  const completedCreatedAt = new Date(
    now.getTime() - 95 * 24 * 60 * 60 * 1000
  ).toISOString();

  const overdueStartDate = getRelativeDate(-120); // Started 120 days ago
  const overdueFinalDate = getRelativeDate(-60); // Ended 60 days ago (overdue)
  const overdueCreatedAt = new Date(
    now.getTime() - 125 * 24 * 60 * 60 * 1000
  ).toISOString();

  const allStatusesData: GoalsHistoryApiResponse = {
    message: 'Success',
    data: {
      goals: [
        {
          goal: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            title: 'Aula Ativa - Em Andamento',
            startDate: activeStartDate,
            finalDate: activeFinalDate,
            createdAt: activeCreatedAt,
            progress: 50,
            totalLessons: 8,
          },
          subject: {
            id: '550e8400-e29b-41d4-a716-446655440010',
            name: 'Matemática',
          },
          creator: null,
          stats: {
            totalStudents: 30,
            completedCount: 15,
            completionPercentage: 50,
          },
          breakdown: [
            {
              classId: '550e8400-e29b-41d4-a716-446655440030',
              className: 'Turma A',
              schoolId: 'school-1',
              schoolName: 'Escola Estadual',
              studentCount: 30,
              completedCount: 15,
            },
          ],
        },
        {
          goal: {
            id: '550e8400-e29b-41d4-a716-446655440002',
            title: 'Aula Concluída - 100% Completo',
            startDate: completedStartDate,
            finalDate: completedFinalDate,
            createdAt: completedCreatedAt,
            progress: 100,
            totalLessons: 10,
          },
          subject: {
            id: '550e8400-e29b-41d4-a716-446655440011',
            name: 'Física',
          },
          creator: null,
          stats: {
            totalStudents: 25,
            completedCount: 25,
            completionPercentage: 100,
          },
          breakdown: [
            {
              classId: '550e8400-e29b-41d4-a716-446655440031',
              className: 'Turma B',
              schoolId: 'school-1',
              schoolName: 'Escola Estadual',
              studentCount: 25,
              completedCount: 25,
            },
          ],
        },
        {
          goal: {
            id: '550e8400-e29b-41d4-a716-446655440003',
            title: 'Aula Vencida - Prazo Expirado',
            startDate: overdueStartDate,
            finalDate: overdueFinalDate,
            createdAt: overdueCreatedAt,
            progress: 30,
            totalLessons: 12,
          },
          subject: {
            id: '550e8400-e29b-41d4-a716-446655440012',
            name: 'Química',
          },
          creator: null,
          stats: {
            totalStudents: 35,
            completedCount: 10,
            completionPercentage: 30,
          },
          breakdown: [
            {
              classId: '550e8400-e29b-41d4-a716-446655440032',
              className: 'Turma C',
              schoolId: 'school-2',
              schoolName: 'Colégio Municipal',
              studentCount: 35,
              completedCount: 10,
            },
          ],
        },
      ],
      total: 3,
    },
  };

  return (
    <RecommendedLessonsHistory
      {...defaultProps}
      fetchGoalsHistory={async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return allStatusesData;
      }}
    />
  );
};
AllStatuses.meta = {
  name: 'All Status Types',
};

/**
 * Props for Models tab stories - starts on Models tab
 */
const modelsProps: RecommendedLessonsHistoryProps = {
  ...defaultProps,
  defaultTab: GoalPageTab.MODELS,
};

/**
 * Models tab - shows the component with models data
 */
export const ModelsTab: Story = () => (
  <RecommendedLessonsHistory {...modelsProps} />
);
ModelsTab.meta = {
  name: 'Models Tab',
};

/**
 * Models tab empty - shows the models tab with no data
 */
export const ModelsEmpty: Story = () => (
  <RecommendedLessonsHistory
    {...modelsProps}
    fetchGoalModels={async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return emptyModelsResponse;
    }}
  />
);
ModelsEmpty.meta = {
  name: 'Models Tab Empty',
};

/**
 * Models tab loading - shows the models tab in loading state
 */
export const ModelsLoading: Story = () => (
  <RecommendedLessonsHistory
    {...modelsProps}
    fetchGoalModels={() => new Promise(() => {})}
  />
);
ModelsLoading.meta = {
  name: 'Models Tab Loading',
};

/**
 * Models tab error - shows the models tab with error state
 */
export const ModelsError: Story = () => (
  <RecommendedLessonsHistory
    {...modelsProps}
    fetchGoalModels={() =>
      Promise.reject(new Error('Erro ao carregar modelos'))
    }
  />
);
ModelsError.meta = {
  name: 'Models Tab Error',
};
