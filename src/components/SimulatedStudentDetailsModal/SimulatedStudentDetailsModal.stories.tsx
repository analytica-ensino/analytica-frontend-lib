import type { Story } from '@ladle/react';
import { useState } from 'react';
import Button from '../Button/Button';
import { SimulatedStudentDetailsModal } from './SimulatedStudentDetailsModal';
import type {
  StudentDetailsApiResponse,
  StudentContentsData,
  StudentSubjectsData,
} from './types';
import { ReportSimulationType, SimulatedPerformanceTag } from './types';
import type { BaseApiClient } from '../../types/api';
import { Period } from '../PeriodSelector';

function createSubjectsData(): StudentSubjectsData {
  return {
    student: {
      studentId: 'student-1',
      institutionId: 'inst-1',
      name: 'Maria Silva',
      school: 'Escola Centro',
      schoolYear: '3 ano',
      class: 'A',
      average: 72,
      performance: SimulatedPerformanceTag.ABOVE_AVERAGE,
    },
    subjects: [
      {
        id: 'subject-1',
        name: 'Matematica',
        color: '#22C55E',
        icon: null,
        questionsCount: 12,
        performance: {
          correct: 9,
          incorrect: 3,
          correctPercentage: 75,
        },
      },
      {
        id: 'subject-2',
        name: 'Linguagens',
        color: '#3B82F6',
        icon: null,
        questionsCount: 10,
        performance: {
          correct: 6,
          incorrect: 4,
          correctPercentage: 60,
        },
      },
    ],
    page: 1,
    limit: 20,
    total: 2,
  };
}

function createContentsData(): StudentContentsData {
  return {
    student: {
      studentId: 'student-1',
      institutionId: 'inst-1',
      name: 'Maria Silva',
      school: 'Escola Centro',
      schoolYear: '3 ano',
      class: 'A',
      average: 72,
      performance: SimulatedPerformanceTag.ABOVE_AVERAGE,
    },
    subject: {
      id: 'subject-1',
      name: 'Matematica',
    },
    contents: [
      {
        contentId: 'content-1',
        contentName: 'Geometria Plana',
        bnccCode: 'EM13MAT301',
        questionsCount: 4,
        performance: {
          correct: 3,
          incorrect: 1,
          correctPercentage: 75,
        },
      },
      {
        contentId: 'content-2',
        contentName: 'Funcoes',
        bnccCode: 'EM13MAT401',
        questionsCount: 8,
        performance: {
          correct: 6,
          incorrect: 2,
          correctPercentage: 75,
        },
      },
    ],
    page: 1,
    limit: 20,
    total: 2,
  };
}

function createApi(config?: {
  delay?: number;
  shouldFail?: boolean;
  emptySubjects?: boolean;
  emptyContents?: boolean;
}): BaseApiClient {
  const delay = config?.delay ?? 500;

  return {
    get: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
    post: async function <T>(
      _url: string,
      body?: unknown
    ): Promise<{ data: T }> {
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (config?.shouldFail) {
        throw new Error('Erro ao carregar detalhes do estudante');
      }

      const requestBody = body as { subjectId?: string | null } | undefined;

      let data: StudentDetailsApiResponse['data'];
      if (requestBody?.subjectId) {
        data = config?.emptyContents
          ? { ...createContentsData(), contents: [] }
          : createContentsData();
      } else {
        data = config?.emptySubjects
          ? { ...createSubjectsData(), subjects: [] }
          : createSubjectsData();
      }

      const response: StudentDetailsApiResponse = {
        message: 'ok',
        data,
      };

      return { data: response as T };
    },
    patch: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
    delete: async function <T>(): Promise<{ data: T }> {
      throw new Error('Not implemented');
    },
  };
}

function BaseStory({
  buttonLabel,
  api,
  simulationType = ReportSimulationType.ENEM_1,
}: {
  buttonLabel: string;
  api: BaseApiClient;
  simulationType?: ReportSimulationType;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>{buttonLabel}</Button>
      <SimulatedStudentDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        simulationType={simulationType}
        userInstitutionId="user-inst-1"
        studentName="Maria Silva"
        period={Period.ONE_MONTH}
      />
    </>
  );
}

export const Default: Story = () => (
  <BaseStory buttonLabel="Abrir detalhes do estudante" api={createApi()} />
);

export const LoadingState: Story = () => (
  <BaseStory
    buttonLabel="Abrir com carregamento lento"
    api={createApi({ delay: 3000 })}
  />
);

export const ErrorState: Story = () => (
  <BaseStory
    buttonLabel="Abrir com erro"
    api={createApi({ shouldFail: true })}
  />
);

export const EmptySubjects: Story = () => (
  <BaseStory
    buttonLabel="Abrir sem materias"
    api={createApi({ emptySubjects: true })}
  />
);

export const EmptyContents: Story = () => (
  <BaseStory
    buttonLabel="Abrir sem habilidades"
    api={createApi({ emptyContents: true })}
  />
);
