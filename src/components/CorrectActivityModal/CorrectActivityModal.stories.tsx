import { useState } from 'react';
import type { Story } from '@ladle/react';
import CorrectActivityModal from './CorrectActivityModal';
import Button from '../Button/Button';
import {
  type StudentActivityCorrectionData,
  type SaveQuestionCorrectionPayload,
  type QuestionsAnswersByStudentResponse,
  convertApiResponseToCorrectionData,
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

/**
 * Helper function to create API response mock data
 */
const createApiResponseMock = (
  answers: QuestionResult['answers'],
  statistics: QuestionResult['statistics']
): QuestionsAnswersByStudentResponse => {
  return {
    data: {
      answers,
      statistics,
    },
  };
};

/**
 * Story using new API structure with MULTIPLA_ESCOLHA questions
 * Based on the new API response format
 */
export const WithNewApiStructureMultipleChoice: Story = () => {
  const apiResponse: QuestionsAnswersByStudentResponse = createApiResponseMock(
    [
      {
        id: '019b5890-55bf-7f4a-b939-798c9a59d804',
        questionId: '019b588f-769f-704e-9ce0-e0ced7a5597f',
        answer: null,
        selectedOptions: [],
        answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
        statement: 'Qual é a derivada da função f(x) = x³ + 2x² - 5x + 1?',
        questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
        difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
        solutionExplanation:
          "Aplicando as regras de derivação: f'(x) = 3x² + 4x - 5",
        correctOption: 'Opção incorreta: null',
        createdAt: '2025-12-25T23:50:09.203Z',
        updatedAt: '2025-12-25T23:50:09.203Z',
        knowledgeMatrix: [
          {
            areaKnowledge: {
              id: '019b588e-55ba-72bc-886e-c798aee8e151',
              name: 'Matemática e suas Tecnologias',
            },
            subject: {
              id: '019b588e-5a1d-7b64-954e-c84a81c7ca58',
              name: 'Matemática',
              color: '#ff0000',
              icon: 'math',
            },
            topic: {
              id: '019b588e-5c4b-7e1f-a85f-1c78a8218f3a',
              name: 'Números e Operações',
            },
            subtopic: {
              id: '019b588e-5e7d-7bff-8966-8ac59395f124',
              name: 'Conjuntos Numéricos',
            },
            content: {
              id: '019b588e-60ad-7c90-b3a5-36f51aed6794',
              name: 'Números Reais',
            },
          },
        ],
        teacherFeedback: null,
        attachment: null,
        score: null,
        gradedAt: null,
        gradedBy: null,
        options: [
          {
            id: '019b588f-79ed-7d83-9e25-abbf05a7c166',
            option: "f'(x) = 3x² + 4x - 5",
            isCorrect: true,
          },
          {
            id: '019b588f-7b07-7d13-bea0-de450f2fb1c4',
            option: "f'(x) = x³ + 2x² - 5x",
            isCorrect: false,
          },
          {
            id: '019b588f-7c21-75db-bece-baaa5cff2e00',
            option: "f'(x) = 3x² + 2x - 5",
            isCorrect: false,
          },
          {
            id: '019b588f-7d38-7cbd-a610-f9298289c571',
            option: "f'(x) = x² + 4x - 5",
            isCorrect: false,
          },
        ],
      },
      {
        id: '019b5890-57f5-7e60-88f6-7e8103369007',
        questionId: '019b588f-819b-704b-9f76-b24799520198',
        answer: null,
        selectedOptions: [],
        answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
        statement: 'Qual é o valor de log₂(32)?',
        questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
        difficultyLevel: QUESTION_DIFFICULTY.FACIL,
        solutionExplanation: 'log₂(32) = log₂(2⁵) = 5',
        correctOption: 'Opção incorreta: null',
        createdAt: '2025-12-25T23:50:09.203Z',
        updatedAt: '2025-12-25T23:50:09.203Z',
        knowledgeMatrix: [
          {
            areaKnowledge: {
              id: '019b588e-55ba-72bc-886e-c798aee8e151',
              name: 'Matemática e suas Tecnologias',
            },
            subject: {
              id: '019b588e-5a1d-7b64-954e-c84a81c7ca58',
              name: 'Matemática',
              color: '#ff0000',
              icon: 'math',
            },
            topic: {
              id: '019b588e-5c4b-7e1f-a85f-1c78a8218f3a',
              name: 'Números e Operações',
            },
            subtopic: {
              id: '019b588e-5e7d-7bff-8966-8ac59395f124',
              name: 'Conjuntos Numéricos',
            },
            content: {
              id: '019b588e-60ad-7c90-b3a5-36f51aed6794',
              name: 'Números Reais',
            },
          },
        ],
        teacherFeedback: null,
        attachment: null,
        score: null,
        gradedAt: null,
        gradedBy: null,
        options: [
          {
            id: '019b588f-84e5-7c83-b3aa-2b62bbefdbc6',
            option: '5',
            isCorrect: true,
          },
          {
            id: '019b588f-85fa-7a59-a59a-ba6bfd742a21',
            option: '4',
            isCorrect: false,
          },
          {
            id: '019b588f-8710-716c-8906-1560dbf82683',
            option: '6',
            isCorrect: false,
          },
          {
            id: '019b588f-882c-7e8c-a61f-f6d62a198b30',
            option: '3',
            isCorrect: false,
          },
        ],
      },
    ],
    {
      totalAnswered: 3,
      correctAnswers: 0,
      incorrectAnswers: 0,
      pendingAnswers: 3,
      score: 0,
      timeSpent: 75,
    }
  );

  const correctionData = convertApiResponseToCorrectionData(
    apiResponse,
    'student-api-1',
    'Aluno API Teste'
  );

  return (
    <ModalWrapper
      data={correctionData}
      buttonLabel="Nova Estrutura API - Múltipla Escolha"
    />
  );
};

/**
 * Story using new API structure with ALTERNATIVA questions and selected options
 */
export const WithNewApiStructureAlternatives: Story = () => {
  const apiResponse: QuestionsAnswersByStudentResponse = createApiResponseMock(
    [
      {
        id: '019b919b-692a-7be4-8530-085af1233f80',
        questionId: '019b588f-d31a-7995-8868-34276e784db5',
        answer: null,
        selectedOptions: [
          {
            optionId: '019b588f-d676-790f-996e-99e342bb1890',
          },
        ],
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
        statement: 'Qual é o resultado de (2³)²?',
        questionType: QUESTION_TYPE.ALTERNATIVA,
        difficultyLevel: QUESTION_DIFFICULTY.FACIL,
        solutionExplanation: '(2³)² = 2⁶ = 64',
        correctOption: 'Verificação baseada na opção selecionada',
        createdAt: '2026-01-06T01:40:39.966Z',
        updatedAt: '2026-01-06T04:40:49.791Z',
        knowledgeMatrix: [
          {
            areaKnowledge: {
              id: '019b588e-55ba-72bc-886e-c798aee8e151',
              name: 'Matemática e suas Tecnologias',
            },
            subject: {
              id: '019b588e-5a1d-7b64-954e-c84a81c7ca58',
              name: 'Matemática',
              color: '#ff0000',
              icon: 'math',
            },
            topic: {
              id: '019b588e-5c4b-7e1f-a85f-1c78a8218f3a',
              name: 'Números e Operações',
            },
            subtopic: {
              id: '019b588e-5e7d-7bff-8966-8ac59395f124',
              name: 'Conjuntos Numéricos',
            },
            content: {
              id: '019b588e-60ad-7c90-b3a5-36f51aed6794',
              name: 'Números Reais',
            },
          },
        ],
        teacherFeedback: null,
        attachment: null,
        score: null,
        gradedAt: null,
        gradedBy: null,
        options: [
          {
            id: '019b588f-d676-790f-996e-99e342bb1890',
            option: '64',
            isCorrect: true,
          },
          {
            id: '019b588f-d790-7d34-9dd3-fb1136db7e23',
            option: '32',
            isCorrect: false,
          },
          {
            id: '019b588f-d8aa-7ef7-9633-76c49ee5ed23',
            option: '16',
            isCorrect: false,
          },
          {
            id: '019b588f-d9c3-74a8-8b27-6c3016497dd1',
            option: '128',
            isCorrect: false,
          },
          {
            id: '019b588f-dade-72e7-9dc3-1d13c6f5eefe',
            option: '8',
            isCorrect: false,
          },
        ],
      },
      {
        id: '019b919b-692a-7be4-8530-085bb77f0cc2',
        questionId: '019b588f-c6e9-7685-8681-75a23b6925ab',
        answer: null,
        selectedOptions: [
          {
            optionId: '019b588f-cb5e-7f8e-82c2-744a87fb0307',
          },
        ],
        answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
        statement: 'Qual é a raiz quadrada de 144?',
        questionType: QUESTION_TYPE.ALTERNATIVA,
        difficultyLevel: QUESTION_DIFFICULTY.FACIL,
        solutionExplanation: '√144 = 12',
        correctOption: 'Verificação baseada na opção selecionada',
        createdAt: '2026-01-06T01:40:39.966Z',
        updatedAt: '2026-01-06T04:40:49.797Z',
        knowledgeMatrix: [
          {
            areaKnowledge: {
              id: '019b588e-55ba-72bc-886e-c798aee8e151',
              name: 'Matemática e suas Tecnologias',
            },
            subject: {
              id: '019b588e-5a1d-7b64-954e-c84a81c7ca58',
              name: 'Matemática',
              color: '#ff0000',
              icon: 'math',
            },
            topic: {
              id: '019b588e-5c4b-7e1f-a85f-1c78a8218f3a',
              name: 'Números e Operações',
            },
            subtopic: {
              id: '019b588e-5e7d-7bff-8966-8ac59395f124',
              name: 'Conjuntos Numéricos',
            },
            content: {
              id: '019b588e-60ad-7c90-b3a5-36f51aed6794',
              name: 'Números Reais',
            },
          },
        ],
        teacherFeedback: null,
        attachment: null,
        score: null,
        gradedAt: null,
        gradedBy: null,
        options: [
          {
            id: '019b588f-ca43-70cd-adc9-85e47a28da92',
            option: '12',
            isCorrect: true,
          },
          {
            id: '019b588f-cb5e-7f8e-82c2-744a87fb0307',
            option: '14',
            isCorrect: false,
          },
          {
            id: '019b588f-cc83-7cb5-b50f-d0f698e9a201',
            option: '10',
            isCorrect: false,
          },
          {
            id: '019b588f-cd9e-718a-9b3e-483429b20217',
            option: '16',
            isCorrect: false,
          },
          {
            id: '019b588f-ceb8-79ef-9cd8-9c3ed36d2ed7',
            option: '8',
            isCorrect: false,
          },
        ],
      },
    ],
    {
      totalAnswered: 5,
      correctAnswers: 1,
      incorrectAnswers: 4,
      pendingAnswers: 0,
      score: 20,
      timeSpent: 0,
    }
  );

  const correctionData = convertApiResponseToCorrectionData(
    apiResponse,
    'student-api-2',
    'Aluno API Alternativas'
  );

  return (
    <ModalWrapper
      data={correctionData}
      buttonLabel="Nova Estrutura API - Alternativas"
    />
  );
};

/**
 * Story using new API structure with DISSERTATIVA questions
 */
export const WithNewApiStructureDissertative: Story = () => {
  const apiResponse: QuestionsAnswersByStudentResponse = createApiResponseMock(
    [
      {
        id: '019b919b-692a-7be4-8530-085af1233f80',
        questionId: '019b588f-d31a-7995-8868-34276e784db5',
        answer:
          'A fotossíntese é o processo pelo qual as plantas convertem luz solar, água e dióxido de carbono em glicose e oxigênio.',
        selectedOptions: [],
        answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
        statement:
          'Explique o processo de fotossíntese e sua importância para os seres vivos.',
        questionType: QUESTION_TYPE.DISSERTATIVA,
        difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
        solutionExplanation:
          'A fotossíntese é fundamental para a vida na Terra, pois produz oxigênio e serve como base da cadeia alimentar.',
        correctOption: '',
        createdAt: '2026-01-06T01:40:39.966Z',
        updatedAt: '2026-01-06T04:40:49.791Z',
        knowledgeMatrix: [
          {
            areaKnowledge: {
              id: '019b588e-55ba-72bc-886e-c798aee8e151',
              name: 'Ciências da Natureza',
            },
            subject: {
              id: '019b588e-5a1d-7b64-954e-c84a81c7ca58',
              name: 'Biologia',
              color: '#00ff00',
              icon: 'biology',
            },
            topic: {
              id: '019b588e-5c4b-7e1f-a85f-1c78a8218f3a',
              name: 'Fisiologia Vegetal',
            },
            subtopic: {
              id: '019b588e-5e7d-7bff-8966-8ac59395f124',
              name: 'Fotossíntese',
            },
            content: {
              id: '019b588e-60ad-7c90-b3a5-36f51aed6794',
              name: 'Processo Fotossintético',
            },
          },
        ],
        teacherFeedback: null,
        attachment: null,
        score: null,
        gradedAt: null,
        gradedBy: null,
        options: [],
      },
      {
        id: '019b919b-692a-7be4-8530-085bb77f0cc2',
        questionId: '019b588f-c6e9-7685-8681-75a23b6925ab',
        answer:
          'A Revolução Industrial trouxe mudanças tecnológicas significativas.',
        selectedOptions: [],
        answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
        statement:
          'Analise o impacto da Revolução Industrial na sociedade moderna.',
        questionType: QUESTION_TYPE.DISSERTATIVA,
        difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
        solutionExplanation:
          'A Revolução Industrial transformou a sociedade, economia e modo de vida das pessoas.',
        correctOption: '',
        createdAt: '2026-01-06T01:40:39.966Z',
        updatedAt: '2026-01-06T04:40:49.797Z',
        knowledgeMatrix: [
          {
            areaKnowledge: {
              id: '019b588e-55ba-72bc-886e-c798aee8e151',
              name: 'Ciências Humanas',
            },
            subject: {
              id: '019b588e-5a1d-7b64-954e-c84a81c7ca58',
              name: 'História',
              color: '#0000ff',
              icon: 'history',
            },
            topic: {
              id: '019b588e-5c4b-7e1f-a85f-1c78a8218f3a',
              name: 'História Moderna',
            },
            subtopic: {
              id: '019b588e-5e7d-7bff-8966-8ac59395f124',
              name: 'Revolução Industrial',
            },
            content: {
              id: '019b588e-60ad-7c90-b3a5-36f51aed6794',
              name: 'Impactos Sociais',
            },
          },
        ],
        teacherFeedback: null,
        attachment: null,
        score: null,
        gradedAt: null,
        gradedBy: null,
        options: [],
      },
    ],
    {
      totalAnswered: 2,
      correctAnswers: 0,
      incorrectAnswers: 0,
      pendingAnswers: 2,
      score: 0,
      timeSpent: 120,
    }
  );

  const correctionData = convertApiResponseToCorrectionData(
    apiResponse,
    'student-api-3',
    'Aluno API Dissertativas'
  );

  return (
    <ModalWrapper
      data={correctionData}
      buttonLabel="Nova Estrutura API - Dissertativas"
    />
  );
};
