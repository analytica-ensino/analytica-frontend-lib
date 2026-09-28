import type { Story } from '@ladle/react';
import { LessonCardPreview } from './LessonCardPreview';
import { useTheme } from '@/index';

const subject = { name: 'Biologia', color: '#5E8D17', icon: 'Leaf' };
const trail = [
  'Ciências da Natureza',
  'Biologia',
  'Ecologia',
  'Ecossistemas Aquáticos',
];

export const Default: Story = () => {
  const { isDark } = useTheme();

  return (
    <div className="p-6 flex flex-col gap-2 max-w-md">
      {[1, 2, 3].map((position) => (
        <LessonCardPreview
          key={position}
          value={`lesson-${position}`}
          position={position}
          title="Estratégias para Preservação de Ecossistemas Aquáticos"
          subject={subject}
          trail={trail}
          isDark={isDark}
          showDragHandle
          onWatch={() => undefined}
          onRemove={() => undefined}
        />
      ))}
    </div>
  );
};

export const Expanded: Story = () => {
  const { isDark } = useTheme();

  return (
    <div className="p-6 max-w-md">
      <LessonCardPreview
        value="lesson-expanded"
        position={1}
        title="Estratégias para Preservação de Ecossistemas Aquáticos"
        subject={subject}
        trail={trail}
        isDark={isDark}
        defaultExpanded
        showDragHandle
        onWatch={() => undefined}
        onRemove={() => undefined}
      />
    </div>
  );
};

export const WithoutSubject: Story = () => (
  <div className="p-6 max-w-md">
    <LessonCardPreview
      position={1}
      title="Aula sem matéria vinculada"
      onWatch={() => undefined}
    />
  </div>
);
