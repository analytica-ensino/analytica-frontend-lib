import { useState } from 'react';
import type { Story } from '@ladle/react';
import CorrectActivityModal from './CorrectActivityModal';
import Button from '../Button/Button';
import {
  type StudentActivityCorrectionData,
  type SaveQuestionCorrectionPayload,
} from '../../types/studentActivityCorrection';
import {
  QUESTION_TYPE,
  QUESTION_DIFFICULTY,
  ANSWER_STATUS,
  type Question,
  type QuestionResult,
} from '../Quiz/useQuizStore';

/**
 * Helper function to create a Question in Quiz format
 */
const createQuestion = (
  id: string,
  statement: string,
  questionType: QUESTION_TYPE,
  options?: Array<{ id: string; option: string }>,
  correctOptionIds?: string[]
): Question => {
  return {
    id,
    statement,
    questionType,
    difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
    description: '',
    examBoard: null,
    examYear: null,
    solutionExplanation: null,
    answer: null,
    answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
    options: options || [],
    knowledgeMatrix: [
      {
        areaKnowledge: { id: 'area1', name: 'Área de Conhecimento' },
        subject: {
          id: 'subject1',
          name: 'Matemática',
          color: '#FF6B6B',
          icon: 'Calculator',
        },
        topic: { id: 'topic1', name: 'Tópico' },
        subtopic: { id: 'subtopic1', name: 'Subtópico' },
        content: { id: 'content1', name: 'Conteúdo' },
      },
    ],
    correctOptionIds: correctOptionIds || [],
  };
};

/**
 * Helper function to create a QuestionResult answer in Quiz format
 */
const createQuestionResult = (
  id: string,
  questionId: string,
  answerStatus: ANSWER_STATUS,
  answer: string | null = null,
  selectedOptions: Array<{ optionId: string }> = [],
  options?: Array<{ id: string; option: string; isCorrect: boolean }>,
  teacherFeedback: string | null = null
): QuestionResult['answers'][number] => {
  return {
    id,
    questionId,
    answer,
    selectedOptions,
    answerStatus,
    statement: '',
    questionType: QUESTION_TYPE.ALTERNATIVA,
    difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
    solutionExplanation: null,
    correctOption: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    options: options || [],
    knowledgeMatrix: [],
    teacherFeedback,
    attachment: null,
    score: null,
    gradedAt: null,
    gradedBy: null,
  };
};

/**
 * Mock data with essay questions (dissertativas)
 */
const mockDataWithEssayQuestions: StudentActivityCorrectionData = {
  studentId: 'student-123',
  studentName: 'João Silva',
  score: 8.5,
  correctCount: 2,
  incorrectCount: 1,
  blankCount: 1,
  questions: [
    {
      question: createQuestion(
        'q1',
        'Explique o processo de fotossíntese e sua importância para os seres vivos.',
        QUESTION_TYPE.DISSERTATIVA
      ),
      result: createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        'A fotossíntese é o processo pelo qual as plantas convertem luz solar, água e dióxido de carbono em glicose e oxigênio. É fundamental para a vida na Terra, pois produz o oxigênio que respiramos e serve como base da cadeia alimentar.',
        [],
        [],
        'Excelente resposta! Você demonstrou compreensão completa do processo.'
      ),
      questionNumber: 1,
      correction: {
        isCorrect: true,
        teacherFeedback:
          'Excelente resposta! Você demonstrou compreensão completa do processo.',
      },
    },
    {
      question: createQuestion(
        'q2',
        'Descreva as principais causas da Primeira Guerra Mundial.',
        QUESTION_TYPE.DISSERTATIVA
      ),
      result: createQuestionResult(
        'a2',
        'q2',
        ANSWER_STATUS.RESPOSTA_INCORRETA,
        'A guerra começou por causa de problemas econômicos e disputas territoriais entre os países europeus.',
        [],
        [],
        'Sua resposta está parcialmente correta, mas faltou mencionar o assassinato do arquiduque Francisco Ferdinando e o sistema de alianças.'
      ),
      questionNumber: 2,
      correction: {
        isCorrect: false,
        teacherFeedback:
          'Sua resposta está parcialmente correta, mas faltou mencionar o assassinato do arquiduque Francisco Ferdinando e o sistema de alianças.',
      },
    },
    {
      question: createQuestion(
        'q3',
        'Analise o impacto da Revolução Industrial na sociedade moderna.',
        QUESTION_TYPE.DISSERTATIVA
      ),
      result: createQuestionResult(
        'a3',
        'q3',
        ANSWER_STATUS.PENDENTE_AVALIACAO,
        'A Revolução Industrial trouxe muitas mudanças tecnológicas e melhorias na produção.',
        [],
        [],
        null
      ),
      questionNumber: 3,
      correction: {
        isCorrect: null,
        teacherFeedback: '',
      },
    },
    {
      question: createQuestion(
        'q4',
        'Explique o conceito de sustentabilidade ambiental.',
        QUESTION_TYPE.DISSERTATIVA
      ),
      result: createQuestionResult(
        'a4',
        'q4',
        ANSWER_STATUS.NAO_RESPONDIDO,
        null,
        [],
        [],
        null
      ),
      questionNumber: 4,
    },
  ],
  observation: 'Observação anterior do professor sobre o desempenho do aluno.',
};

/**
 * Mock data with multiple choice alternatives (ALTERNATIVA type)
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
      question: createQuestion(
        'q1',
        'Qual é a capital do Brasil?',
        QUESTION_TYPE.ALTERNATIVA,
        [
          { id: 'opt1', option: 'Brasília' },
          { id: 'opt2', option: 'São Paulo' },
          { id: 'opt3', option: 'Rio de Janeiro' },
          { id: 'opt4', option: 'Salvador' },
        ],
        ['opt1']
      ),
      result: createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [{ optionId: 'opt1' }],
        [
          { id: 'opt1', option: 'Brasília', isCorrect: true },
          { id: 'opt2', option: 'São Paulo', isCorrect: false },
          { id: 'opt3', option: 'Rio de Janeiro', isCorrect: false },
          { id: 'opt4', option: 'Salvador', isCorrect: false },
        ]
      ),
      questionNumber: 1,
    },
    {
      question: createQuestion(
        'q2',
        'Qual o maior planeta do sistema solar?',
        QUESTION_TYPE.ALTERNATIVA,
        [
          { id: 'opt1', option: 'Terra' },
          { id: 'opt2', option: 'Marte' },
          { id: 'opt3', option: 'Júpiter' },
          { id: 'opt4', option: 'Saturno' },
        ],
        ['opt3']
      ),
      result: createQuestionResult(
        'a2',
        'q2',
        ANSWER_STATUS.RESPOSTA_INCORRETA,
        null,
        [{ optionId: 'opt2' }],
        [
          { id: 'opt1', option: 'Terra', isCorrect: false },
          { id: 'opt2', option: 'Marte', isCorrect: false },
          { id: 'opt3', option: 'Júpiter', isCorrect: true },
          { id: 'opt4', option: 'Saturno', isCorrect: false },
        ]
      ),
      questionNumber: 2,
    },
    {
      question: createQuestion(
        'q3',
        'Qual elemento químico é representado pelo símbolo "O" na tabela periódica?',
        QUESTION_TYPE.ALTERNATIVA,
        [
          { id: 'opt1', option: 'Ouro' },
          { id: 'opt2', option: 'Oxigênio' },
          { id: 'opt3', option: 'Osmio' },
          { id: 'opt4', option: 'Óganesson' },
        ],
        ['opt2']
      ),
      result: createQuestionResult(
        'a3',
        'q3',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [{ optionId: 'opt2' }],
        [
          { id: 'opt1', option: 'Ouro', isCorrect: false },
          { id: 'opt2', option: 'Oxigênio', isCorrect: true },
          { id: 'opt3', option: 'Osmio', isCorrect: false },
          { id: 'opt4', option: 'Óganesson', isCorrect: false },
        ]
      ),
      questionNumber: 3,
    },
    {
      question: createQuestion(
        'q4',
        'Qual é o resultado de 2 + 2?',
        QUESTION_TYPE.ALTERNATIVA,
        [
          { id: 'opt1', option: '3' },
          { id: 'opt2', option: '5' },
          { id: 'opt3', option: '22' },
          { id: 'opt4', option: '4' },
        ],
        ['opt4']
      ),
      result: createQuestionResult(
        'a4',
        'q4',
        ANSWER_STATUS.NAO_RESPONDIDO,
        null,
        [],
        [
          { id: 'opt1', option: '3', isCorrect: false },
          { id: 'opt2', option: '5', isCorrect: false },
          { id: 'opt3', option: '22', isCorrect: false },
          { id: 'opt4', option: '4', isCorrect: true },
        ]
      ),
      questionNumber: 4,
    },
  ],
  observation: undefined,
};

/**
 * Mock data with multiple choice questions (MULTIPLA_ESCOLHA type)
 */
const mockDataWithMultipleChoice: StudentActivityCorrectionData = {
  studentId: 'student-789',
  studentName: 'Pedro Oliveira',
  score: 8.0,
  correctCount: 2,
  incorrectCount: 1,
  blankCount: 0,
  questions: [
    {
      question: createQuestion(
        'q1',
        'Quais são os planetas rochosos do sistema solar? (Selecione todas as opções corretas)',
        QUESTION_TYPE.MULTIPLA_ESCOLHA,
        [
          { id: 'opt1', option: 'Mercúrio' },
          { id: 'opt2', option: 'Júpiter' },
          { id: 'opt3', option: 'Vênus' },
          { id: 'opt4', option: 'Saturno' },
          { id: 'opt5', option: 'Terra' },
          { id: 'opt6', option: 'Marte' },
        ],
        ['opt1', 'opt3', 'opt5', 'opt6']
      ),
      result: createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [
          { optionId: 'opt1' },
          { optionId: 'opt3' },
          { optionId: 'opt5' },
          { optionId: 'opt6' },
        ],
        [
          { id: 'opt1', option: 'Mercúrio', isCorrect: true },
          { id: 'opt2', option: 'Júpiter', isCorrect: false },
          { id: 'opt3', option: 'Vênus', isCorrect: true },
          { id: 'opt4', option: 'Saturno', isCorrect: false },
          { id: 'opt5', option: 'Terra', isCorrect: true },
          { id: 'opt6', option: 'Marte', isCorrect: true },
        ]
      ),
      questionNumber: 1,
    },
    {
      question: createQuestion(
        'q2',
        'Quais são os estados físicos da matéria?',
        QUESTION_TYPE.MULTIPLA_ESCOLHA,
        [
          { id: 'opt1', option: 'Sólido' },
          { id: 'opt2', option: 'Plasma' },
          { id: 'opt3', option: 'Líquido' },
          { id: 'opt4', option: 'Gasoso' },
        ],
        ['opt1', 'opt3', 'opt4']
      ),
      result: createQuestionResult(
        'a2',
        'q2',
        ANSWER_STATUS.RESPOSTA_INCORRETA,
        null,
        [{ optionId: 'opt1' }, { optionId: 'opt2' }],
        [
          { id: 'opt1', option: 'Sólido', isCorrect: true },
          { id: 'opt2', option: 'Plasma', isCorrect: false },
          { id: 'opt3', option: 'Líquido', isCorrect: true },
          { id: 'opt4', option: 'Gasoso', isCorrect: true },
        ]
      ),
      questionNumber: 2,
    },
  ],
};

/**
 * Mock data with true or false questions (VERDADEIRO_FALSO type)
 */
const mockDataWithTrueOrFalse: StudentActivityCorrectionData = {
  studentId: 'student-101',
  studentName: 'Ana Costa',
  score: 6.5,
  correctCount: 2,
  incorrectCount: 1,
  blankCount: 0,
  questions: [
    {
      question: createQuestion(
        'q1',
        'Marque Verdadeiro ou Falso para cada afirmação:',
        QUESTION_TYPE.VERDADEIRO_FALSO,
        [
          { id: 'opt1', option: 'A água ferve a 100°C ao nível do mar.' },
          { id: 'opt2', option: 'O sol é uma estrela.' },
          { id: 'opt3', option: 'A Terra é o maior planeta do sistema solar.' },
        ],
        ['opt1', 'opt2']
      ),
      result: createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [{ optionId: 'opt1' }, { optionId: 'opt2' }],
        [
          {
            id: 'opt1',
            option: 'A água ferve a 100°C ao nível do mar.',
            isCorrect: true,
          },
          { id: 'opt2', option: 'O sol é uma estrela.', isCorrect: true },
          {
            id: 'opt3',
            option: 'A Terra é o maior planeta do sistema solar.',
            isCorrect: false,
          },
        ]
      ),
      questionNumber: 1,
    },
    {
      question: createQuestion(
        'q2',
        'Marque Verdadeiro ou Falso:',
        QUESTION_TYPE.VERDADEIRO_FALSO,
        [
          { id: 'opt1', option: 'A fotossíntese produz oxigênio.' },
          { id: 'opt2', option: 'Os répteis são animais de sangue quente.' },
        ],
        ['opt1']
      ),
      result: createQuestionResult(
        'a2',
        'q2',
        ANSWER_STATUS.RESPOSTA_INCORRETA,
        null,
        [{ optionId: 'opt2' }],
        [
          {
            id: 'opt1',
            option: 'A fotossíntese produz oxigênio.',
            isCorrect: true,
          },
          {
            id: 'opt2',
            option: 'Os répteis são animais de sangue quente.',
            isCorrect: false,
          },
        ]
      ),
      questionNumber: 2,
    },
  ],
};

/**
 * Mock data with fill questions (PREENCHER type)
 */
const mockDataWithFillQuestions: StudentActivityCorrectionData = {
  studentId: 'student-303',
  studentName: 'Carlos Mendes',
  score: 7.0,
  correctCount: 2,
  incorrectCount: 1,
  blankCount: 0,
  questions: [
    {
      question: createQuestion(
        'q1',
        'Complete a frase: A capital do Brasil é {{cidade}}.',
        QUESTION_TYPE.PREENCHER
      ),
      result: createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        'Brasília'
      ),
      questionNumber: 1,
    },
    {
      question: createQuestion(
        'q2',
        'Complete: O maior planeta do sistema solar é {{planeta}}.',
        QUESTION_TYPE.PREENCHER
      ),
      result: createQuestionResult(
        'a2',
        'q2',
        ANSWER_STATUS.RESPOSTA_INCORRETA,
        'Terra'
      ),
      questionNumber: 2,
    },
    {
      question: createQuestion(
        'q3',
        'Preencha: A fórmula química da água é {{formula}}.',
        QUESTION_TYPE.PREENCHER
      ),
      result: createQuestionResult(
        'a3',
        'q3',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        'H2O'
      ),
      questionNumber: 3,
    },
  ],
};

/**
 * Mock data with image questions (IMAGEM type)
 */
const mockDataWithImageQuestions: StudentActivityCorrectionData = {
  studentId: 'student-404',
  studentName: 'Fernanda Lima',
  score: 8.0,
  correctCount: 2,
  incorrectCount: 0,
  blankCount: 1,
  questions: [
    {
      question: createQuestion(
        'q1',
        'Identifique o animal na imagem abaixo.',
        QUESTION_TYPE.IMAGEM
      ),
      result: createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        'Cachorro'
      ),
      questionNumber: 1,
    },
    {
      question: createQuestion(
        'q2',
        'Qual é o objeto mostrado na figura?',
        QUESTION_TYPE.IMAGEM
      ),
      result: createQuestionResult(
        'a2',
        'q2',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        'Bicicleta'
      ),
      questionNumber: 2,
    },
    {
      question: createQuestion(
        'q3',
        'Descreva o que você vê na imagem.',
        QUESTION_TYPE.IMAGEM
      ),
      result: createQuestionResult(
        'a3',
        'q3',
        ANSWER_STATUS.NAO_RESPONDIDO,
        null
      ),
      questionNumber: 3,
    },
  ],
};

/**
 * Mock data with mixed question types
 */
const mockDataWithMixedTypes: StudentActivityCorrectionData = {
  studentId: 'student-202',
  studentName: 'Lucas Ferreira',
  score: 8.5,
  correctCount: 4,
  incorrectCount: 1,
  blankCount: 0,
  questions: [
    {
      question: createQuestion(
        'q1',
        'Qual é a fórmula química da água?',
        QUESTION_TYPE.ALTERNATIVA,
        [
          { id: 'opt1', option: 'CO2' },
          { id: 'opt2', option: 'H2O' },
          { id: 'opt3', option: 'NaCl' },
          { id: 'opt4', option: 'O2' },
        ],
        ['opt2']
      ),
      result: createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [{ optionId: 'opt2' }],
        [
          { id: 'opt1', option: 'CO2', isCorrect: false },
          { id: 'opt2', option: 'H2O', isCorrect: true },
          { id: 'opt3', option: 'NaCl', isCorrect: false },
          { id: 'opt4', option: 'O2', isCorrect: false },
        ]
      ),
      questionNumber: 1,
    },
    {
      question: createQuestion(
        'q2',
        'Quais são números primos?',
        QUESTION_TYPE.MULTIPLA_ESCOLHA,
        [
          { id: 'opt1', option: '2' },
          { id: 'opt2', option: '4' },
          { id: 'opt3', option: '7' },
          { id: 'opt4', option: '9' },
        ],
        ['opt1', 'opt3']
      ),
      result: createQuestionResult(
        'a2',
        'q2',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [{ optionId: 'opt1' }, { optionId: 'opt3' }],
        [
          { id: 'opt1', option: '2', isCorrect: true },
          { id: 'opt2', option: '4', isCorrect: false },
          { id: 'opt3', option: '7', isCorrect: true },
          { id: 'opt4', option: '9', isCorrect: false },
        ]
      ),
      questionNumber: 2,
    },
    {
      question: createQuestion(
        'q3',
        'Explique a importância da reciclagem para o meio ambiente.',
        QUESTION_TYPE.DISSERTATIVA
      ),
      result: createQuestionResult(
        'a3',
        'q3',
        ANSWER_STATUS.PENDENTE_AVALIACAO,
        'A reciclagem é importante porque ajuda a reduzir a quantidade de lixo nos aterros sanitários e preserva os recursos naturais.',
        [],
        [],
        null
      ),
      questionNumber: 3,
      correction: {
        isCorrect: null,
        teacherFeedback: '',
      },
    },
    {
      question: createQuestion(
        'q4',
        'Marque Verdadeiro ou Falso:',
        QUESTION_TYPE.VERDADEIRO_FALSO,
        [
          { id: 'opt1', option: 'O Brasil é o maior país da América do Sul.' },
          { id: 'opt2', option: 'A capital do Brasil é São Paulo.' },
        ],
        ['opt1']
      ),
      result: createQuestionResult(
        'a4',
        'q4',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [{ optionId: 'opt1' }],
        [
          {
            id: 'opt1',
            option: 'O Brasil é o maior país da América do Sul.',
            isCorrect: true,
          },
          {
            id: 'opt2',
            option: 'A capital do Brasil é São Paulo.',
            isCorrect: false,
          },
        ]
      ),
      questionNumber: 4,
    },
    {
      question: createQuestion(
        'q5',
        'Descreva o processo de evaporação.',
        QUESTION_TYPE.DISSERTATIVA
      ),
      result: createQuestionResult(
        'a5',
        'q5',
        ANSWER_STATUS.RESPOSTA_INCORRETA,
        'A evaporação acontece quando a água vira vapor.',
        [],
        [],
        'Sua resposta está correta, mas poderia ser mais detalhada. Tente explicar o papel da temperatura e da pressão no processo.'
      ),
      questionNumber: 5,
      correction: {
        isCorrect: false,
        teacherFeedback:
          'Sua resposta está correta, mas poderia ser mais detalhada. Tente explicar o papel da temperatura e da pressão no processo.',
      },
    },
  ],
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

  const handleObservationSubmit = (
    studentId: string,
    observation: string,
    files: File[]
  ) => {
    console.log('Student ID:', studentId);
    console.log('Observação enviada:', observation);
    console.log('Arquivos:', files);
  };

  const handleQuestionCorrectionSubmit = async (
    studentId: string,
    payload: SaveQuestionCorrectionPayload
  ) => {
    console.log('Student ID:', studentId);
    console.log('Correção da questão:', payload);
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Correção salva com sucesso!');
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
        onQuestionCorrectionSubmit={handleQuestionCorrectionSubmit}
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
          buttonLabel="Alternativa (Escolha Única)"
        />
        <ModalWrapper
          data={mockDataWithMultipleChoice}
          buttonLabel="Múltipla Escolha"
        />
        <ModalWrapper
          data={mockDataWithTrueOrFalse}
          buttonLabel="Verdadeiro ou Falso"
        />
        <ModalWrapper
          data={mockDataWithEssayQuestions}
          buttonLabel="Dissertativas"
        />
        <ModalWrapper
          data={mockDataWithFillQuestions}
          buttonLabel="Preencher Lacunas"
        />
        <ModalWrapper
          data={mockDataWithImageQuestions}
          buttonLabel="Questões com Imagem"
        />
        <ModalWrapper
          data={mockDataWithMixedTypes}
          buttonLabel="Tipos Mistos"
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
 * Modal com questões de alternativa (escolha única)
 */
export const WithAlternatives: Story = () => (
  <ModalWrapper
    data={mockDataWithAlternatives}
    buttonLabel="Corrigir Atividade"
  />
);

/**
 * Modal com questões de múltipla escolha
 */
export const WithMultipleChoice: Story = () => (
  <ModalWrapper
    data={mockDataWithMultipleChoice}
    buttonLabel="Corrigir Atividade"
  />
);

/**
 * Modal com questões verdadeiro ou falso
 */
export const WithTrueOrFalse: Story = () => (
  <ModalWrapper
    data={mockDataWithTrueOrFalse}
    buttonLabel="Corrigir Atividade"
  />
);

/**
 * Modal com questões dissertativas (com campos de correção)
 */
export const WithEssayQuestions: Story = () => (
  <ModalWrapper
    data={mockDataWithEssayQuestions}
    buttonLabel="Corrigir Atividade"
  />
);

/**
 * Modal com questões de preencher lacunas
 */
export const WithFillQuestions: Story = () => (
  <ModalWrapper
    data={mockDataWithFillQuestions}
    buttonLabel="Corrigir Atividade"
  />
);

/**
 * Modal com questões de imagem
 */
export const WithImageQuestions: Story = () => (
  <ModalWrapper
    data={mockDataWithImageQuestions}
    buttonLabel="Corrigir Atividade"
  />
);

/**
 * Modal com tipos mistos de questões
 */
export const WithMixedTypes: Story = () => (
  <ModalWrapper
    data={mockDataWithMixedTypes}
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
    data={mockDataWithEssayQuestions}
    buttonLabel="Com Observação Anterior"
  />
);

/**
 * Get question status based on index
 * @param index - Question index
 * @returns Question status
 */
const getQuestionStatusByIndex = (index: number) => {
  const statuses = [
    ANSWER_STATUS.RESPOSTA_CORRETA,
    ANSWER_STATUS.RESPOSTA_INCORRETA,
    ANSWER_STATUS.NAO_RESPONDIDO,
  ];
  return statuses[index % 3];
};

/**
 * Muitas questões
 */
export const ManyQuestions: Story = () => {
  const dataWithManyQuestions: StudentActivityCorrectionData = {
    ...mockDataWithAlternatives,
    questions: Array.from({ length: 15 }, (_, i) => {
      const status = getQuestionStatusByIndex(i);
      return {
        question: createQuestion(
          `q${i + 1}`,
          `Questão ${i + 1}: Lorem ipsum dolor sit amet?`,
          QUESTION_TYPE.ALTERNATIVA,
          [
            { id: 'opt1', option: 'Alternativa A' },
            { id: 'opt2', option: 'Alternativa B' },
            { id: 'opt3', option: 'Alternativa C' },
            { id: 'opt4', option: 'Alternativa D' },
          ],
          ['opt1']
        ),
        result: createQuestionResult(
          `a${i + 1}`,
          `q${i + 1}`,
          status,
          null,
          status === ANSWER_STATUS.NAO_RESPONDIDO ? [] : [{ optionId: 'opt1' }],
          [
            { id: 'opt1', option: 'Alternativa A', isCorrect: true },
            { id: 'opt2', option: 'Alternativa B', isCorrect: false },
            { id: 'opt3', option: 'Alternativa C', isCorrect: false },
            { id: 'opt4', option: 'Alternativa D', isCorrect: false },
          ]
        ),
        questionNumber: i + 1,
      };
    }),
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
      result: createQuestionResult(
        q.result.id,
        q.question.id,
        ANSWER_STATUS.RESPOSTA_CORRETA,
        q.result.answer,
        q.result.selectedOptions,
        q.result.options
      ),
    })),
  };

  return <ModalWrapper data={perfectScoreData} buttonLabel="Nota 10" />;
};
