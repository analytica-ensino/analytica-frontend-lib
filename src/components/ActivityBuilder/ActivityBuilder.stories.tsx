import type { Story } from '@ladle/react';
import { useState, useCallback } from 'react';
import { ActivityBuilder } from './ActivityBuilder';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import type { PreviewQuestion } from '../ActivityPreview/ActivityPreview';
import type { Question } from '../../types/questions';

// Mock apiClient used in stories to simulate API responses
const mockApiClient = {
  get: async (url: string) => {
    if (url === '/questions/exam-institutions') {
      return {
        data: {
          data: mockBanks.flatMap((bank, index) => {
            const years = mockBankYears.filter((y) => y.bankId === bank.id);
            return years.map((year, yearIdx) => ({
              questionBankName: bank.examInstitution,
              questionBankYearId: `${index}-${yearIdx}`,
              year: year.name,
              questionsCount: 100,
            }));
          }),
        },
      };
    }

    if (url === '/knowledge/subjects') {
      return { data: { data: mockKnowledgeAreas } };
    }

    if (url === '/questions/types') {
      return {
        data: {
          data: {
            questionTypes: [
              'ALTERNATIVA',
              'DISSERTATIVA',
              'MULTIPLA_ESCOLHA',
              'VERDADEIRO_FALSO',
            ],
          },
        },
      };
    }

    return { data: { data: [] } };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: async (url: string, body: any) => {
    if (url === '/knowledge/topics') {
      return { data: { data: mockTopics } };
    }

    if (url === '/knowledge/subtopics') {
      return { data: { data: mockSubtopics } };
    }

    if (url === '/knowledge/contents') {
      return { data: { data: mockContents } };
    }

    if (url === '/questions/list') {
      const page = body.page || 1;
      const pageSize = body.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedQuestions = mockQuestions.slice(startIndex, endIndex);

      return {
        data: {
          data: {
            questions: paginatedQuestions,
            pagination: {
              page,
              pageSize,
              total: mockQuestions.length,
              totalPages: Math.ceil(mockQuestions.length / pageSize),
              hasNext: endIndex < mockQuestions.length,
              hasPrevious: page > 1,
            },
          },
        },
      };
    }

    return { data: { data: [] } };
  },
  put: async () => ({ data: {} }),
  delete: async () => ({ data: {} }),
  patch: async () => ({ data: {} }),
};

// Mock data
const mockBanks = [
  { examInstitution: 'ENEM', id: 'enem', name: 'ENEM' },
  { examInstitution: 'FUVEST', id: 'fuvest', name: 'FUVEST' },
  { examInstitution: 'UNICAMP', id: 'unicamp', name: 'UNICAMP' },
];

const mockBankYears = [
  { id: 'year-2023-enem', name: '2023', bankId: 'enem' },
  { id: 'year-2022-enem', name: '2022', bankId: 'enem' },
  { id: 'year-2023-fuvest', name: '2023', bankId: 'fuvest' },
];

const mockKnowledgeAreas = [
  {
    id: 'matematica',
    name: 'Matemática',
    color: '#0066b8',
    icon: 'MathOperations',
  },
  {
    id: 'portugues',
    name: 'Português',
    color: '#00a651',
    icon: 'ChatPT',
  },
];

const mockTopics = [
  { id: 'tema-1', name: 'Álgebra' },
  { id: 'tema-2', name: 'Geometria' },
];

const mockSubtopics = [
  { id: 'subtema-1', name: 'Equações do 1º grau' },
  { id: 'subtema-2', name: 'Triângulos' },
];

const mockContents = [
  { id: 'assunto-1', name: 'Resolução de equações lineares' },
  { id: 'assunto-2', name: 'Sistemas de equações' },
];

const mockQuestions: Question[] = Array.from({ length: 25 }, (_, i) => ({
  id: `question-${i + 1}`,
  statement: `Questão ${i + 1}: Qual é a resposta correta?`,
  description: null,
  questionType: QUESTION_TYPE.ALTERNATIVA,
  status: 'APROVADO' as any,
  difficultyLevel: 'MEDIO' as any,
  questionBankYearId: 'year-2023-enem',
  solutionExplanation: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  knowledgeMatrix: [
    {
      subject: {
        id: 'matematica',
        name: 'Matemática',
        color: '#0066b8',
        icon: 'MathOperations',
      },
      topic: { id: 'tema-1', name: 'Álgebra' },
      subtopic: { id: 'subtema-1', name: 'Equações do 1º grau' },
    },
  ],
  options: [
    { id: `opt-${i}-1`, option: 'Opção A' },
    { id: `opt-${i}-2`, option: 'Opção B' },
    { id: `opt-${i}-3`, option: 'Opção C' },
    { id: `opt-${i}-4`, option: 'Opção D' },
  ],
}));

export const Default: Story = () => {
  const [questions, setQuestions] = useState<PreviewQuestion[]>([]);

  const handleQuestionsChange = useCallback((newQuestions: PreviewQuestion[]) => {
    setQuestions(newQuestions);
    console.log('Questions changed:', newQuestions);
  }, []);

  const handleDownloadPdf = useCallback(() => {
    console.log('Download PDF clicked');
    alert('Download PDF functionality would be implemented here');
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <ActivityBuilder
        apiClient={mockApiClient}
        onQuestionsChange={handleQuestionsChange}
        onDownloadPdf={handleDownloadPdf}
      />
    </div>
  );
};

export const WithInitialQuestions: Story = () => {
  const initialQuestions: PreviewQuestion[] = [
    {
      id: 'initial-1',
      subjectName: 'Matemática',
      subjectColor: '#0066b8',
      iconName: 'MathOperations',
      questionType: QUESTION_TYPE.ALTERNATIVA,
      enunciado: 'Questão inicial 1',
      question: {
        options: [
          { id: 'opt-1', option: 'Opção A' },
          { id: 'opt-2', option: 'Opção B' },
        ],
      },
    },
    {
      id: 'initial-2',
      subjectName: 'Português',
      subjectColor: '#00a651',
      iconName: 'ChatPT',
      questionType: QUESTION_TYPE.DISSERTATIVA,
      enunciado: 'Questão inicial 2',
    },
  ];

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <ActivityBuilder
        apiClient={mockApiClient}
        initialQuestions={initialQuestions}
      />
    </div>
  );
};

export const WithInstitutionId: Story = () => {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <ActivityBuilder apiClient={mockApiClient} institutionId="inst-123" />
    </div>
  );
};

export const WithAllowedQuestionTypes: Story = () => {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <ActivityBuilder
        apiClient={mockApiClient}
        allowedQuestionTypes={[
          QUESTION_TYPE.ALTERNATIVA,
          QUESTION_TYPE.MULTIPLA_ESCOLHA,
        ]}
      />
    </div>
  );
};

Default.storyName = 'Default';
WithInitialQuestions.storyName = 'With Initial Questions';
WithInstitutionId.storyName = 'With Institution ID';
WithAllowedQuestionTypes.storyName = 'With Allowed Question Types';



