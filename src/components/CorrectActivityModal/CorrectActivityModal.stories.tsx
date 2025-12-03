import { useState } from 'react';
import type { Story } from '@ladle/react';
import CorrectActivityModal from './CorrectActivityModal';
import Button from '../Button/Button';
import { QUESTION_STATUS } from '../../types/studentActivityCorrection';
import type { StudentActivityCorrectionData } from '../../types/studentActivityCorrection';

/**
 * Mock data without alternatives (essay questions)
 */
const mockDataWithoutAlternatives: StudentActivityCorrectionData = {
  studentId: 'student-123',
  studentName: 'João Silva',
  score: 8.5,
  correctCount: 5,
  incorrectCount: 2,
  blankCount: 1,
  questions: [
    {
      questionNumber: 1,
      status: QUESTION_STATUS.CORRETA,
      studentAnswer: 'Resposta dissertativa do aluno',
      correctAnswer: 'Resposta esperada',
    },
    {
      questionNumber: 2,
      status: QUESTION_STATUS.INCORRETA,
      studentAnswer: 'Resposta incorreta',
      correctAnswer: 'Resposta correta esperada',
    },
    {
      questionNumber: 3,
      status: QUESTION_STATUS.EM_BRANCO,
      studentAnswer: undefined,
      correctAnswer: 'Resposta esperada',
    },
  ],
  observation: 'Observação anterior do professor sobre o desempenho do aluno.',
};

/**
 * Mock data with multiple choice alternatives
 */
const mockDataWithAlternatives: StudentActivityCorrectionData = {
  studentId: 'student-456',
  studentName: 'Maria Santos',
  score: 7.5,
  correctCount: 3,
  incorrectCount: 1,
  blankCount: 1,
  questions: [
    {
      questionNumber: 1,
      status: QUESTION_STATUS.CORRETA,
      studentAnswer: 'A',
      correctAnswer: 'A',
      questionText: 'Qual é a capital do Brasil?',
      alternatives: [
        { value: 'A', label: 'Brasília', isCorrect: true },
        { value: 'B', label: 'São Paulo', isCorrect: false },
        { value: 'C', label: 'Rio de Janeiro', isCorrect: false },
        { value: 'D', label: 'Salvador', isCorrect: false },
      ],
    },
    {
      questionNumber: 2,
      status: QUESTION_STATUS.INCORRETA,
      studentAnswer: 'B',
      correctAnswer: 'C',
      questionText: 'Qual o maior planeta do sistema solar?',
      alternatives: [
        { value: 'A', label: 'Terra', isCorrect: false },
        { value: 'B', label: 'Marte', isCorrect: false },
        { value: 'C', label: 'Júpiter', isCorrect: true },
        { value: 'D', label: 'Saturno', isCorrect: false },
      ],
    },
    {
      questionNumber: 3,
      status: QUESTION_STATUS.CORRETA,
      studentAnswer: 'B',
      correctAnswer: 'B',
      questionText:
        'Qual elemento químico é representado pelo símbolo "O" na tabela periódica?',
      alternatives: [
        { value: 'A', label: 'Ouro', isCorrect: false },
        { value: 'B', label: 'Oxigênio', isCorrect: true },
        { value: 'C', label: 'Osmio', isCorrect: false },
        { value: 'D', label: 'Óganesson', isCorrect: false },
      ],
    },
    {
      questionNumber: 4,
      status: QUESTION_STATUS.EM_BRANCO,
      studentAnswer: undefined,
      correctAnswer: 'D',
      questionText: 'Qual é o resultado de 2 + 2?',
      alternatives: [
        { value: 'A', label: '3', isCorrect: false },
        { value: 'B', label: '5', isCorrect: false },
        { value: 'C', label: '22', isCorrect: false },
        { value: 'D', label: '4', isCorrect: true },
      ],
    },
    {
      questionNumber: 5,
      status: QUESTION_STATUS.CORRETA,
      studentAnswer: 'Resposta dissertativa do aluno sobre o tema.',
      correctAnswer: 'Resposta esperada sobre o tema.',
      questionText: 'Explique o processo de fotossíntese.',
    },
  ],
  observation: undefined,
};

/**
 * Interactive wrapper component for stories
 */
const ModalWrapper = ({
  data,
  isViewOnly = false,
  buttonLabel = 'Abrir Modal',
}: {
  data: StudentActivityCorrectionData;
  isViewOnly?: boolean;
  buttonLabel?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleObservationSubmit = (observation: string, files: File[]) => {
    console.log('Observação enviada:', observation);
    console.log('Arquivos:', files);
  };

  return (
    <div className="p-4">
      <Button onClick={() => setIsOpen(true)}>{buttonLabel}</Button>
      <CorrectActivityModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        data={data}
        isViewOnly={isViewOnly}
        onObservationSubmit={handleObservationSubmit}
      />
    </div>
  );
};

/**
 * Showcase principal: todas as variações do CorrectActivityModal
 */
export const AllVariations: Story = () => (
  <div className="flex flex-col gap-8 p-4">
    <h2 className="font-bold text-3xl text-text-900">CorrectActivityModal</h2>
    <p className="text-text-700">
      Modal para correção de atividades do aluno, exibindo estatísticas,
      questões e permitindo adicionar observações.
    </p>

    <div className="flex flex-col gap-4">
      <h3 className="font-bold text-xl text-text-900">Variações</h3>

      <div className="flex flex-wrap gap-4">
        <ModalWrapper
          data={mockDataWithAlternatives}
          buttonLabel="Com Alternativas"
        />
        <ModalWrapper
          data={mockDataWithoutAlternatives}
          buttonLabel="Sem Alternativas (Dissertativas)"
        />
        <ModalWrapper
          data={mockDataWithAlternatives}
          isViewOnly
          buttonLabel="Modo Visualização"
        />
      </div>
    </div>
  </div>
);

/**
 * Modal com questões de múltipla escolha
 */
export const WithAlternatives: Story = () => (
  <ModalWrapper
    data={mockDataWithAlternatives}
    buttonLabel="Corrigir Atividade"
  />
);

/**
 * Modal com questões dissertativas (sem alternativas)
 */
export const WithoutAlternatives: Story = () => (
  <ModalWrapper
    data={mockDataWithoutAlternatives}
    buttonLabel="Corrigir Atividade"
  />
);

/**
 * Modo somente visualização
 */
export const ViewOnly: Story = () => (
  <ModalWrapper
    data={mockDataWithAlternatives}
    isViewOnly
    buttonLabel="Ver Detalhes"
  />
);

/**
 * Com nota nula
 */
export const NullScore: Story = () => {
  const dataWithNullScore = {
    ...mockDataWithAlternatives,
    score: null,
  };

  return (
    <ModalWrapper data={dataWithNullScore} buttonLabel="Sem Nota Definida" />
  );
};

/**
 * Com observação anterior
 */
export const WithPreviousObservation: Story = () => (
  <ModalWrapper
    data={mockDataWithoutAlternatives}
    buttonLabel="Com Observação Anterior"
  />
);

/**
 * Get question status based on index
 * @param index - Question index
 * @returns Question status
 */
const getQuestionStatusByIndex = (index: number) => {
  const statusMap = [
    QUESTION_STATUS.CORRETA,
    QUESTION_STATUS.INCORRETA,
    QUESTION_STATUS.EM_BRANCO,
  ];
  return statusMap[index % 3];
};

/**
 * Muitas questões
 */
export const ManyQuestions: Story = () => {
  const dataWithManyQuestions: StudentActivityCorrectionData = {
    ...mockDataWithAlternatives,
    questions: Array.from({ length: 15 }, (_, i) => ({
      questionNumber: i + 1,
      status: getQuestionStatusByIndex(i),
      studentAnswer: i % 3 === 2 ? undefined : 'A',
      correctAnswer: 'A',
      questionText: `Questão ${i + 1}: Lorem ipsum dolor sit amet?`,
      alternatives: [
        { value: 'A', label: 'Alternativa A', isCorrect: true },
        { value: 'B', label: 'Alternativa B', isCorrect: false },
        { value: 'C', label: 'Alternativa C', isCorrect: false },
        { value: 'D', label: 'Alternativa D', isCorrect: false },
      ],
    })),
  };

  return (
    <ModalWrapper data={dataWithManyQuestions} buttonLabel="15 Questões" />
  );
};

/**
 * Nota perfeita
 */
export const PerfectScore: Story = () => {
  const perfectScoreData: StudentActivityCorrectionData = {
    ...mockDataWithAlternatives,
    score: 10,
    correctCount: 5,
    incorrectCount: 0,
    blankCount: 0,
    questions: mockDataWithAlternatives.questions.map((q) => ({
      ...q,
      status: QUESTION_STATUS.CORRETA,
      studentAnswer: q.correctAnswer,
    })),
  };

  return <ModalWrapper data={perfectScoreData} buttonLabel="Nota 10" />;
};
