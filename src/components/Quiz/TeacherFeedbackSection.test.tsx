import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TeacherFeedbackSection } from './TeacherFeedbackSection';
import { useQuizStore } from './useQuizStore';

// Mock the useQuizStore hook
jest.mock('./useQuizStore', () => ({
  useQuizStore: jest.fn(),
}));

const mockUseQuizStore = useQuizStore as jest.MockedFunction<
  typeof useQuizStore
>;

describe('TeacherFeedbackSection', () => {
  const mockGetActivityFeedback = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuizStore.mockReturnValue({
      getActivityFeedback: mockGetActivityFeedback,
    } as unknown as ReturnType<typeof useQuizStore>);
  });

  describe('Rendering conditions', () => {
    it('should render nothing when there is no feedback and no attachment', () => {
      mockGetActivityFeedback.mockReturnValue(null);

      const { container } = render(<TeacherFeedbackSection />);

      expect(container.firstChild).toBeNull();
    });

    it('should render nothing when feedback object has null values', () => {
      mockGetActivityFeedback.mockReturnValue({
        teacherFeedback: null,
        attachment: null,
      });

      const { container } = render(<TeacherFeedbackSection />);

      expect(container.firstChild).toBeNull();
    });

    it('should render the section when teacherFeedback exists', () => {
      mockGetActivityFeedback.mockReturnValue({
        teacherFeedback: 'Excelente trabalho!',
        attachment: null,
      });

      render(<TeacherFeedbackSection />);

      expect(screen.getByText('Observação do Professor')).toBeInTheDocument();
      expect(screen.getByText('Excelente trabalho!')).toBeInTheDocument();
    });

    it('should render the section when attachment exists', () => {
      mockGetActivityFeedback.mockReturnValue({
        teacherFeedback: null,
        attachment: 'https://example.com/file.pdf',
      });

      render(<TeacherFeedbackSection />);

      expect(screen.getByText('Observação do Professor')).toBeInTheDocument();
      expect(screen.getByText('Ver anexo')).toBeInTheDocument();
    });

    it('should render both feedback text and attachment when both exist', () => {
      mockGetActivityFeedback.mockReturnValue({
        teacherFeedback: 'Revise o conteúdo anexo.',
        attachment: 'https://example.com/material.pdf',
      });

      render(<TeacherFeedbackSection />);

      expect(screen.getByText('Observação do Professor')).toBeInTheDocument();
      expect(screen.getByText('Revise o conteúdo anexo.')).toBeInTheDocument();
      expect(screen.getByText('Ver anexo')).toBeInTheDocument();
    });
  });

  describe('Feedback content', () => {
    it('should render feedback text with whitespace preserved', () => {
      mockGetActivityFeedback.mockReturnValue({
        teacherFeedback: 'Linha 1\nLinha 2\nLinha 3',
        attachment: null,
      });

      render(<TeacherFeedbackSection />);

      const feedbackElement = screen.getByText(/Linha 1/);
      expect(feedbackElement).toHaveClass('whitespace-pre-wrap');
    });

    it('should render multiline feedback correctly', () => {
      const multilineFeedback =
        'Parabéns!\n\nVocê demonstrou ótimo entendimento.';
      mockGetActivityFeedback.mockReturnValue({
        teacherFeedback: multilineFeedback,
        attachment: null,
      });

      render(<TeacherFeedbackSection />);

      expect(screen.getByText(/Parabéns!/)).toBeInTheDocument();
    });
  });

  describe('Attachment link', () => {
    it('should render attachment link with correct href', () => {
      const attachmentUrl = 'https://example.com/document.pdf';
      mockGetActivityFeedback.mockReturnValue({
        teacherFeedback: null,
        attachment: attachmentUrl,
      });

      render(<TeacherFeedbackSection />);

      const link = screen.getByRole('link', { name: /Ver anexo/i });
      expect(link).toHaveAttribute('href', attachmentUrl);
    });

    it('should open attachment link in new tab', () => {
      mockGetActivityFeedback.mockReturnValue({
        teacherFeedback: null,
        attachment: 'https://example.com/file.pdf',
      });

      render(<TeacherFeedbackSection />);

      const link = screen.getByRole('link', { name: /Ver anexo/i });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      mockGetActivityFeedback.mockReturnValue({
        teacherFeedback: 'Test feedback',
        attachment: null,
      });

      render(<TeacherFeedbackSection className="custom-class" />);

      const section = screen
        .getByText('Observação do Professor')
        .closest('div');
      expect(section).toHaveClass('custom-class');
    });

    it('should have correct base styles', () => {
      mockGetActivityFeedback.mockReturnValue({
        teacherFeedback: 'Test feedback',
        attachment: null,
      });

      render(<TeacherFeedbackSection />);

      const section = screen
        .getByText('Observação do Professor')
        .closest('div');
      expect(section).toHaveClass('bg-background');
      expect(section).toHaveClass('border');
      expect(section).toHaveClass('border-border-100');
      expect(section).toHaveClass('rounded-lg');
      expect(section).toHaveClass('p-4');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string feedback', () => {
      mockGetActivityFeedback.mockReturnValue({
        teacherFeedback: '',
        attachment: null,
      });

      const { container } = render(<TeacherFeedbackSection />);

      // Empty string is falsy, should not render
      expect(container.firstChild).toBeNull();
    });

    it('should handle empty string attachment', () => {
      mockGetActivityFeedback.mockReturnValue({
        teacherFeedback: null,
        attachment: '',
      });

      const { container } = render(<TeacherFeedbackSection />);

      // Empty string is falsy, should not render
      expect(container.firstChild).toBeNull();
    });

    it('should handle very long feedback text', () => {
      const longText = 'A'.repeat(1000);
      mockGetActivityFeedback.mockReturnValue({
        teacherFeedback: longText,
        attachment: null,
      });

      render(<TeacherFeedbackSection />);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle special characters in feedback', () => {
      const specialChars = 'Feedback com símbolos: <>&"\'';
      mockGetActivityFeedback.mockReturnValue({
        teacherFeedback: specialChars,
        attachment: null,
      });

      render(<TeacherFeedbackSection />);

      expect(screen.getByText(specialChars)).toBeInTheDocument();
    });
  });
});
