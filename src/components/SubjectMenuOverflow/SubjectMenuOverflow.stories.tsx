import type { Story } from '@ladle/react';
import { useState } from 'react';
import { SubjectMenuOverflow } from './SubjectMenuOverflow';
import type { SubjectMenuItem } from './types';
import Text from '../Text/Text';

const SUBJECTS: SubjectMenuItem[] = [
  { id: 'arte', name: 'Arte', color: '#EC4899', icon: 'Palette' },
  {
    id: 'edfisica',
    name: 'Ed. Física',
    color: '#22C55E',
    icon: 'PersonSimpleRun',
  },
  {
    id: 'estrangeira',
    name: 'Língua estrangeira',
    color: '#F59E0B',
    icon: 'Translate',
  },
  { id: 'filosofia', name: 'Filosofia', color: '#A855F7', icon: 'Brain' },
  { id: 'geografia', name: 'Geografia', color: '#0EA5E9', icon: 'Globe' },
  { id: 'historia', name: 'História', color: '#F97316', icon: 'Scroll' },
  { id: 'literatura', name: 'Literatura', color: '#6366F1', icon: 'BookOpen' },
  {
    id: 'portugues',
    name: 'Língua Portuguesa',
    color: '#3B82F6',
    icon: 'ChatText',
  },
  {
    id: 'matematica',
    name: 'Matemática',
    color: '#14B8A6',
    icon: 'MathOperations',
  },
  { id: 'quimica', name: 'Química', color: '#EF4444', icon: 'Flask' },
];

function StoryContainer({
  subjects = SUBJECTS,
  loading = false,
  initialSubjectId = null,
}: {
  subjects?: SubjectMenuItem[];
  loading?: boolean;
  initialSubjectId?: string | null;
}) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    initialSubjectId
  );

  return (
    <div className="flex max-w-4xl flex-col gap-3">
      <SubjectMenuOverflow
        subjects={subjects}
        selectedSubjectId={selectedSubjectId}
        onSubjectChange={setSelectedSubjectId}
        loading={loading}
      />
      <Text size="sm" className="text-text-700">
        {`Componente curricular: ${selectedSubjectId ?? 'Todos'}`}
      </Text>
    </div>
  );
}

/** "Todos" leads the strip and is what an untouched report shows. */
export const Default: Story = () => <StoryContainer />;

/** A subject in effect: every panel below the strip narrows to it. */
export const WithSubjectSelected: Story = () => (
  <StoryContainer initialSubjectId="arte" />
);

/** While the subject list is in flight, the strip dims and stops taking clicks. */
export const Loading: Story = () => <StoryContainer loading />;

/**
 * The teacher's Atividades report lists only the subjects of the activities
 * they created, so a teacher who only ever posted Biologia sees one entry.
 */
export const SingleSubject: Story = () => (
  <StoryContainer subjects={[SUBJECTS[0]]} />
);

/** Nothing to offer yet — "Todos" still stands. */
export const NoSubjects: Story = () => <StoryContainer subjects={[]} />;

/** Catalogue entries carry no colour or icon: neutral square, `Shapes` icon. */
export const WithoutColourOrIcon: Story = () => (
  <StoryContainer
    subjects={[
      { id: 's-1', name: 'Sem cor nem ícone', color: null, icon: null },
      ...SUBJECTS.slice(0, 3),
    ]}
  />
);
