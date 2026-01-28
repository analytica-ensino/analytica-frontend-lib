import type { Story } from '@ladle/react';
import { useState } from 'react';
import { StudentPerformanceDetailsModal } from './StudentPerformanceDetailsModal';
import Button from '../Button/Button';
import Text from '../Text/Text';
import type { StudentPerformanceDetailsData } from './types';

/**
 * Complete mock data with all fields
 */
const mockCompleteData: StudentPerformanceDetailsData = {
  studentName: 'Fernanda Rocha',
  grade: {
    value: 9,
    performanceLabel: 'Acima da média',
  },
  correctQuestions: {
    value: 8,
    bestResultTopic: 'Fotossíntese',
  },
  incorrectQuestions: {
    value: 7,
    hardestTopic: 'Células',
  },
  activitiesCompleted: 10,
  contentsCompleted: 2,
  questionsAnswered: 40,
  accessCount: '15',
  timeOnline: '02:30:45',
  lastLogin: '25/01/2024 • 14:30h',
  activities: [
    {
      id: '1',
      name: 'Atividade 1 - Fotossíntese',
      correctCount: 30,
      totalCount: 50,
      hasNoData: false,
      description:
        'Atividade sobre o processo de fotossíntese nas plantas. Aborda a conversão de luz solar em energia química.',
    },
    {
      id: '2',
      name: 'Atividade 2 - Células',
      correctCount: 15,
      totalCount: 30,
      hasNoData: false,
      description:
        'Estudo da estrutura celular, organelas e suas funções no metabolismo celular.',
    },
    {
      id: '3',
      name: 'Atividade 3 - Genética',
      correctCount: 0,
      totalCount: 0,
      hasNoData: true,
      description: 'Introdução aos conceitos de hereditariedade e DNA.',
    },
  ],
};

/**
 * Mock data with placeholder values for unavailable metrics
 */
const mockPartialData: StudentPerformanceDetailsData = {
  studentName: 'João Silva',
  grade: {
    value: 7.5,
    performanceLabel: 'Na média',
  },
  correctQuestions: {
    value: 5,
    bestResultTopic: null,
  },
  incorrectQuestions: {
    value: 3,
    hardestTopic: null,
  },
  activitiesCompleted: '--',
  contentsCompleted: '--',
  questionsAnswered: '--',
  accessCount: '--',
  timeOnline: '--',
  lastLogin: '--',
  activities: [],
};

/**
 * Mock data for below average student
 */
const mockBelowAverageData: StudentPerformanceDetailsData = {
  studentName: 'Carlos Santos',
  grade: {
    value: 4.5,
    performanceLabel: 'Abaixo da média',
  },
  correctQuestions: {
    value: 3,
    bestResultTopic: 'Ecologia',
  },
  incorrectQuestions: {
    value: 12,
    hardestTopic: 'Biologia Molecular',
  },
  activitiesCompleted: 3,
  contentsCompleted: 1,
  questionsAnswered: 15,
  accessCount: '5',
  timeOnline: '00:45:30',
  lastLogin: '20/01/2024 • 09:15h',
  activities: [
    {
      id: '1',
      name: 'Atividade 1 - Ecologia',
      correctCount: 8,
      totalCount: 20,
      hasNoData: false,
      description:
        'Estudo das relações entre os seres vivos e o meio ambiente.',
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
        Student Performance Details Modal
      </Text>
      <Text as="p" className="text-text-700">
        Modal para exibição detalhada do desempenho do aluno
      </Text>

      <div className="flex flex-wrap gap-4">
        <Button onClick={() => openModal('complete')}>Dados Completos</Button>
        <Button onClick={() => openModal('partial')}>Dados Parciais</Button>
        <Button onClick={() => openModal('below')}>
          Aluno Abaixo da Média
        </Button>
        <Button onClick={() => openModal('loading')}>Estado de Loading</Button>
        <Button onClick={() => openModal('error')}>Estado de Erro</Button>
      </div>

      <StudentPerformanceDetailsModal
        isOpen={openModals['complete'] || false}
        onClose={() => closeModal('complete')}
        data={mockCompleteData}
      />

      <StudentPerformanceDetailsModal
        isOpen={openModals['partial'] || false}
        onClose={() => closeModal('partial')}
        data={mockPartialData}
      />

      <StudentPerformanceDetailsModal
        isOpen={openModals['below'] || false}
        onClose={() => closeModal('below')}
        data={mockBelowAverageData}
      />

      <StudentPerformanceDetailsModal
        isOpen={openModals['loading'] || false}
        onClose={() => closeModal('loading')}
        data={null}
        loading={true}
      />

      <StudentPerformanceDetailsModal
        isOpen={openModals['error'] || false}
        onClose={() => closeModal('error')}
        data={null}
        error="Erro ao carregar os dados do aluno. Tente novamente."
      />
    </div>
  );
};

/**
 * Modal with complete student data
 */
export const CompleteData: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal - Dados Completos
      </Button>
      <StudentPerformanceDetailsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        data={mockCompleteData}
      />
    </>
  );
};

/**
 * Modal with partial data (placeholders)
 */
export const PartialData: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal - Dados Parciais
      </Button>
      <StudentPerformanceDetailsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        data={mockPartialData}
      />
    </>
  );
};

/**
 * Modal showing below average student
 */
export const BelowAverageStudent: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal - Aluno Abaixo da Média
      </Button>
      <StudentPerformanceDetailsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        data={mockBelowAverageData}
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
      <StudentPerformanceDetailsModal
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
      <StudentPerformanceDetailsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        data={null}
        error="Erro ao carregar os dados do aluno. Tente novamente."
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
      <StudentPerformanceDetailsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        data={mockCompleteData}
        labels={{
          title: 'Performance do Estudante',
          gradeLabel: 'PONTUAÇÃO',
          activitiesProgressTitle: 'Progresso nas Atividades',
          noDataMessage: 'Atividade pendente',
        }}
      />
    </>
  );
};
