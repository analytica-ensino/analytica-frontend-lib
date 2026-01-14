import { render, screen } from '@testing-library/react';
import React from 'react';
import { ActivityModelDetails } from './ActivityModelDetails';
import type { ActivityData } from '../../ActivityCreate/ActivityCreate.types';
import { ActivityType } from '../../ActivityCreate/ActivityCreate.types';
import { QUESTION_TYPE } from '../../Quiz/useQuizStore';
import {
  DIFFICULTY_LEVEL_ENUM,
  QUESTION_STATUS_ENUM,
} from '../../../types/questions';

// Mock do componente Text
jest.mock('../../../index', () => ({
  Text: ({
    children,
    className,
    size,
  }: {
    children: React.ReactNode;
    className?: string;
    size?: string;
  }) => (
    <span data-testid="text" data-size={size} className={className}>
      {children}
    </span>
  ),
}));

// Mock do componente ActivityCardQuestionPreview
jest.mock(
  '../../ActivityCardQuestionPreview/ActivityCardQuestionPreview',
  () => ({
    ActivityCardQuestionPreview: ({
      subjectName,
      subjectColor,
      iconName,
      questionType,
      enunciado,
      defaultExpanded,
      question,
      value,
      position,
    }: {
      subjectName: string;
      subjectColor: string;
      iconName: string;
      questionType: QUESTION_TYPE;
      enunciado: string;
      defaultExpanded: boolean;
      question: {
        options: { id: string; option: string }[];
        correctOptionIds: string[];
      };
      value: string;
      position: number;
    }) => (
      <div
        data-testid="activity-card-question-preview"
        data-subject-name={subjectName}
        data-subject-color={subjectColor}
        data-icon-name={iconName}
        data-question-type={questionType}
        data-enunciado={enunciado}
        data-default-expanded={defaultExpanded}
        data-value={value}
        data-position={position}
      >
        <span data-testid="question-options">
          {JSON.stringify(question.options)}
        </span>
        <span data-testid="question-correct-ids">
          {JSON.stringify(question.correctOptionIds)}
        </span>
      </div>
    ),
  })
);

describe('ActivityModelDetails', () => {
  const mockActivityData: ActivityData = {
    id: 'activity-1',
    type: ActivityType.MODELO,
    title: 'Test Activity',
    subjectId: 's1',
    filters: {},
    questionIds: ['q1', 'q2'],
    selectedQuestions: [
      {
        id: 'q1',
        statement: 'Question 1',
        description: null,
        questionType: QUESTION_TYPE.ALTERNATIVA,
        status: QUESTION_STATUS_ENUM.APROVADO,
        difficultyLevel: DIFFICULTY_LEVEL_ENUM.MEDIO,
        questionBankYearId: 'qby1',
        solutionExplanation: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        knowledgeMatrix: [
          {
            subject: {
              id: 's1',
              name: 'Mathematics',
              color: '#FF5733',
              icon: 'Calculator',
            },
          },
        ],
        options: [
          { id: 'opt1', option: 'Option A', correct: true },
          { id: 'opt2', option: 'Option B', correct: false },
        ],
      },
      {
        id: 'q2',
        statement: 'Question 2',
        description: null,
        questionType: QUESTION_TYPE.DISSERTATIVA,
        status: QUESTION_STATUS_ENUM.APROVADO,
        difficultyLevel: DIFFICULTY_LEVEL_ENUM.MEDIO,
        questionBankYearId: 'qby2',
        solutionExplanation: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        knowledgeMatrix: [
          {
            subject: {
              id: 's2',
              name: 'Portuguese',
              color: '#3357FF',
              icon: 'BookOpen',
            },
          },
        ],
        options: [],
      },
    ],
  };

  describe('loading state', () => {
    it('should render loading message when loading is true', () => {
      render(<ActivityModelDetails activityDetails={null} loading={true} />);

      const loadingText = screen.getByText('Carregando detalhes...');
      expect(loadingText).toBeInTheDocument();
    });

    it('should render loading message with correct styles', () => {
      render(<ActivityModelDetails activityDetails={null} loading={true} />);

      const loadingText = screen.getByText('Carregando detalhes...');
      expect(loadingText).toHaveAttribute('data-size', 'sm');
      expect(loadingText.className).toContain('text-text-600');
    });

    it('should not render activity details when loading', () => {
      render(
        <ActivityModelDetails
          activityDetails={mockActivityData}
          loading={true}
        />
      );

      expect(
        screen.queryByTestId('activity-card-question-preview')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('2 questões adicionadas')
      ).not.toBeInTheDocument();
    });
  });

  describe('no details state', () => {
    it('should render no details message when activityDetails is null and not loading', () => {
      render(<ActivityModelDetails activityDetails={null} loading={false} />);

      const noDetailsText = screen.getByText('Nenhum detalhe disponível');
      expect(noDetailsText).toBeInTheDocument();
    });

    it('should render no details message with correct styles', () => {
      render(<ActivityModelDetails activityDetails={null} loading={false} />);

      const noDetailsText = screen.getByText('Nenhum detalhe disponível');
      expect(noDetailsText).toHaveAttribute('data-size', 'sm');
      expect(noDetailsText.className).toContain('text-text-600');
    });

    it('should not render activity details when activityDetails is null', () => {
      render(<ActivityModelDetails activityDetails={null} loading={false} />);

      expect(
        screen.queryByTestId('activity-card-question-preview')
      ).not.toBeInTheDocument();
    });
  });

  describe('with activity details', () => {
    it('should render activity details when provided and not loading', () => {
      render(
        <ActivityModelDetails
          activityDetails={mockActivityData}
          loading={false}
        />
      );

      expect(screen.getByText('2 questões adicionadas')).toBeInTheDocument();
      expect(
        screen.getAllByTestId('activity-card-question-preview')
      ).toHaveLength(2);
    });

    it('should render all questions', () => {
      render(
        <ActivityModelDetails
          activityDetails={mockActivityData}
          loading={false}
        />
      );

      const questionCards = screen.getAllByTestId(
        'activity-card-question-preview'
      );
      expect(questionCards).toHaveLength(2);

      // First question
      expect(questionCards[0]).toHaveAttribute(
        'data-subject-name',
        'Mathematics'
      );
      expect(questionCards[0]).toHaveAttribute('data-subject-color', '#FF5733');
      expect(questionCards[0]).toHaveAttribute('data-icon-name', 'Calculator');
      expect(questionCards[0]).toHaveAttribute(
        'data-question-type',
        QUESTION_TYPE.ALTERNATIVA
      );
      expect(questionCards[0]).toHaveAttribute('data-enunciado', 'Question 1');
      expect(questionCards[0]).toHaveAttribute('data-value', 'q1');
      expect(questionCards[0]).toHaveAttribute('data-position', '1');

      // Second question
      expect(questionCards[1]).toHaveAttribute(
        'data-subject-name',
        'Portuguese'
      );
      expect(questionCards[1]).toHaveAttribute('data-subject-color', '#3357FF');
      expect(questionCards[1]).toHaveAttribute('data-icon-name', 'BookOpen');
      expect(questionCards[1]).toHaveAttribute(
        'data-question-type',
        QUESTION_TYPE.DISSERTATIVA
      );
      expect(questionCards[1]).toHaveAttribute('data-enunciado', 'Question 2');
      expect(questionCards[1]).toHaveAttribute('data-value', 'q2');
      expect(questionCards[1]).toHaveAttribute('data-position', '2');
    });

    it('should render questions with defaultExpanded set to false', () => {
      render(
        <ActivityModelDetails
          activityDetails={mockActivityData}
          loading={false}
        />
      );

      const questionCards = screen.getAllByTestId(
        'activity-card-question-preview'
      );
      questionCards.forEach((card) => {
        expect(card).toHaveAttribute('data-default-expanded', 'false');
      });
    });

    it('should pass correct options to question cards', () => {
      render(
        <ActivityModelDetails
          activityDetails={mockActivityData}
          loading={false}
        />
      );

      const questionCards = screen.getAllByTestId(
        'activity-card-question-preview'
      );

      // First question options
      const firstOptions = JSON.parse(
        questionCards[0].querySelector('[data-testid="question-options"]')!
          .textContent!
      );
      expect(firstOptions).toHaveLength(2);
      expect(firstOptions[0]).toEqual({ id: 'opt1', option: 'Option A' });
      expect(firstOptions[1]).toEqual({ id: 'opt2', option: 'Option B' });

      // Second question options (empty)
      const secondOptions = JSON.parse(
        questionCards[1].querySelector('[data-testid="question-options"]')!
          .textContent!
      );
      expect(secondOptions).toHaveLength(0);
    });

    it('should pass correct correctOptionIds to question cards', () => {
      render(
        <ActivityModelDetails
          activityDetails={mockActivityData}
          loading={false}
        />
      );

      const questionCards = screen.getAllByTestId(
        'activity-card-question-preview'
      );

      // First question correct options
      const firstCorrectIds = JSON.parse(
        questionCards[0].querySelector('[data-testid="question-correct-ids"]')!
          .textContent!
      );
      expect(firstCorrectIds).toEqual(['opt1']);

      // Second question correct options (empty)
      const secondCorrectIds = JSON.parse(
        questionCards[1].querySelector('[data-testid="question-correct-ids"]')!
          .textContent!
      );
      expect(secondCorrectIds).toEqual([]);
    });
  });

  describe('questions count label', () => {
    it('should render singular label when there is 1 question', () => {
      const singleQuestionData: ActivityData = {
        ...mockActivityData,
        selectedQuestions: mockActivityData.selectedQuestions
          ? [mockActivityData.selectedQuestions[0]]
          : [],
      };

      render(
        <ActivityModelDetails
          activityDetails={singleQuestionData}
          loading={false}
        />
      );

      expect(screen.getByText('1 questão adicionada')).toBeInTheDocument();
      expect(
        screen.queryByText('1 questões adicionadas')
      ).not.toBeInTheDocument();
    });

    it('should render plural label when there are multiple questions', () => {
      render(
        <ActivityModelDetails
          activityDetails={mockActivityData}
          loading={false}
        />
      );

      expect(screen.getByText('2 questões adicionadas')).toBeInTheDocument();
    });

    it('should render zero questions label correctly', () => {
      const noQuestionsData: ActivityData = {
        ...mockActivityData,
        selectedQuestions: [],
      };

      render(
        <ActivityModelDetails
          activityDetails={noQuestionsData}
          loading={false}
        />
      );

      expect(screen.getByText('0 questões adicionadas')).toBeInTheDocument();
    });

    it('should render label with correct styles', () => {
      render(
        <ActivityModelDetails
          activityDetails={mockActivityData}
          loading={false}
        />
      );

      const label = screen.getByText('2 questões adicionadas');
      expect(label).toHaveAttribute('data-size', 'sm');
      expect(label.className).toContain('text-text-800');
    });
  });

  describe('missing data handling', () => {
    it('should handle questions without knowledgeMatrix', () => {
      const dataWithoutKnowledge: ActivityData = {
        ...mockActivityData,
        selectedQuestions: [
          {
            id: 'q1',
            statement: 'Question without knowledge',
            description: null,
            questionType: QUESTION_TYPE.ALTERNATIVA,
            status: QUESTION_STATUS_ENUM.APROVADO,
            difficultyLevel: DIFFICULTY_LEVEL_ENUM.MEDIO,
            questionBankYearId: 'qby1',
            solutionExplanation: null,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            knowledgeMatrix: [],
            options: [],
          },
        ],
      };

      render(
        <ActivityModelDetails
          activityDetails={dataWithoutKnowledge}
          loading={false}
        />
      );

      const questionCard = screen.getByTestId('activity-card-question-preview');
      expect(questionCard).toHaveAttribute(
        'data-subject-name',
        'Assunto não informado'
      );
      expect(questionCard).toHaveAttribute('data-subject-color', '#000000');
      expect(questionCard).toHaveAttribute('data-icon-name', 'BookOpen');
    });

    it('should handle questions with null knowledgeMatrix subject', () => {
      const dataWithNullSubject: ActivityData = {
        ...mockActivityData,
        selectedQuestions: [
          {
            id: 'q1',
            statement: 'Question with null subject',
            description: null,
            questionType: QUESTION_TYPE.ALTERNATIVA,
            status: QUESTION_STATUS_ENUM.APROVADO,
            difficultyLevel: DIFFICULTY_LEVEL_ENUM.MEDIO,
            questionBankYearId: 'qby1',
            solutionExplanation: null,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            knowledgeMatrix: [
              {
                subject: null,
              },
            ],
            options: [],
          },
        ],
      };

      render(
        <ActivityModelDetails
          activityDetails={dataWithNullSubject}
          loading={false}
        />
      );

      const questionCard = screen.getByTestId('activity-card-question-preview');
      expect(questionCard).toHaveAttribute(
        'data-subject-name',
        'Assunto não informado'
      );
      expect(questionCard).toHaveAttribute('data-subject-color', '#000000');
      expect(questionCard).toHaveAttribute('data-icon-name', 'BookOpen');
    });

    it('should handle questions without options', () => {
      const dataWithoutOptions: ActivityData = {
        ...mockActivityData,
        selectedQuestions: [
          {
            id: 'q1',
            statement: 'Question without options',
            description: null,
            questionType: QUESTION_TYPE.DISSERTATIVA,
            status: QUESTION_STATUS_ENUM.APROVADO,
            difficultyLevel: DIFFICULTY_LEVEL_ENUM.MEDIO,
            questionBankYearId: 'qby1',
            solutionExplanation: null,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            knowledgeMatrix: [],
            options: undefined,
          },
        ],
      };

      render(
        <ActivityModelDetails
          activityDetails={dataWithoutOptions}
          loading={false}
        />
      );

      const questionCard = screen.getByTestId('activity-card-question-preview');
      const options = JSON.parse(
        questionCard.querySelector('[data-testid="question-options"]')!
          .textContent!
      );
      expect(options).toEqual([]);
    });

    it('should handle questions with null options', () => {
      const dataWithNullOptions: ActivityData = {
        ...mockActivityData,
        selectedQuestions: [
          {
            id: 'q1',
            statement: 'Question with null options',
            description: null,
            questionType: QUESTION_TYPE.ALTERNATIVA,
            status: QUESTION_STATUS_ENUM.APROVADO,
            difficultyLevel: DIFFICULTY_LEVEL_ENUM.MEDIO,
            questionBankYearId: 'qby1',
            solutionExplanation: null,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            knowledgeMatrix: [],
            options: undefined,
          },
        ],
      };

      render(
        <ActivityModelDetails
          activityDetails={dataWithNullOptions}
          loading={false}
        />
      );

      const questionCard = screen.getByTestId('activity-card-question-preview');
      const options = JSON.parse(
        questionCard.querySelector('[data-testid="question-options"]')!
          .textContent!
      );
      expect(options).toEqual([]);
    });
  });

  describe('scrollable container', () => {
    it('should render questions in a scrollable container', () => {
      render(
        <ActivityModelDetails
          activityDetails={mockActivityData}
          loading={false}
        />
      );

      const container = screen
        .getAllByTestId('activity-card-question-preview')[0]
        .closest('.flex.flex-col.gap-3');

      expect(container).toBeInTheDocument();
      expect(container?.className).toContain('max-h-[500px]');
      expect(container?.className).toContain('overflow-y-auto');
    });
  });

  describe('question card styling', () => {
    it('should render each question in a card with correct styling', () => {
      render(
        <ActivityModelDetails
          activityDetails={mockActivityData}
          loading={false}
        />
      );

      const questionCards = screen.getAllByTestId(
        'activity-card-question-preview'
      );
      questionCards.forEach((card) => {
        const cardContainer = card.parentElement;
        expect(cardContainer?.className).toContain('rounded-lg');
        expect(cardContainer?.className).toContain('border');
        expect(cardContainer?.className).toContain('border-border-200');
        expect(cardContainer?.className).toContain('bg-background');
      });
    });
  });

  describe('empty selectedQuestions array', () => {
    it('should handle empty selectedQuestions array', () => {
      const emptyQuestionsData: ActivityData = {
        ...mockActivityData,
        selectedQuestions: [],
      };

      render(
        <ActivityModelDetails
          activityDetails={emptyQuestionsData}
          loading={false}
        />
      );

      expect(screen.getByText('0 questões adicionadas')).toBeInTheDocument();
      expect(
        screen.queryByTestId('activity-card-question-preview')
      ).not.toBeInTheDocument();
    });
  });

  describe('undefined selectedQuestions', () => {
    it('should handle undefined selectedQuestions', () => {
      const undefinedQuestionsData: ActivityData = {
        ...mockActivityData,
        selectedQuestions: undefined,
      };

      render(
        <ActivityModelDetails
          activityDetails={undefinedQuestionsData}
          loading={false}
        />
      );

      expect(screen.getByText('0 questões adicionadas')).toBeInTheDocument();
      expect(
        screen.queryByTestId('activity-card-question-preview')
      ).not.toBeInTheDocument();
    });
  });

  describe('large number of questions', () => {
    it('should handle rendering many questions', () => {
      const manyQuestionsData: ActivityData = {
        ...mockActivityData,
        selectedQuestions: Array.from({ length: 50 }, (_, i) => ({
          id: `q${i + 1}`,
          statement: `Question ${i + 1}`,
          description: null,
          questionType: QUESTION_TYPE.ALTERNATIVA,
          status: QUESTION_STATUS_ENUM.APROVADO,
          difficultyLevel: DIFFICULTY_LEVEL_ENUM.MEDIO,
          questionBankYearId: `qby${i + 1}`,
          solutionExplanation: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          knowledgeMatrix: [
            {
              subject: {
                id: `s${i + 1}`,
                name: `Subject ${i + 1}`,
                color: '#FF5733',
                icon: 'BookOpen',
              },
            },
          ],
          options: [],
        })),
      };

      render(
        <ActivityModelDetails
          activityDetails={manyQuestionsData}
          loading={false}
        />
      );

      expect(screen.getByText('50 questões adicionadas')).toBeInTheDocument();
      expect(
        screen.getAllByTestId('activity-card-question-preview')
      ).toHaveLength(50);
    });
  });

  describe('question position numbering', () => {
    it('should number questions starting from 1', () => {
      render(
        <ActivityModelDetails
          activityDetails={mockActivityData}
          loading={false}
        />
      );

      const questionCards = screen.getAllByTestId(
        'activity-card-question-preview'
      );
      expect(questionCards[0]).toHaveAttribute('data-position', '1');
      expect(questionCards[1]).toHaveAttribute('data-position', '2');
    });

    it('should correctly number questions in sequence', () => {
      const threeQuestionsData: ActivityData = {
        ...mockActivityData,
        selectedQuestions: [
          ...(mockActivityData.selectedQuestions || []),
          {
            id: 'q3',
            statement: 'Question 3',
            description: null,
            questionType: QUESTION_TYPE.ALTERNATIVA,
            status: QUESTION_STATUS_ENUM.APROVADO,
            difficultyLevel: DIFFICULTY_LEVEL_ENUM.MEDIO,
            questionBankYearId: 'qby3',
            solutionExplanation: null,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            knowledgeMatrix: [],
            options: [],
          },
        ],
      };

      render(
        <ActivityModelDetails
          activityDetails={threeQuestionsData}
          loading={false}
        />
      );

      const questionCards = screen.getAllByTestId(
        'activity-card-question-preview'
      );
      expect(questionCards[0]).toHaveAttribute('data-position', '1');
      expect(questionCards[1]).toHaveAttribute('data-position', '2');
      expect(questionCards[2]).toHaveAttribute('data-position', '3');
    });
  });
});
