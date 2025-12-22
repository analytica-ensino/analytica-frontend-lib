import type { Story } from '@ladle/react';
import { useMemo } from 'react';
import { ActivitiesHistory } from './ActivitiesHistory';
import type { ActivitiesHistoryProps } from './ActivitiesHistory';
import {
  ActivityApiStatus,
  ActivityDraftType,
} from '../../types/activitiesHistory';
import type {
  ActivitiesHistoryApiResponse,
  ActivityModelsApiResponse,
  ActivityUserFilterData,
} from '../../types/activitiesHistory';
import { SubjectEnum } from '../../enums/SubjectEnum';

/**
 * Valid UUIDs for mock data
 */
const MOCK_UUIDS = {
  activities: {
    activity1: '11111111-1111-1111-1111-111111111111',
    activity2: '22222222-2222-2222-2222-222222222222',
    activity3: '33333333-3333-3333-3333-333333333333',
    activity4: '44444444-4444-4444-4444-444444444444',
  },
  subjects: {
    math: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    portuguese: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    physics: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    history: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    biology: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  },
  models: {
    model1: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    model2: '00000000-0000-0000-0000-000000000001',
    model3: '00000000-0000-0000-0000-000000000002',
  },
  schools: {
    school1: '00000000-0000-0000-0000-000000000010',
    school2: '00000000-0000-0000-0000-000000000020',
    school3: '00000000-0000-0000-0000-000000000030',
  },
  users: {
    user1: '00000000-0000-0000-0000-000000000100',
  },
};

/**
 * Mock data for activities history
 */
const mockActivitiesResponse: ActivitiesHistoryApiResponse = {
  message: 'Success',
  data: {
    activities: [
      {
        id: MOCK_UUIDS.activities.activity1,
        title: 'Prova de Matemática - Funções do 1º Grau',
        startDate: '2024-11-01',
        finalDate: '2024-12-15',
        status: ActivityApiStatus.A_VENCER,
        completionPercentage: 75,
        subjectId: MOCK_UUIDS.subjects.math,
        schoolName: 'Escola Municipal São Paulo',
        year: '2024',
        className: '9º Ano A',
        subjectName: 'Matemática',
      },
      {
        id: MOCK_UUIDS.activities.activity2,
        title: 'Avaliação de Português - Interpretação de Texto',
        startDate: '2024-10-15',
        finalDate: '2024-11-30',
        status: ActivityApiStatus.VENCIDA,
        completionPercentage: 45,
        subjectId: MOCK_UUIDS.subjects.portuguese,
        schoolName: 'Escola Municipal São Paulo',
        year: '2024',
        className: '8º Ano B',
        subjectName: 'Português',
      },
      {
        id: MOCK_UUIDS.activities.activity3,
        title: 'Exercício de Física - Cinemática',
        startDate: '2024-09-01',
        finalDate: '2024-10-01',
        status: ActivityApiStatus.CONCLUIDA,
        completionPercentage: 100,
        subjectId: MOCK_UUIDS.subjects.physics,
        schoolName: 'Colégio Estadual Central',
        year: '2024',
        className: '1º Ano EM',
        subjectName: 'Física',
      },
      {
        id: MOCK_UUIDS.activities.activity4,
        title: 'Trabalho de História - Revolução Industrial',
        startDate: '2024-11-20',
        finalDate: '2024-12-20',
        status: ActivityApiStatus.A_VENCER,
        completionPercentage: 30,
        subjectId: MOCK_UUIDS.subjects.history,
        schoolName: 'Escola Municipal São Paulo',
        year: '2024',
        className: '7º Ano C',
        subjectName: 'História',
      },
    ],
    pagination: {
      total: 4,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  },
};

/**
 * Mock data for activity models
 */
const mockModelsResponse: ActivityModelsApiResponse = {
  message: 'Success',
  data: {
    activityDrafts: [
      {
        id: MOCK_UUIDS.models.model1,
        type: ActivityDraftType.MODELO,
        title: 'Modelo de Prova Bimestral - Matemática',
        creatorUserInstitutionId: MOCK_UUIDS.users.user1,
        subjectId: MOCK_UUIDS.subjects.math,
        filters: null,
        createdAt: '2024-10-15T10:00:00Z',
        updatedAt: '2024-11-01T14:30:00Z',
      },
      {
        id: MOCK_UUIDS.models.model2,
        type: ActivityDraftType.MODELO,
        title: 'Exercícios de Fixação - Português',
        creatorUserInstitutionId: MOCK_UUIDS.users.user1,
        subjectId: MOCK_UUIDS.subjects.portuguese,
        filters: null,
        createdAt: '2024-09-20T08:00:00Z',
        updatedAt: '2024-10-05T16:45:00Z',
      },
      {
        id: MOCK_UUIDS.models.model3,
        type: ActivityDraftType.MODELO,
        title: 'Avaliação Diagnóstica - Física',
        creatorUserInstitutionId: MOCK_UUIDS.users.user1,
        subjectId: MOCK_UUIDS.subjects.physics,
        filters: null,
        createdAt: '2024-08-01T09:30:00Z',
        updatedAt: '2024-08-15T11:00:00Z',
      },
    ],
    total: 3,
  },
};

/**
 * Mock user filter data
 */
const mockUserFilterData: ActivityUserFilterData = {
  schools: [
    { id: MOCK_UUIDS.schools.school1, name: 'Escola Municipal São Paulo' },
    { id: MOCK_UUIDS.schools.school2, name: 'Colégio Estadual Central' },
    { id: MOCK_UUIDS.schools.school3, name: 'Instituto Federal' },
  ],
  subjects: [
    { id: MOCK_UUIDS.subjects.math, name: 'Matemática' },
    { id: MOCK_UUIDS.subjects.portuguese, name: 'Português' },
    { id: MOCK_UUIDS.subjects.physics, name: 'Física' },
    { id: MOCK_UUIDS.subjects.history, name: 'História' },
    { id: MOCK_UUIDS.subjects.biology, name: 'Biologia' },
  ],
};

/**
 * Map subject name to enum
 */
const mapSubjectNameToEnum = (name: string): SubjectEnum | null => {
  const subjectMap: Record<string, SubjectEnum> = {
    Matemática: SubjectEnum.MATEMATICA,
    Português: SubjectEnum.PORTUGUES,
    Física: SubjectEnum.FISICA,
    História: SubjectEnum.HISTORIA,
    Biologia: SubjectEnum.BIOLOGIA,
    Química: SubjectEnum.QUIMICA,
    Geografia: SubjectEnum.GEOGRAFIA,
  };
  return subjectMap[name] ?? null;
};

/**
 * Default component for stories
 */
const ActivitiesHistoryStory = (
  props: Partial<ActivitiesHistoryProps> & {
    withData?: boolean;
    withModels?: boolean;
  }
) => {
  const { withData = true, withModels = true, ...rest } = props;

  const subjectsMap = useMemo(() => {
    const map = new Map<string, string>();
    map.set(MOCK_UUIDS.subjects.math, 'Matemática');
    map.set(MOCK_UUIDS.subjects.portuguese, 'Português');
    map.set(MOCK_UUIDS.subjects.physics, 'Física');
    map.set(MOCK_UUIDS.subjects.history, 'História');
    return map;
  }, []);

  const fetchActivitiesHistory = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!withData) {
      return {
        message: 'Success',
        data: {
          activities: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        },
      };
    }
    return mockActivitiesResponse;
  };

  const fetchActivityModels = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!withModels) {
      return {
        message: 'Success',
        data: { activityDrafts: [], total: 0 },
      };
    }
    return mockModelsResponse;
  };

  const deleteActivityModel = async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log('Model deleted:', id);
  };

  return (
    <div className="min-h-screen bg-background-100 p-4">
      <ActivitiesHistory
        fetchActivitiesHistory={fetchActivitiesHistory}
        fetchActivityModels={fetchActivityModels}
        deleteActivityModel={deleteActivityModel}
        onCreateActivity={() => console.log('Create activity clicked')}
        onCreateModel={() => console.log('Create model clicked')}
        onRowClick={(row) => console.log('Row clicked:', row)}
        onSendActivity={(model) => console.log('Send activity:', model)}
        onEditModel={(model) => console.log('Edit model:', model)}
        mapSubjectNameToEnum={mapSubjectNameToEnum}
        userFilterData={mockUserFilterData}
        subjectsMap={subjectsMap}
        {...rest}
      />
    </div>
  );
};

/**
 * Default story with data
 */
export const Default: Story = () => <ActivitiesHistoryStory />;

Default.meta = {
  title: 'Default',
};

/**
 * Empty state - no activities
 */
export const EmptyHistory: Story = () => (
  <ActivitiesHistoryStory withData={false} />
);

EmptyHistory.meta = {
  title: 'Empty History',
};

/**
 * Empty state - no models
 */
export const EmptyModels: Story = () => (
  <ActivitiesHistoryStory withModels={false} />
);

EmptyModels.meta = {
  title: 'Empty Models',
};

/**
 * Without optional callbacks
 */
export const WithoutOptionalCallbacks: Story = () => (
  <ActivitiesHistoryStory onSendActivity={undefined} onEditModel={undefined} />
);

WithoutOptionalCallbacks.meta = {
  title: 'Without Optional Callbacks',
};

export default {
  title: 'Activities History',
};
