import type { Story } from '@ladle/react';
import { useState } from 'react';
import { StudentLessonProgressModal } from './StudentLessonProgressModal';
import Button from '../Button/Button';
import Text from '../Text/Text';
import type { StudentLessonProgressData } from './types';

/**
 * Complete mock data matching Figma design with nested structure
 */
const mockCompleteData: StudentLessonProgressData = {
  name: 'Lucas Oliveira',
  overallCompletionRate: 90,
  bestResult: 'Fotossíntese',
  biggestDifficulty: 'Células',
  lessonProgress: [
    {
      id: '1',
      topic: 'Cinemática',
      progress: 70,
      status: 'in_progress',
      children: [
        {
          id: '1-1',
          topic: 'Aspectos iniciais',
          progress: 70,
          status: 'in_progress',
          children: [
            {
              id: '1-1-1',
              topic: 'Fundamentos do Movimento Uniforme: Conceitos Essenciais',
              progress: 70,
              status: 'in_progress',
            },
            {
              id: '1-1-2',
              topic: 'Movimento Uniforme: Definições e Exemplos Reais',
              progress: 70,
              status: 'in_progress',
            },
            {
              id: '1-1-3',
              topic:
                'Explorando o Movimento Uniforme: Sua Relevância na Física',
              progress: 70,
              status: 'in_progress',
            },
          ],
        },
        {
          id: '1-2',
          topic: 'Movimento uniforme',
          progress: 70,
          status: 'in_progress',
        },
        {
          id: '1-3',
          topic: 'Movimento uniformemente variado',
          progress: 70,
          status: 'in_progress',
        },
      ],
    },
    {
      id: '2',
      topic: 'Grandezas físicas',
      progress: null,
      status: 'no_data',
    },
    {
      id: '3',
      topic: 'Mecânica e fluidos',
      progress: 70,
      status: 'in_progress',
    },
    {
      id: '4',
      topic: 'Mecânica',
      progress: 70,
      status: 'in_progress',
    },
    {
      id: '5',
      topic: 'Ondulatória',
      progress: 70,
      status: 'in_progress',
    },
  ],
};

/**
 * Flat structure mock data (simulating current API response)
 */
const mockFlatData: StudentLessonProgressData = {
  name: 'João Silva',
  overallCompletionRate: 75.5,
  bestResult: 'Frações',
  biggestDifficulty: 'Geometria Espacial',
  lessonProgress: [
    {
      id: '1',
      topic: 'Números Inteiros',
      progress: 100,
      status: 'completed',
    },
    {
      id: '2',
      topic: 'Frações',
      progress: 60,
      status: 'in_progress',
    },
    {
      id: '3',
      topic: 'Geometria Espacial',
      progress: null,
      status: 'no_data',
    },
    {
      id: '4',
      topic: 'Álgebra',
      progress: 85,
      status: 'in_progress',
    },
  ],
};

/**
 * Deterministic progress values for consistent visual testing
 */
const DETERMINISTIC_PROGRESS = [
  85,
  42,
  null,
  100,
  67,
  23,
  null,
  91,
  54,
  78,
  36,
  null,
];

/**
 * Mock data with many items for scroll testing
 */
const mockManyItemsData: StudentLessonProgressData = {
  name: 'Maria Santos',
  overallCompletionRate: 65,
  bestResult: 'Biologia Celular',
  biggestDifficulty: 'Genética',
  lessonProgress: Array.from({ length: 12 }, (_, i) => ({
    id: `topic-${i + 1}`,
    topic: `Tópico ${i + 1} - ${['Biologia', 'Física', 'Química', 'Matemática'][i % 4]}`,
    progress: DETERMINISTIC_PROGRESS[i],
    status: ['completed', 'in_progress', 'no_data'][i % 3] as
      | 'completed'
      | 'in_progress'
      | 'no_data',
  })),
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
      id: '1',
      topic: 'Introdução',
      progress: null,
      status: 'no_data',
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
          Dados Flat (API Atual)
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
 * Modal with flat data (simulating current API response)
 */
export const FlatData: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal - Dados Flat (API Atual)
      </Button>
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
