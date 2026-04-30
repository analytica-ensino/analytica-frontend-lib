import type { Story } from '@ladle/react';
import { useState } from 'react';
import { SimulatedSubjectMenu } from './SimulatedSubjectMenu';
import type {
  SimulatedSubjectItem,
  SimulatedSubjectsApiClient,
  SimulatedSubjectsApiResponse,
} from './types';

const allSubjects: SimulatedSubjectItem[] = [
  { id: 'math', name: 'Matematica', color: '#22C55E', icon: 'calculator' },
  { id: 'lang', name: 'Linguagens', color: '#3B82F6', icon: 'book-open' },
  { id: 'human', name: 'Humanas', color: '#F59E0B', icon: 'users' },
];

function createApi(delay = 500): SimulatedSubjectsApiClient {
  return {
    get: async function <T>(url: string): Promise<{ data: T }> {
      await new Promise((resolve) => setTimeout(resolve, delay));
      const areaKnowledgeId = url.split('areaKnowledgeId=')[1];
      const data = areaKnowledgeId
        ? allSubjects.filter((subject) =>
            areaKnowledgeId === 'area-exatas'
              ? ['math'].includes(subject.id)
              : ['lang', 'human'].includes(subject.id)
          )
        : allSubjects;

      const response: SimulatedSubjectsApiResponse = {
        message: 'ok',
        data,
      };

      return { data: response as T };
    },
  };
}

function StoryContainer({
  areaKnowledgeId,
  loading = false,
}: {
  areaKnowledgeId: string | null;
  loading?: boolean;
}) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  return (
    <div className="max-w-xl flex flex-col gap-3">
      <SimulatedSubjectMenu
        api={createApi()}
        areaKnowledgeId={areaKnowledgeId}
        selectedSubjectId={selectedSubjectId}
        onSubjectChange={setSelectedSubjectId}
        loading={loading}
      />
      <div className="text-sm text-text-700">
        Disciplina selecionada: {selectedSubjectId ?? 'all'}
      </div>
    </div>
  );
}

export const Default: Story = () => <StoryContainer areaKnowledgeId={null} />;

export const FilteredByArea: Story = () => (
  <StoryContainer areaKnowledgeId="area-exatas" />
);

export const ExternalLoading: Story = () => (
  <StoryContainer areaKnowledgeId={null} loading={true} />
);
