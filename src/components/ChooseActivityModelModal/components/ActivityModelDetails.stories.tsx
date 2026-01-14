import type { Story } from '@ladle/react';
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
  title: 'Explorando a Fotossíntese: Atividade Prática de Campo',
  subjectId: 'bio-1',
  filters: {},
  questionIds: ['q1', 'q2', 'q3'],
  selectedQuestions: [
    {
      id: 'q1',
      statement:
        'Um grupo de cientistas está estudando o comportamento de uma população de bactérias em um laboratório. Eles observaram que a população dobra a cada 3 horas. Se inicialmente havia 100 bactérias, quantas bactérias haverá após 12 horas?',
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
          topic: {
            id: 't1',
            name: 'Fotossíntese',
          },
        },
      ],
      options: [
        { id: 'opt1', option: '400 bactérias', correct: false },
        { id: 'opt2', option: '800 bactérias', correct: false },
        { id: 'opt3', option: '1600 bactérias', correct: true },
        { id: 'opt4', option: '3200 bactérias', correct: false },
      ],
    },
    {
      id: 'q2',
      statement:
        'Qual é o processo pelo qual as plantas convertem luz solar em energia química?',
      description: null,
      questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
      status: QUESTION_STATUS_ENUM.APROVADO,
      difficultyLevel: DIFFICULTY_LEVEL_ENUM.FACIL,
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
          topic: {
            id: 't1',
            name: 'Fotossíntese',
          },
        },
      ],
      options: [
        { id: 'opt5', option: 'Respiração', correct: false },
        { id: 'opt6', option: 'Fotossíntese', correct: true },
        { id: 'opt7', option: 'Digestão', correct: false },
        { id: 'opt8', option: 'Fermentação', correct: false },
      ],
    },
    {
      id: 'q3',
      statement: 'Quais são os produtos finais da fotossíntese?',
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
          topic: {
            id: 't1',
            name: 'Fotossíntese',
          },
        },
      ],
      options: [
        { id: 'opt9', option: 'Glicose e oxigênio', correct: true },
        { id: 'opt10', option: 'Água e dióxido de carbono', correct: false },
        { id: 'opt11', option: 'Proteínas e lipídios', correct: false },
        { id: 'opt12', option: 'Aminoácidos e vitaminas', correct: false },
      ],
    },
  ],
};

/**
 * Basic details view with questions
 */
export const Basic: Story = () => {
  return (
    <div className="p-4">
      <ActivityModelDetails
        activityDetails={mockActivityData}
        loading={false}
      />
    </div>
  );
};

/**
 * Loading state
 */
export const Loading: Story = () => {
  return (
    <div className="p-4">
      <ActivityModelDetails activityDetails={null} loading={true} />
    </div>
  );
};

/**
 * Empty state (no details)
 */
export const Empty: Story = () => {
  return (
    <div className="p-4">
      <ActivityModelDetails activityDetails={null} loading={false} />
    </div>
  );
};

/**
 * Single question
 */
export const SingleQuestion: Story = () => {
  const singleQuestionData: ActivityData = {
    ...mockActivityData,
    selectedQuestions: [mockActivityData.selectedQuestions![0]],
  };

  return (
    <div className="p-4">
      <ActivityModelDetails
        activityDetails={singleQuestionData}
        loading={false}
      />
    </div>
  );
};
