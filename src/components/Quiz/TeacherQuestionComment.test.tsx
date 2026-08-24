import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TeacherQuestionComment } from './TeacherQuestionComment';
import { useQuizStore } from './useQuizStore';
import { QuizVariant } from './Quiz.types';

jest.mock('./useQuizStore', () => ({
  useQuizStore: jest.fn(),
}));

const mockUseQuizStore = useQuizStore as jest.MockedFunction<
  typeof useQuizStore
>;

describe('TeacherQuestionComment', () => {
  const mockGetCurrentQuestion = jest.fn();
  const mockGetQuestionResultByQuestionId = jest.fn();

  /**
   * Point the mocked store at a given variant, current question and answer.
   */
  const setupStore = (variant: QuizVariant) => {
    mockUseQuizStore.mockReturnValue({
      variant,
      getCurrentQuestion: mockGetCurrentQuestion,
      getQuestionResultByQuestionId: mockGetQuestionResultByQuestionId,
    } as unknown as ReturnType<typeof useQuizStore>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentQuestion.mockReturnValue({ id: 'q1' });
    mockGetQuestionResultByQuestionId.mockReturnValue({
      teacherFeedback: 'Revise a Lei de Ohm.',
    });
  });

  it('should render the comment in the result variant', () => {
    setupStore(QuizVariant.RESULT);

    render(<TeacherQuestionComment />);

    expect(screen.getByText('Comentário do professor')).toBeInTheDocument();
    expect(screen.getByText('Revise a Lei de Ohm.')).toBeInTheDocument();
    expect(mockGetQuestionResultByQuestionId).toHaveBeenCalledWith('q1');
  });

  it('should apply a custom className', () => {
    setupStore(QuizVariant.RESULT);

    const { container } = render(<TeacherQuestionComment className="mt-10" />);

    expect(container.firstChild).toHaveClass('mt-10');
  });

  it('should render nothing outside the result variant', () => {
    setupStore(QuizVariant.DEFAULT);

    const { container } = render(<TeacherQuestionComment />);

    expect(container.firstChild).toBeNull();
  });

  it('should render nothing when there is no current question', () => {
    setupStore(QuizVariant.RESULT);
    mockGetCurrentQuestion.mockReturnValue(null);

    const { container } = render(<TeacherQuestionComment />);

    expect(container.firstChild).toBeNull();
  });

  it('should render nothing when the question has no answer', () => {
    setupStore(QuizVariant.RESULT);
    mockGetQuestionResultByQuestionId.mockReturnValue(null);

    const { container } = render(<TeacherQuestionComment />);

    expect(container.firstChild).toBeNull();
  });

  it('should render nothing when the comment is empty', () => {
    setupStore(QuizVariant.RESULT);
    mockGetQuestionResultByQuestionId.mockReturnValue({
      teacherFeedback: '',
    });

    const { container } = render(<TeacherQuestionComment />);

    expect(container.firstChild).toBeNull();
  });
});
