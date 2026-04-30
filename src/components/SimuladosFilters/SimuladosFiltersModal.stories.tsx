import type { Story } from '@ladle/react';
import { useState } from 'react';
import Button from '../Button/Button';
import { SimuladosFiltersModal } from './SimuladosFiltersModal';
import type {
  ApiClient,
  SimuladosFilters,
  StudentsFilterApiResponse,
  UserAccessDataApiResponse,
} from './types';

function createAccessResponse(): UserAccessDataApiResponse {
  return {
    data: {
      schools: [
        { id: 'school-1', name: 'Escola Centro', institutionId: 'inst-1' },
        { id: 'school-2', name: 'Colégio Alfa', institutionId: 'inst-1' },
      ],
      schoolYears: [
        { id: 'year-1', name: '1 ano', schoolId: 'school-1' },
        { id: 'year-2', name: '2 ano', schoolId: 'school-1' },
        { id: 'year-3', name: '3 ano', schoolId: 'school-2' },
      ],
      classes: [
        {
          id: 'class-1',
          name: 'A',
          schoolId: 'school-1',
          schoolYearId: 'year-1',
        },
        {
          id: 'class-2',
          name: 'B',
          schoolId: 'school-1',
          schoolYearId: 'year-2',
        },
        {
          id: 'class-3',
          name: 'C',
          schoolId: 'school-2',
          schoolYearId: 'year-3',
        },
      ],
    },
  };
}

function createStudentsResponse(): StudentsFilterApiResponse {
  return {
    data: {
      students: [
        {
          id: 'raw-1',
          userInstitutionId: 'student-1',
          name: 'Ana Souza',
          school: { id: 'school-1', name: 'Escola Centro' },
          schoolYear: { id: 'year-1', name: '1 ano' },
          class: { id: 'class-1', name: 'A' },
        },
        {
          id: 'raw-2',
          userInstitutionId: 'student-2',
          name: 'Bruno Lima',
          school: { id: 'school-1', name: 'Escola Centro' },
          schoolYear: { id: 'year-1', name: '1 ano' },
          class: { id: 'class-1', name: 'A' },
        },
      ],
    },
  };
}

function createMockApi(config?: {
  delay?: number;
  failOnGet?: boolean;
  emptyStudents?: boolean;
}): ApiClient {
  const delay = config?.delay ?? 400;

  return {
    get: async function <T>(): Promise<{ data: T }> {
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (config?.failOnGet) {
        throw new Error('Falha ao carregar filtros');
      }

      return { data: createAccessResponse() as T };
    },
    post: async function <T>(): Promise<{ data: T }> {
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (config?.emptyStudents) {
        return { data: { data: { students: [] } } as T };
      }

      return { data: createStudentsResponse() as T };
    },
  };
}

function BaseStory({
  label,
  api,
  initialFilters,
}: {
  label: string;
  api: ApiClient;
  initialFilters?: Partial<SimuladosFilters>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<SimuladosFilters | null>(
    null
  );

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={() => setIsOpen(true)}>{label}</Button>

      <SimuladosFiltersModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onApply={(filters) => {
          setAppliedFilters(filters);
          setIsOpen(false);
        }}
        initialFilters={initialFilters}
        api={api}
      />

      {appliedFilters && (
        <pre className="text-xs p-3 rounded-md bg-background-100 border border-border-200">
          {JSON.stringify(appliedFilters, null, 2)}
        </pre>
      )}
    </div>
  );
}

export const Default: Story = () => (
  <BaseStory label="Abrir filtros de simulados" api={createMockApi()} />
);

export const LoadingState: Story = () => (
  <BaseStory
    label="Abrir com carregamento lento"
    api={createMockApi({ delay: 2500 })}
  />
);

export const EmptyStudents: Story = () => (
  <BaseStory
    label="Abrir sem estudantes"
    api={createMockApi({ emptyStudents: true })}
    initialFilters={{
      schoolIds: ['school-1'],
      schoolYearIds: ['year-1'],
      classIds: ['class-1'],
    }}
  />
);

export const ErrorState: Story = () => (
  <BaseStory
    label="Abrir com erro de filtros"
    api={createMockApi({ failOnGet: true })}
  />
);
