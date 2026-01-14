import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityModelDetails } from './ActivityModelDetails';
import type { ActivityData } from '../../ActivityCreate/ActivityCreate.types';
import { ActivityType } from '../../ActivityCreate/ActivityCreate.types';
import { QUESTION_TYPE } from '../../Quiz/useQuizStore';
import {
  DIFFICULTY_LEVEL_ENUM,
  QUESTION_STATUS_ENUM,
} from '../../../types/questions';

const mockActivityData: ActivityData = {
  id: '1',
  type: ActivityType.MODELO,
  title: 'Test Activity',
  subjectId: 'bio-1',
  filters: {},
  questionIds: ['q1'],
  selectedQuestions: [
    {
      id: 'q1',
      statement: 'Test question statement',
      description: null,
      questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
      status: QUESTION_STATUS_ENUM.APROVADO,
      difficultyLevel: DIFFICULTY_LEVEL_ENUM.MEDIO,
      questionBankYearId: 'qby-1',
      solutionExplanation: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      knowledgeMatrix: [
        {
          subject: {
            id: 'bio-1',
            name: 'Biologia',
            color: '#E8F5E9',
            icon: 'Microscope',
          },
        },
      ],
      options: [
        { id: 'opt1', option: 'Option 1' },
        { id: 'opt2', option: 'Option 2' },
      ],
    },
  ],
};

describe('ActivityModelDetails', () => {
  it('renders loading state', () => {
    render(<ActivityModelDetails activityDetails={null} loading={true} />);

    expect(screen.getByText('Carregando detalhes...')).toBeInTheDocument();
  });

  it('renders empty state when no details', () => {
    render(<ActivityModelDetails activityDetails={null} loading={false} />);

    expect(screen.getByText('Nenhum detalhe disponível')).toBeInTheDocument();
  });

  it('renders activity details with questions', () => {
    render(
      <ActivityModelDetails
        activityDetails={mockActivityData}
        loading={false}
      />
    );

    expect(screen.getByText('1 questão adicionada')).toBeInTheDocument();
    expect(screen.getByText('Test question statement')).toBeInTheDocument();
  });

  it('renders correct label for multiple questions', () => {
    const multipleQuestionsData: ActivityData = {
      ...mockActivityData,
      selectedQuestions: [
        mockActivityData.selectedQuestions![0],
        { ...mockActivityData.selectedQuestions![0], id: 'q2' },
        { ...mockActivityData.selectedQuestions![0], id: 'q3' },
      ],
    };

    render(
      <ActivityModelDetails
        activityDetails={multipleQuestionsData}
        loading={false}
      />
    );

    expect(screen.getByText('3 questões adicionadas')).toBeInTheDocument();
  });
});
