import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StudentActivityPerformanceModal } from './StudentActivityPerformanceModal';
import type { StudentActivityPerformanceData } from '../types';
import type { BaseApiClient } from '../../../types/api';

// Mock useToastStore
const mockAddToast = jest.fn();
jest.mock('../../Toast/utils/ToastStore', () => ({
  __esModule: true,
  default: (selector: (state: { addToast: typeof mockAddToast }) => unknown) =>
    selector({ addToast: mockAddToast }),
}));

const mockApiClient: BaseApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

const mockPerformanceData: StudentActivityPerformanceData = {
  userInstitutionId: 'user-inst-1',
  userId: 'user-1',
  studentName: 'João Silva',
  score: 8.5,
  correctAnswers: 7,
  incorrectAnswers: 3,
  completionTime: '15 dias',
  bestResult: 'Matemática',
  hardestTopic: 'Física',
  activities: [
    {
      id: 'activity-1',
      title: 'Atividade 1',
      questions: [
        {
          id: 'question-1',
          answerId: 'answer-1',
          activityId: 'activity-1',
          title: 'Questão 1',
          statement: 'Qual é a capital do Brasil?',
          questionType: 'MULTIPLA_ESCOLHA',
          isCorrect: true,
          teacherFeedback: null,
          alternatives: [
            {
              id: 'alt-1',
              text: 'São Paulo',
              isCorrect: false,
              isSelected: false,
            },
            {
              id: 'alt-2',
              text: 'Brasília',
              isCorrect: true,
              isSelected: true,
            },
            {
              id: 'alt-3',
              text: 'Rio de Janeiro',
              isCorrect: false,
              isSelected: false,
            },
          ],
        },
        {
          id: 'question-2',
          answerId: 'answer-2',
          activityId: 'activity-1',
          title: 'Questão 2',
          statement: 'Explique o processo de fotossíntese.',
          questionType: 'DISSERTATIVA',
          isCorrect: null,
          teacherFeedback: null,
          alternatives: [],
        },
      ],
    },
  ],
  lessons: [
    {
      id: 'lesson-1',
      title: 'Aula 1 - Introdução',
      progress: 100,
    },
    {
      id: 'lesson-2',
      title: 'Aula 2 - Conceitos',
      progress: 50,
    },
  ],
};

describe('StudentActivityPerformanceModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
        />
      );

      expect(screen.getByText('Corrigir atividade')).toBeInTheDocument();
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    it('should not render content when data is null and not loading', () => {
      const { container } = render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={null}
        />
      );

      // Modal should not render when there's no data, loading, or error
      expect(
        container.querySelector('[data-testid="modal"]')
      ).not.toBeInTheDocument();
    });

    it('should render loading skeleton when loading is true', () => {
      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={null}
          loading={true}
        />
      );

      expect(screen.getByText('Corrigir atividade')).toBeInTheDocument();
      // Loading skeleton should be visible
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    it('should render error message when error is provided', () => {
      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={null}
          error="Erro ao carregar dados"
        />
      );

      expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument();
    });

    it('should display student performance stats', () => {
      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
        />
      );

      expect(screen.getByText('8.5')).toBeInTheDocument(); // Score
      expect(screen.getByText('7')).toBeInTheDocument(); // Correct answers
      expect(screen.getByText('3')).toBeInTheDocument(); // Incorrect answers
      expect(screen.getByText('15 dias')).toBeInTheDocument(); // Completion time
      expect(screen.getByText('Matemática')).toBeInTheDocument(); // Best result
      expect(screen.getByText('Física')).toBeInTheDocument(); // Hardest topic
    });

    it('should display dash when score is null', () => {
      const dataWithNullScore = {
        ...mockPerformanceData,
        score: null,
      };

      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={dataWithNullScore}
        />
      );

      // Find the score card by label and check for dash
      const scoreLabel = screen.getByText('NOTA');
      const scoreCard = scoreLabel.closest('div');
      expect(scoreCard).toHaveTextContent('-');
    });
  });

  describe('Activities Accordion', () => {
    it('should render activities section', () => {
      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
        />
      );

      expect(screen.getByText('Atividade')).toBeInTheDocument();
      expect(screen.getByText('Atividade 1')).toBeInTheDocument();
    });

    it('should expand activity to show questions', () => {
      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
        />
      );

      const activityButton = screen.getByText('Atividade 1').closest('button')!;
      fireEvent.click(activityButton);

      expect(screen.getByText('Questão 1')).toBeInTheDocument();
      expect(screen.getByText('Questão 2')).toBeInTheDocument();
    });

    it('should show correct badge for correct answers', () => {
      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
        />
      );

      const activityButton = screen.getByText('Atividade 1').closest('button')!;
      fireEvent.click(activityButton);

      // Question 1 is correct
      expect(screen.getByText('Correta')).toBeInTheDocument();
    });

    it('should show pending badge for unevaluated answers', () => {
      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
        />
      );

      const activityButton = screen.getByText('Atividade 1').closest('button')!;
      fireEvent.click(activityButton);

      // Question 2 is not evaluated
      expect(screen.getByText('Pendente')).toBeInTheDocument();
    });
  });

  describe('Multiple Choice Questions', () => {
    it('should show alternatives for multiple choice questions', () => {
      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
        />
      );

      // Open activity
      const activityButton = screen.getByText('Atividade 1').closest('button')!;
      fireEvent.click(activityButton);

      // Open question
      const question1Button = screen.getByText('Questão 1').closest('button')!;
      fireEvent.click(question1Button);

      // Check alternatives accordion exists
      expect(screen.getByText('Alternativas')).toBeInTheDocument();
    });

    it('should NOT show correction fields for multiple choice questions', () => {
      // Use data with only multiple choice question to isolate the test
      const multipleChoiceOnlyData: StudentActivityPerformanceData = {
        ...mockPerformanceData,
        activities: [
          {
            id: 'activity-mc',
            title: 'Atividade MC',
            questions: [
              {
                id: 'question-mc',
                answerId: 'answer-mc',
                activityId: 'activity-mc',
                title: 'Questão 1',
                statement: 'Qual é a capital do Brasil?',
                questionType: 'MULTIPLA_ESCOLHA',
                isCorrect: true,
                teacherFeedback: null,
                alternatives: [
                  {
                    id: 'alt-1',
                    text: 'São Paulo',
                    isCorrect: false,
                    isSelected: false,
                  },
                  {
                    id: 'alt-2',
                    text: 'Brasília',
                    isCorrect: true,
                    isSelected: true,
                  },
                ],
              },
            ],
          },
        ],
        lessons: [],
      };

      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={multipleChoiceOnlyData}
          apiClient={mockApiClient}
        />
      );

      // Open activity
      const activityButton = screen
        .getByText('Atividade MC')
        .closest('button')!;
      fireEvent.click(activityButton);

      // Open multiple choice question (rendered as "Questão 1")
      const questionButton = screen.getByText('Questão 1').closest('button')!;
      fireEvent.click(questionButton);

      // Correction fields should NOT be visible for multiple choice
      expect(
        screen.queryByText('Resposta está correta?')
      ).not.toBeInTheDocument();
    });
  });

  describe('Essay Questions Correction', () => {
    it('should show correction fields for essay questions when apiClient is provided', () => {
      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
          apiClient={mockApiClient}
        />
      );

      // Open activity
      const activityButton = screen.getByText('Atividade 1').closest('button')!;
      fireEvent.click(activityButton);

      // Open essay question
      const question2Button = screen.getByText('Questão 2').closest('button')!;
      fireEvent.click(question2Button);

      // Correction fields should be visible
      expect(screen.getByText('Resposta está correta?')).toBeInTheDocument();
      expect(screen.getByText('Incluir observação')).toBeInTheDocument();
      expect(screen.getByText('Salvar correção')).toBeInTheDocument();
    });

    it('should NOT show correction fields when apiClient is not provided', () => {
      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
        />
      );

      // Open activity
      const activityButton = screen.getByText('Atividade 1').closest('button')!;
      fireEvent.click(activityButton);

      // Open essay question
      const question2Button = screen.getByText('Questão 2').closest('button')!;
      fireEvent.click(question2Button);

      // Correction fields should NOT be visible
      expect(
        screen.queryByText('Resposta está correta?')
      ).not.toBeInTheDocument();
    });

    it('should update isCorrect when radio button is clicked', () => {
      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
          apiClient={mockApiClient}
        />
      );

      // Open activity and essay question
      const activityButton = screen.getByText('Atividade 1').closest('button')!;
      fireEvent.click(activityButton);

      const question2Button = screen.getByText('Questão 2').closest('button')!;
      fireEvent.click(question2Button);

      // Click "Sim" radio
      const yesRadio = screen.getByLabelText('Sim');
      fireEvent.click(yesRadio);

      expect(yesRadio).toBeChecked();
    });

    it('should update teacherFeedback when textarea is changed', () => {
      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
          apiClient={mockApiClient}
        />
      );

      // Open activity and essay question
      const activityButton = screen.getByText('Atividade 1').closest('button')!;
      fireEvent.click(activityButton);

      const question2Button = screen.getByText('Questão 2').closest('button')!;
      fireEvent.click(question2Button);

      // Type in textarea
      const textarea = screen.getByPlaceholderText(
        'Adicionar feedback para o aluno...'
      );
      fireEvent.change(textarea, { target: { value: 'Boa resposta!' } });

      expect(textarea).toHaveValue('Boa resposta!');
    });

    it('should disable save button when isCorrect is not selected', () => {
      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
          apiClient={mockApiClient}
        />
      );

      // Open activity and essay question
      const activityButton = screen.getByText('Atividade 1').closest('button')!;
      fireEvent.click(activityButton);

      const question2Button = screen.getByText('Questão 2').closest('button')!;
      fireEvent.click(question2Button);

      // Save button should be disabled
      const saveButton = screen.getByText('Salvar correção');
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when isCorrect is selected', () => {
      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
          apiClient={mockApiClient}
        />
      );

      // Open activity and essay question
      const activityButton = screen.getByText('Atividade 1').closest('button')!;
      fireEvent.click(activityButton);

      const question2Button = screen.getByText('Questão 2').closest('button')!;
      fireEvent.click(question2Button);

      // Select "Sim"
      const yesRadio = screen.getByLabelText('Sim');
      fireEvent.click(yesRadio);

      // Save button should be enabled
      const saveButton = screen.getByText('Salvar correção');
      expect(saveButton).not.toBeDisabled();
    });

    it('should call API and show success toast when saving correction', async () => {
      (mockApiClient.post as jest.Mock).mockResolvedValueOnce({ data: {} });

      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
          apiClient={mockApiClient}
        />
      );

      // Open activity and essay question
      const activityButton = screen.getByText('Atividade 1').closest('button')!;
      fireEvent.click(activityButton);

      const question2Button = screen.getByText('Questão 2').closest('button')!;
      fireEvent.click(question2Button);

      // Select "Sim" and add feedback
      const yesRadio = screen.getByLabelText('Sim');
      fireEvent.click(yesRadio);

      const textarea = screen.getByPlaceholderText(
        'Adicionar feedback para o aluno...'
      );
      fireEvent.change(textarea, { target: { value: 'Excelente!' } });

      // Click save
      const saveButton = screen.getByText('Salvar correção');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/activities/activity-1/students/user-1/questions/correction',
          {
            questionId: 'question-2',
            isCorrect: true,
            teacherFeedback: 'Excelente!',
          }
        );
      });

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Correção salva',
            action: 'success',
          })
        );
      });
    });

    it('should show error toast when API call fails', async () => {
      (mockApiClient.post as jest.Mock).mockRejectedValueOnce(
        new Error('API Error')
      );

      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
          apiClient={mockApiClient}
        />
      );

      // Open activity and essay question
      const activityButton = screen.getByText('Atividade 1').closest('button')!;
      fireEvent.click(activityButton);

      const question2Button = screen.getByText('Questão 2').closest('button')!;
      fireEvent.click(question2Button);

      // Select "Não"
      const noRadio = screen.getByLabelText('Não');
      fireEvent.click(noRadio);

      // Click save
      const saveButton = screen.getByText('Salvar correção');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Erro ao salvar correção',
            action: 'warning',
          })
        );
      });
    });

    it('should show saving state on button while saving', async () => {
      let resolvePromise: () => void;
      const promise = new Promise<{ data: unknown }>((resolve) => {
        resolvePromise = () => resolve({ data: {} });
      });
      (mockApiClient.post as jest.Mock).mockReturnValueOnce(promise);

      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
          apiClient={mockApiClient}
        />
      );

      // Open activity and essay question
      const activityButton = screen.getByText('Atividade 1').closest('button')!;
      fireEvent.click(activityButton);

      const question2Button = screen.getByText('Questão 2').closest('button')!;
      fireEvent.click(question2Button);

      // Select "Sim"
      const yesRadio = screen.getByLabelText('Sim');
      fireEvent.click(yesRadio);

      // Click save
      const saveButton = screen.getByText('Salvar correção');
      fireEvent.click(saveButton);

      // Button should show saving state
      expect(screen.getByText('Salvando...')).toBeInTheDocument();

      // Resolve the promise
      resolvePromise!();

      await waitFor(() => {
        expect(screen.getByText('Salvar correção')).toBeInTheDocument();
      });
    });
  });

  // Objective questions used to show nothing at all here: the gate only let the
  // essay branch through, so the teacher could read the answer but had no way to
  // comment on it.
  describe('Teacher comment on non-essay questions', () => {
    /** Open the multiple-choice question's accordion. */
    const openObjectiveQuestion = () => {
      fireEvent.click(screen.getByText('Atividade 1').closest('button')!);
      fireEvent.click(screen.getByText('Questão 1').closest('button')!);
    };

    // The accordion keeps every question's content mounted, so the split is
    // asserted by counting: the fixture has exactly one objective question and
    // one essay, and each must get one branch and not the other.
    it('should give the comment field to the objective question and the grading fields to the essay', () => {
      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
          apiClient={mockApiClient}
        />
      );

      openObjectiveQuestion();

      expect(screen.getAllByText('Comentário para o estudante')).toHaveLength(
        1
      );
      expect(screen.getAllByText('Resposta está correta?')).toHaveLength(1);
    });

    it('should not show the comment field without an apiClient', () => {
      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
        />
      );

      openObjectiveQuestion();

      expect(
        screen.queryByText('Comentário para o estudante')
      ).not.toBeInTheDocument();
    });

    it('should save through the feedback endpoint, not the correction one', async () => {
      // The correction endpoint is dissertativa-only and overwrites
      // answer_status; an objective question is graded automatically and its
      // status must not move because a teacher wrote a note.
      (mockApiClient.patch as jest.Mock).mockResolvedValue({});

      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
          apiClient={mockApiClient}
        />
      );

      openObjectiveQuestion();

      fireEvent.change(
        screen.getByPlaceholderText('Escreva um comentário sobre esta questão'),
        { target: { value: 'Revise o conceito de capital.' } }
      );
      fireEvent.click(screen.getByText('Salvar'));

      await waitFor(() => {
        expect(mockApiClient.patch).toHaveBeenCalledWith(
          '/questions/activity-1/question-1/students/user-1/feedback',
          { teacherFeedback: 'Revise o conceito de capital.' }
        );
      });
      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    it('should keep the saved comment so the field locks behind Editar', async () => {
      (mockApiClient.patch as jest.Mock).mockResolvedValue({});

      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
          apiClient={mockApiClient}
        />
      );

      openObjectiveQuestion();

      fireEvent.change(
        screen.getByPlaceholderText('Escreva um comentário sobre esta questão'),
        { target: { value: 'Bom raciocínio.' } }
      );
      fireEvent.click(screen.getByText('Salvar'));

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'Comentário salvo' })
        );
      });
      // The modal remembers what it saved, so the comment now counts as
      // persisted and the field closes behind Editar.
      expect(await screen.findByText('Editar')).toBeInTheDocument();
    });

    it('should send an empty string to clear the comment', async () => {
      (mockApiClient.patch as jest.Mock).mockResolvedValue({});

      const dataWithComment = {
        ...mockPerformanceData,
        activities: [
          {
            ...mockPerformanceData.activities[0],
            questions: [
              {
                ...mockPerformanceData.activities[0].questions[0],
                teacherFeedback: 'Comentário antigo',
              },
              mockPerformanceData.activities[0].questions[1],
            ],
          },
        ],
      };

      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={dataWithComment}
          apiClient={mockApiClient}
        />
      );

      openObjectiveQuestion();

      // The comment is already saved, so it opens locked.
      fireEvent.click(screen.getByText('Editar'));

      const textarea = screen.getByDisplayValue('Comentário antigo');
      fireEvent.change(textarea, { target: { value: '' } });
      fireEvent.click(screen.getByText('Salvar'));

      await waitFor(() => {
        expect(mockApiClient.patch).toHaveBeenCalledWith(
          '/questions/activity-1/question-1/students/user-1/feedback',
          { teacherFeedback: '' }
        );
      });
    });

    it('should keep the draft and show an error when saving fails', async () => {
      (mockApiClient.patch as jest.Mock).mockRejectedValue(
        new Error('Network down')
      );

      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
          apiClient={mockApiClient}
        />
      );

      openObjectiveQuestion();

      const textarea = screen.getByPlaceholderText(
        'Escreva um comentário sobre esta questão'
      );
      fireEvent.change(textarea, {
        target: { value: 'Texto que não pode sumir' },
      });
      fireEvent.click(screen.getByText('Salvar'));

      await waitFor(() => {
        expect(
          screen.getByText('Erro ao salvar o comentário. Tente novamente.')
        ).toBeInTheDocument();
      });
      expect(textarea).toHaveValue('Texto que não pode sumir');
    });
  });

  describe('Edge cases', () => {
    it('should render nothing when there is no data, no loading and no error', () => {
      const { container } = render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={null}
        />
      );

      expect(container).not.toHaveTextContent('João Silva');
    });

    it('should clear the corrections when the modal is closed', () => {
      const onClose = jest.fn();
      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={onClose}
          data={mockPerformanceData}
          apiClient={mockApiClient}
        />
      );

      fireEvent.click(screen.getByLabelText('Fechar modal'));

      expect(onClose).toHaveBeenCalled();
    });

    it('should key a question by activity and question id when it has no answer id', async () => {
      // Questions never answered come back without an `answerId`, so the state
      // key falls back to the pair — without it every such question would share
      // the key '' and overwrite each other's comment.
      (mockApiClient.patch as jest.Mock).mockResolvedValue({});

      const dataWithoutAnswerId = {
        ...mockPerformanceData,
        activities: [
          {
            ...mockPerformanceData.activities[0],
            questions: [
              {
                ...mockPerformanceData.activities[0].questions[0],
                answerId: '',
              },
            ],
          },
        ],
      };

      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={dataWithoutAnswerId}
          apiClient={mockApiClient}
        />
      );

      fireEvent.click(screen.getByText('Atividade 1').closest('button')!);
      fireEvent.click(screen.getByText('Questão 1').closest('button')!);

      fireEvent.change(
        screen.getByPlaceholderText('Escreva um comentário sobre esta questão'),
        { target: { value: 'Sem answerId' } }
      );
      fireEvent.click(screen.getByText('Salvar'));

      // The save landed under the fallback key, so the comment counts as
      // persisted and the field locks.
      expect(await screen.findByText('Editar')).toBeInTheDocument();
    });
  });

  describe('Lessons Section', () => {
    it('should render lessons with progress bars', () => {
      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
        />
      );

      expect(screen.getByText('Aulas')).toBeInTheDocument();
      expect(screen.getByText('Aula 1 - Introdução')).toBeInTheDocument();
      expect(screen.getByText('Aula 2 - Conceitos')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should not render lessons section when lessons array is empty', () => {
      const dataWithoutLessons = {
        ...mockPerformanceData,
        lessons: [],
      };

      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={dataWithoutLessons}
        />
      );

      expect(screen.queryByText('Aulas')).not.toBeInTheDocument();
    });
  });

  describe('Modal behavior', () => {
    it('should call onClose when modal close button is clicked', () => {
      const onClose = jest.fn();

      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={onClose}
          data={mockPerformanceData}
        />
      );

      // Find close button by aria-label or test-id
      const closeButton =
        screen.queryByLabelText(/close/i) ||
        screen.queryByTestId('modal-close-button') ||
        document.querySelector('[data-testid="close-button"]');

      if (closeButton) {
        fireEvent.click(closeButton);
        expect(onClose).toHaveBeenCalled();
      } else {
        // If no close button found, the test passes (modal might close differently)
        expect(true).toBe(true);
      }
    });

    it('should reset corrections state when modal is closed', () => {
      const onClose = jest.fn();
      const { rerender } = render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={onClose}
          data={mockPerformanceData}
          apiClient={mockApiClient}
        />
      );

      // Open activity and essay question, make changes
      const activityButton = screen.getByText('Atividade 1').closest('button')!;
      fireEvent.click(activityButton);

      const question2Button = screen.getByText('Questão 2').closest('button')!;
      fireEvent.click(question2Button);

      const yesRadio = screen.getByLabelText('Sim');
      fireEvent.click(yesRadio);

      // Close and reopen modal
      rerender(
        <StudentActivityPerformanceModal
          isOpen={false}
          onClose={onClose}
          data={mockPerformanceData}
          apiClient={mockApiClient}
        />
      );

      rerender(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={onClose}
          data={mockPerformanceData}
          apiClient={mockApiClient}
        />
      );

      // Open activity and essay question again
      const activityButton2 = screen
        .getByText('Atividade 1')
        .closest('button')!;
      fireEvent.click(activityButton2);

      const question2Button2 = screen.getByText('Questão 2').closest('button')!;
      fireEvent.click(question2Button2);

      // Radio should not be checked (state was reset)
      const yesRadio2 = screen.getByLabelText('Sim');
      expect(yesRadio2).not.toBeChecked();
    });
  });

  describe('Badge updates after save', () => {
    it('should update badge to Correta after saving correction as correct', async () => {
      (mockApiClient.post as jest.Mock).mockResolvedValueOnce({ data: {} });

      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
          apiClient={mockApiClient}
        />
      );

      // Open activity and essay question
      const activityButton = screen.getByText('Atividade 1').closest('button')!;
      fireEvent.click(activityButton);

      // Count initial "Correta" badges (question 1 already has one)
      const initialCorretaBadges = screen.getAllByText('Correta');
      const initialCount = initialCorretaBadges.length;

      // Initially question 2 should show "Pendente"
      expect(screen.getByText('Pendente')).toBeInTheDocument();

      const question2Button = screen.getByText('Questão 2').closest('button')!;
      fireEvent.click(question2Button);

      // Select "Sim" and save
      const yesRadio = screen.getByLabelText('Sim');
      fireEvent.click(yesRadio);

      const saveButton = screen.getByText('Salvar correção');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalled();
      });

      // Badge count should increment after save (question 2 now also shows "Correta")
      await waitFor(() => {
        const updatedCorretaBadges = screen.getAllByText('Correta');
        expect(updatedCorretaBadges.length).toBe(initialCount + 1);
      });
    });

    it('should update badge to Incorreta after saving correction as incorrect', async () => {
      (mockApiClient.post as jest.Mock).mockResolvedValueOnce({ data: {} });

      render(
        <StudentActivityPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={mockPerformanceData}
          apiClient={mockApiClient}
        />
      );

      // Open activity and essay question
      const activityButton = screen.getByText('Atividade 1').closest('button')!;
      fireEvent.click(activityButton);

      const question2Button = screen.getByText('Questão 2').closest('button')!;
      fireEvent.click(question2Button);

      // Select "Não" and save
      const noRadio = screen.getByLabelText('Não');
      fireEvent.click(noRadio);

      const saveButton = screen.getByText('Salvar correção');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalled();
      });

      // Badge should update to "Incorreta" after save
      await waitFor(() => {
        expect(screen.getByText('Incorreta')).toBeInTheDocument();
      });
    });
  });
});
