import type { Story } from '@ladle/react';
import { useState } from 'react';
import { StudentLessonProgressModal } from './StudentLessonProgressModal';
import Button from '../Button/Button';
import Text from '../Text/Text';
import type { StudentLessonProgressData, TopicProgressItem } from './types';

/**
 * Complete mock data matching Figma design with nested structure
 * Using the new API structure: topic > subtopics > contents
 */
const mockCompleteData: StudentLessonProgressData = {
  name: 'Lucas Oliveira',
  overallCompletionRate: 90,
  bestResult: 'Fotossíntese',
  biggestDifficulty: 'Células',
  lessonProgress: [
    {
      topic: { id: '1', name: 'Cinemática' },
      progress: 70,
      status: 'in_progress',
      subtopics: [
        {
          subtopic: { id: '1-1', name: 'Aspectos iniciais' },
          progress: 70,
          status: 'in_progress',
          contents: [
            {
              content: {
                id: '1-1-1',
                name: 'Fundamentos do Movimento Uniforme: Conceitos Essenciais',
              },
              progress: 70,
              isCompleted: false,
            },
            {
              content: {
                id: '1-1-2',
                name: 'Movimento Uniforme: Definições e Exemplos Reais',
              },
              progress: 70,
              isCompleted: false,
            },
            {
              content: {
                id: '1-1-3',
                name: 'Explorando o Movimento Uniforme: Sua Relevância na Física',
              },
              progress: 70,
              isCompleted: false,
            },
          ],
        },
        {
          subtopic: { id: '1-2', name: 'Movimento uniforme' },
          progress: 70,
          status: 'in_progress',
          contents: [],
        },
        {
          subtopic: { id: '1-3', name: 'Movimento uniformemente variado' },
          progress: 70,
          status: 'in_progress',
          contents: [],
        },
      ],
    },
    {
      topic: { id: '2', name: 'Grandezas físicas' },
      progress: 0,
      status: 'no_data',
      subtopics: [],
    },
    {
      topic: { id: '3', name: 'Mecânica e fluidos' },
      progress: 70,
      status: 'in_progress',
      subtopics: [],
    },
    {
      topic: { id: '4', name: 'Mecânica' },
      progress: 70,
      status: 'in_progress',
      subtopics: [],
    },
    {
      topic: { id: '5', name: 'Ondulatória' },
      progress: 70,
      status: 'in_progress',
      subtopics: [],
    },
  ],
};

/**
 * Flat structure mock data (topics without nested items)
 */
const mockFlatData: StudentLessonProgressData = {
  name: 'João Silva',
  overallCompletionRate: 75.5,
  bestResult: 'Frações',
  biggestDifficulty: 'Geometria Espacial',
  lessonProgress: [
    {
      topic: { id: '1', name: 'Números Inteiros' },
      progress: 100,
      status: 'completed',
      subtopics: [],
    },
    {
      topic: { id: '2', name: 'Frações' },
      progress: 60,
      status: 'in_progress',
      subtopics: [],
    },
    {
      topic: { id: '3', name: 'Geometria Espacial' },
      progress: 0,
      status: 'no_data',
      subtopics: [],
    },
    {
      topic: { id: '4', name: 'Álgebra' },
      progress: 85,
      status: 'in_progress',
      subtopics: [],
    },
  ],
};

/**
 * Deterministic progress values for consistent visual testing
 */
const DETERMINISTIC_PROGRESS = [85, 42, 0, 100, 67, 23, 0, 91, 54, 78, 36, 0];

/**
 * Mock data with many items for scroll testing
 */
const mockManyItemsData: StudentLessonProgressData = {
  name: 'Maria Santos',
  overallCompletionRate: 65,
  bestResult: 'Biologia Celular',
  biggestDifficulty: 'Genética',
  lessonProgress: Array.from(
    { length: 12 },
    (_, i): TopicProgressItem => ({
      topic: {
        id: `topic-${i + 1}`,
        name: `Tópico ${i + 1} - ${['Biologia', 'Física', 'Química', 'Matemática'][i % 4]}`,
      },
      progress: DETERMINISTIC_PROGRESS[i],
      status: ['completed', 'in_progress', 'no_data'][i % 3] as
        | 'completed'
        | 'in_progress'
        | 'no_data',
      subtopics: [],
    })
  ),
};

/**
 * Mock data with null values
 */
const mockPartialData: StudentLessonProgressData = {
  name: 'Carlos Pereira',
  overallCompletionRate: 0,
  bestResult: null,
  biggestDifficulty: null,
  lessonProgress: [
    {
      topic: { id: '1', name: 'Introdução' },
      progress: 0,
      status: 'no_data',
      subtopics: [],
    },
  ],
};

/**
 * Showcase principal: todas as variações do modal
 */
export const AllVariations: Story = () => {
  const [openModals, setOpenModals] = useState<Record<string, boolean>>({});

  const openModal = (key: string) => {
    setOpenModals((prev) => ({ ...prev, [key]: true }));
  };

  const closeModal = (key: string) => {
    setOpenModals((prev) => ({ ...prev, [key]: false }));
  };

  return (
    <div className="flex flex-col gap-8">
      <Text as="h2" size="3xl" weight="bold" className="text-text-900">
        Student Lesson Progress Modal
      </Text>
      <Text as="p" className="text-text-700">
        Modal para exibição do progresso de aulas do aluno com estrutura
        aninhada
      </Text>

      <div className="flex flex-wrap gap-4">
        <Button onClick={() => openModal('complete')}>
          Dados Completos (Aninhado)
        </Button>
        <Button onClick={() => openModal('flat')}>
          Dados Flat (Sem aninhamento)
        </Button>
        <Button onClick={() => openModal('many')}>Muitos Itens (Scroll)</Button>
        <Button onClick={() => openModal('partial')}>Dados Parciais</Button>
        <Button onClick={() => openModal('loading')}>Estado de Loading</Button>
        <Button onClick={() => openModal('error')}>Estado de Erro</Button>
      </div>

      <StudentLessonProgressModal
        isOpen={openModals['complete'] || false}
        onClose={() => closeModal('complete')}
        data={mockCompleteData}
      />

      <StudentLessonProgressModal
        isOpen={openModals['flat'] || false}
        onClose={() => closeModal('flat')}
        data={mockFlatData}
      />

      <StudentLessonProgressModal
        isOpen={openModals['many'] || false}
        onClose={() => closeModal('many')}
        data={mockManyItemsData}
      />

      <StudentLessonProgressModal
        isOpen={openModals['partial'] || false}
        onClose={() => closeModal('partial')}
        data={mockPartialData}
      />

      <StudentLessonProgressModal
        isOpen={openModals['loading'] || false}
        onClose={() => closeModal('loading')}
        data={null}
        loading={true}
      />

      <StudentLessonProgressModal
        isOpen={openModals['error'] || false}
        onClose={() => closeModal('error')}
        data={null}
        error="Tente novamente mais tarde."
      />
    </div>
  );
};

/**
 * Modal with complete nested data (matching Figma design)
 */
export const NestedData: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal - Estrutura Aninhada
      </Button>
      <StudentLessonProgressModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        data={mockCompleteData}
      />
    </>
  );
};

/**
 * Modal with flat data (topics without nested items)
 */
export const FlatData: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Abrir Modal - Dados Flat</Button>
      <StudentLessonProgressModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        data={mockFlatData}
      />
    </>
  );
};

/**
 * Modal with many items (scroll testing)
 */
export const ManyItems: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal - Muitos Itens
      </Button>
      <StudentLessonProgressModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        data={mockManyItemsData}
      />
    </>
  );
};

/**
 * Modal with partial data (null values)
 */
export const PartialData: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal - Dados Parciais
      </Button>
      <StudentLessonProgressModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        data={mockPartialData}
      />
    </>
  );
};

/**
 * Modal in loading state
 */
export const LoadingState: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Abrir Modal - Loading</Button>
      <StudentLessonProgressModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        data={null}
        loading={true}
      />
    </>
  );
};

/**
 * Modal in error state
 */
export const ErrorState: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Abrir Modal - Erro</Button>
      <StudentLessonProgressModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        data={null}
        error="Tente novamente mais tarde."
      />
    </>
  );
};

/**
 * Modal with custom labels
 */
export const CustomLabels: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal - Labels Customizadas
      </Button>
      <StudentLessonProgressModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        data={mockCompleteData}
        labels={{
          title: 'Progresso do Estudante',
          completionRateLabel: 'FINALIZADO',
          lessonProgressTitle: 'Progresso por Módulo',
          noDataMessage: 'Aula pendente',
        }}
      />
    </>
  );
};
