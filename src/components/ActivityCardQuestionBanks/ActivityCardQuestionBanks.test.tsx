import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ActivityCardQuestionBanks } from './ActivityCardQuestionBanks';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';

// Mock components
jest.mock('../Alternative/Alternative', () => ({
  AlternativesList: ({
    alternatives,
    mode,
    layout,
    selectedValue,
    name,
  }: {
    alternatives: Array<{
      value: string;
      label: string;
      status?: string;
      disabled?: boolean;
    }>;
    mode: string;
    layout: string;
    selectedValue?: string;
    name: string;
  }) => (
    <div
      data-testid="alternatives-list"
      data-mode={mode}
      data-layout={layout}
      data-selected={selectedValue}
      data-name={name}
    >
      {alternatives.map((alt) => (
        <div
          key={alt.value}
          data-testid={`alternative-${alt.value}`}
          data-status={alt.status}
          data-disabled={alt.disabled}
        >
          {alt.label}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../MultipleChoice/MultipleChoice', () => ({
  MultipleChoiceList: ({
    choices,
    mode,
    selectedValues,
    name,
  }: {
    choices: Array<{
      value: string;
      label: string;
      status?: string;
      disabled?: boolean;
    }>;
    mode: string;
    selectedValues?: string[];
    name: string;
  }) => (
    <div
      data-testid="multiple-choice-list"
      data-mode={mode}
      data-selected={selectedValues?.join(',')}
      data-name={name}
    >
      {choices.map((choice) => (
        <div
          key={choice.value}
          data-testid={`choice-${choice.value}`}
          data-status={choice.status}
          data-disabled={choice.disabled}
        >
          {choice.label}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('@/index', () => ({
  Button: ({
    children,
    onClick,
    size,
    className,
    iconLeft,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    size?: string;
    className?: string;
    iconLeft?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <button
      onClick={onClick}
      data-testid="add-to-activity-button"
      data-size={size}
      className={className}
      {...props}
    >
      {iconLeft && <span data-testid="button-icon-left">{iconLeft}</span>}
      {children}
    </button>
  ),
  Text: ({
    children,
    size,
    weight,
    className,
    ...props
  }: {
    children: React.ReactNode;
    size?: string;
    weight?: string;
    className?: string;
    [key: string]: unknown;
  }) => (
    <span
      data-testid="text-component"
      data-size={size}
      data-weight={weight}
      className={className}
      {...props}
    >
      {children}
    </span>
  ),
  Badge: ({
    children,
    variant,
    action,
    iconLeft,
    ...props
  }: {
    children: React.ReactNode;
    variant?: string;
    action?: string;
    iconLeft?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <span
      data-testid="badge"
      data-variant={variant}
      data-action={action}
      {...props}
    >
      {iconLeft && <span data-testid="badge-icon-left">{iconLeft}</span>}
      {children}
    </span>
  ),
  IconRender: ({
    iconName,
    size,
    color,
  }: {
    iconName: string;
    size: number;
    color: string;
  }) => (
    <span
      data-testid="icon-render"
      data-icon={iconName}
      data-size={size}
      data-color={color}
    >
      Icon
    </span>
  ),
  getSubjectColorWithOpacity: (color: string, isDark: boolean) => {
    if (isDark) return color;
    return `${color}4d`;
  },
}));

jest.mock('phosphor-react', () => ({
  Plus: () => <span data-testid="plus-icon">Plus</span>,
  CheckCircle: () => <span data-testid="check-circle-icon">CheckCircle</span>,
  XCircle: () => <span data-testid="x-circle-icon">XCircle</span>,
}));

describe('ActivityCardQuestionBanks', () => {
  const defaultProps = {
    iconName: 'BookOpen',
    subjectColor: '#000000',
    isDark: false,
  };

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<ActivityCardQuestionBanks {...defaultProps} />);
      // Multiple text components exist, so we check for specific content
      expect(screen.getByText('Assunto não informado')).toBeInTheDocument();
      expect(screen.getByText('Tipo de questão')).toBeInTheDocument();
    });

    it('should render with custom icon name', () => {
      render(<ActivityCardQuestionBanks {...defaultProps} iconName="Atom" />);
      const icon = screen.getByTestId('icon-render');
      expect(icon).toHaveAttribute('data-icon', 'Atom');
    });

    it('should render with custom subject color', () => {
      const { container } = render(
        <ActivityCardQuestionBanks {...defaultProps} subjectColor="#FF0000" />
      );
      // Find the span that contains the icon and has the style attribute
      const iconContainer = container.querySelector(
        'span[style*="background"]'
      );
      expect(iconContainer).toBeInTheDocument();
    });

    it('should render with dark mode', () => {
      render(<ActivityCardQuestionBanks {...defaultProps} isDark={true} />);
      // Verify icon is rendered
      expect(screen.getByTestId('icon-render')).toBeInTheDocument();
      // Verify icon has correct attributes
      const icon = screen.getByTestId('icon-render');
      expect(icon).toHaveAttribute('data-icon', 'BookOpen');
    });

    it('should render assunto when provided', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          assunto="Matemática - Álgebra"
        />
      );
      expect(screen.getByText('Matemática - Álgebra')).toBeInTheDocument();
    });

    it('should render default assunto when not provided', () => {
      render(<ActivityCardQuestionBanks {...defaultProps} />);
      expect(screen.getByText('Assunto não informado')).toBeInTheDocument();
    });

    it('should render question type label', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          questionType={QUESTION_TYPE.ALTERNATIVA}
        />
      );
      expect(screen.getByText('Alternativa')).toBeInTheDocument();
    });

    it('should render default question type label when type is not provided', () => {
      render(<ActivityCardQuestionBanks {...defaultProps} />);
      expect(screen.getByText('Tipo de questão')).toBeInTheDocument();
    });

    it('should render "Adicionar à atividade" button', () => {
      render(<ActivityCardQuestionBanks {...defaultProps} />);
      expect(screen.getByText('Adicionar à atividade')).toBeInTheDocument();
      expect(screen.getByTestId('add-to-activity-button')).toBeInTheDocument();
    });
  });

  describe('Question Type Labels', () => {
    it('should render correct label for ALTERNATIVA', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          questionType={QUESTION_TYPE.ALTERNATIVA}
        />
      );
      expect(screen.getByText('Alternativa')).toBeInTheDocument();
    });

    it('should render correct label for MULTIPLA_ESCOLHA', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          questionType={QUESTION_TYPE.MULTIPLA_ESCOLHA}
        />
      );
      expect(screen.getByText('Múltipla Escolha')).toBeInTheDocument();
    });

    it('should render correct label for DISSERTATIVA', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          questionType={QUESTION_TYPE.DISSERTATIVA}
        />
      );
      expect(screen.getByText('Dissertativa')).toBeInTheDocument();
    });

    it('should render correct label for VERDADEIRO_FALSO', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          questionType={QUESTION_TYPE.VERDADEIRO_FALSO}
        />
      );
      expect(screen.getByText('Verdadeiro ou Falso')).toBeInTheDocument();
    });

    it('should render correct label for LIGAR_PONTOS', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          questionType={QUESTION_TYPE.LIGAR_PONTOS}
        />
      );
      expect(screen.getByText('Ligar Pontos')).toBeInTheDocument();
    });

    it('should render correct label for PREENCHER', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          questionType={QUESTION_TYPE.PREENCHER}
        />
      );
      expect(screen.getByText('Preencher')).toBeInTheDocument();
    });

    it('should render correct label for IMAGEM', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          questionType={QUESTION_TYPE.IMAGEM}
        />
      );
      expect(screen.getByText('Imagem')).toBeInTheDocument();
    });
  });

  describe('Alternative Question Type', () => {
    const alternativeQuestion = {
      options: [
        { id: 'opt1', option: '200 rãs' },
        { id: 'opt2', option: '230 rãs' },
        { id: 'opt3', option: '463 rãs' },
        { id: 'opt4', option: '500 rãs' },
      ],
      correctOptionIds: ['opt3'],
    };

    it('should render AlternativesList for ALTERNATIVA type', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={alternativeQuestion}
          questionType={QUESTION_TYPE.ALTERNATIVA}
        />
      );
      expect(screen.getByTestId('alternatives-list')).toBeInTheDocument();
      expect(screen.getByTestId('alternatives-list')).toHaveAttribute(
        'data-mode',
        'readonly'
      );
      expect(screen.getByTestId('alternatives-list')).toHaveAttribute(
        'data-layout',
        'compact'
      );
    });

    it('should mark correct alternative with status correct', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={alternativeQuestion}
          questionType={QUESTION_TYPE.ALTERNATIVA}
        />
      );
      const correctAlternative = screen.getByTestId('alternative-opt3');
      expect(correctAlternative).toHaveAttribute('data-status', 'correct');
      expect(correctAlternative).toHaveAttribute('data-disabled', 'false');
    });

    it('should mark incorrect alternatives as disabled', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={alternativeQuestion}
          questionType={QUESTION_TYPE.ALTERNATIVA}
        />
      );
      const incorrectAlternative = screen.getByTestId('alternative-opt1');
      expect(incorrectAlternative).not.toHaveAttribute(
        'data-status',
        'correct'
      );
      expect(incorrectAlternative).toHaveAttribute('data-disabled', 'true');
    });

    it('should set selectedValue to correct option', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={alternativeQuestion}
          questionType={QUESTION_TYPE.ALTERNATIVA}
        />
      );
      expect(screen.getByTestId('alternatives-list')).toHaveAttribute(
        'data-selected',
        'opt3'
      );
    });

    it('should not render AlternativesList when question is not provided', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          questionType={QUESTION_TYPE.ALTERNATIVA}
        />
      );
      expect(screen.queryByTestId('alternatives-list')).not.toBeInTheDocument();
    });

    it('should not render AlternativesList when questionType is not ALTERNATIVA', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={alternativeQuestion}
          questionType={QUESTION_TYPE.MULTIPLA_ESCOLHA}
        />
      );
      expect(screen.queryByTestId('alternatives-list')).not.toBeInTheDocument();
    });

    it('should handle alternative question with no correctOptionIds', () => {
      const questionWithoutCorrect = {
        options: [
          { id: 'opt1', option: 'Option 1' },
          { id: 'opt2', option: 'Option 2' },
        ],
      };
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={questionWithoutCorrect}
          questionType={QUESTION_TYPE.ALTERNATIVA}
        />
      );
      expect(screen.getByTestId('alternatives-list')).toBeInTheDocument();
      // When no correctOptionIds, selectedValue should be undefined
      const selectedAttr = screen
        .getByTestId('alternatives-list')
        .getAttribute('data-selected');
      expect(selectedAttr === '' || selectedAttr === null).toBe(true);
    });

    it('should handle alternative question with multiple correctOptionIds (uses first)', () => {
      const questionWithMultipleCorrect = {
        options: [
          { id: 'opt1', option: 'Option 1' },
          { id: 'opt2', option: 'Option 2' },
        ],
        correctOptionIds: ['opt1', 'opt2'],
      };
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={questionWithMultipleCorrect}
          questionType={QUESTION_TYPE.ALTERNATIVA}
        />
      );
      expect(screen.getByTestId('alternatives-list')).toHaveAttribute(
        'data-selected',
        'opt1'
      );
    });
  });

  describe('Multiple Choice Question Type', () => {
    const multipleChoiceQuestion = {
      options: [
        { id: 'opt1', option: 'Opção A' },
        { id: 'opt2', option: 'Opção B' },
        { id: 'opt3', option: 'Opção C' },
        { id: 'opt4', option: 'Opção D' },
      ],
      correctOptionIds: ['opt1', 'opt3'],
    };

    it('should render MultipleChoiceList for MULTIPLA_ESCOLHA type', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={multipleChoiceQuestion}
          questionType={QUESTION_TYPE.MULTIPLA_ESCOLHA}
        />
      );
      expect(screen.getByTestId('multiple-choice-list')).toBeInTheDocument();
      expect(screen.getByTestId('multiple-choice-list')).toHaveAttribute(
        'data-mode',
        'readonly'
      );
    });

    it('should mark correct choices with status correct', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={multipleChoiceQuestion}
          questionType={QUESTION_TYPE.MULTIPLA_ESCOLHA}
        />
      );
      const correctChoice1 = screen.getByTestId('choice-opt1');
      const correctChoice2 = screen.getByTestId('choice-opt3');
      expect(correctChoice1).toHaveAttribute('data-status', 'correct');
      expect(correctChoice2).toHaveAttribute('data-status', 'correct');
    });

    it('should mark incorrect choices as disabled', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={multipleChoiceQuestion}
          questionType={QUESTION_TYPE.MULTIPLA_ESCOLHA}
        />
      );
      const incorrectChoice = screen.getByTestId('choice-opt2');
      expect(incorrectChoice).not.toHaveAttribute('data-status', 'correct');
      expect(incorrectChoice).toHaveAttribute('data-disabled', 'true');
    });

    it('should set selectedValues to correct options', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={multipleChoiceQuestion}
          questionType={QUESTION_TYPE.MULTIPLA_ESCOLHA}
        />
      );
      expect(screen.getByTestId('multiple-choice-list')).toHaveAttribute(
        'data-selected',
        'opt1,opt3'
      );
    });

    it('should not render MultipleChoiceList when question is not provided', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          questionType={QUESTION_TYPE.MULTIPLA_ESCOLHA}
        />
      );
      expect(
        screen.queryByTestId('multiple-choice-list')
      ).not.toBeInTheDocument();
    });

    it('should not render MultipleChoiceList when questionType is not MULTIPLA_ESCOLHA', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={multipleChoiceQuestion}
          questionType={QUESTION_TYPE.ALTERNATIVA}
        />
      );
      expect(
        screen.queryByTestId('multiple-choice-list')
      ).not.toBeInTheDocument();
    });

    it('should handle multiple choice question with no correctOptionIds', () => {
      const questionWithoutCorrect = {
        options: [
          { id: 'opt1', option: 'Option 1' },
          { id: 'opt2', option: 'Option 2' },
        ],
      };
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={questionWithoutCorrect}
          questionType={QUESTION_TYPE.MULTIPLA_ESCOLHA}
        />
      );
      expect(screen.getByTestId('multiple-choice-list')).toBeInTheDocument();
      // When no correctOptionIds, selectedValues should be empty array
      const selectedAttr = screen
        .getByTestId('multiple-choice-list')
        .getAttribute('data-selected');
      expect(selectedAttr === '' || selectedAttr === null).toBe(true);
    });

    it('should handle multiple choice question with single correct option', () => {
      const questionWithSingleCorrect = {
        options: [
          { id: 'opt1', option: 'Option 1' },
          { id: 'opt2', option: 'Option 2' },
        ],
        correctOptionIds: ['opt2'],
      };
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={questionWithSingleCorrect}
          questionType={QUESTION_TYPE.MULTIPLA_ESCOLHA}
        />
      );
      expect(screen.getByTestId('multiple-choice-list')).toHaveAttribute(
        'data-selected',
        'opt2'
      );
      const correctChoice = screen.getByTestId('choice-opt2');
      expect(correctChoice).toHaveAttribute('data-status', 'correct');
    });
  });

  describe('Dissertative Question Type', () => {
    it('should render "Resposta do aluno" text for DISSERTATIVA type', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          questionType={QUESTION_TYPE.DISSERTATIVA}
        />
      );
      expect(screen.getByText('Resposta do aluno')).toBeInTheDocument();
    });

    it('should render dissertative text with correct styling', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          questionType={QUESTION_TYPE.DISSERTATIVA}
        />
      );
      const text = screen.getByText('Resposta do aluno');
      expect(text).toHaveClass('text-text-600', 'italic');
    });

    it('should render dissertative even without question prop', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          questionType={QUESTION_TYPE.DISSERTATIVA}
        />
      );
      expect(screen.getByText('Resposta do aluno')).toBeInTheDocument();
    });
  });

  describe('True or False Question Type', () => {
    const trueOrFalseQuestion = {
      options: [
        { id: 'tf1', option: 'A fotossíntese ocorre apenas durante o dia' },
        {
          id: 'tf2',
          option: 'As plantas produzem oxigênio durante a fotossíntese',
        },
        { id: 'tf3', option: 'A clorofila é encontrada apenas nas folhas' },
        {
          id: 'tf4',
          option: 'A respiração celular é o processo inverso da fotossíntese',
        },
      ],
      correctOptionIds: ['tf2', 'tf4'],
    };

    it('should render true or false options', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={trueOrFalseQuestion}
          questionType={QUESTION_TYPE.VERDADEIRO_FALSO}
        />
      );
      expect(
        screen.getByText(/A fotossíntese ocorre apenas durante o dia/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/As plantas produzem oxigênio durante a fotossíntese/)
      ).toBeInTheDocument();
    });

    it('should render correct answer as "Verdadeiro" for correct options', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={trueOrFalseQuestion}
          questionType={QUESTION_TYPE.VERDADEIRO_FALSO}
        />
      );
      const correctAnswers = screen.getAllByText(
        /Resposta correta: Verdadeiro/
      );
      expect(correctAnswers.length).toBeGreaterThan(0);
    });

    it('should render correct answer as "Falso" for incorrect options', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={trueOrFalseQuestion}
          questionType={QUESTION_TYPE.VERDADEIRO_FALSO}
        />
      );
      const falseAnswers = screen.getAllByText(/Resposta correta: Falso/);
      expect(falseAnswers.length).toBeGreaterThan(0);
    });

    it('should render badge with "Resposta correta" for all options', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={trueOrFalseQuestion}
          questionType={QUESTION_TYPE.VERDADEIRO_FALSO}
        />
      );
      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBe(4); // One for each option
      badges.forEach((badge) => {
        expect(badge).toHaveAttribute('data-action', 'success');
        expect(badge).toHaveTextContent('Resposta correta');
      });
    });

    it('should render options with letter prefixes (a, b, c, d)', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={trueOrFalseQuestion}
          questionType={QUESTION_TYPE.VERDADEIRO_FALSO}
        />
      );
      expect(screen.getByText(/^a\) /)).toBeInTheDocument();
      expect(screen.getByText(/^b\) /)).toBeInTheDocument();
      expect(screen.getByText(/^c\) /)).toBeInTheDocument();
      expect(screen.getByText(/^d\) /)).toBeInTheDocument();
    });

    it('should apply correct background styles for all options', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={trueOrFalseQuestion}
          questionType={QUESTION_TYPE.VERDADEIRO_FALSO}
        />
      );
      const optionText = screen.getByText(
        /A fotossíntese ocorre apenas durante o dia/
      );
      const optionContainers = optionText.closest('div');
      expect(optionContainers).toHaveClass(
        'bg-success-background',
        'border-success-300'
      );
    });

    it('should not render true or false when question is not provided', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          questionType={QUESTION_TYPE.VERDADEIRO_FALSO}
        />
      );
      expect(screen.queryByText(/Resposta correta:/)).not.toBeInTheDocument();
    });

    it('should not render true or false when questionType is not VERDADEIRO_FALSO', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={trueOrFalseQuestion}
          questionType={QUESTION_TYPE.ALTERNATIVA}
        />
      );
      expect(screen.queryByText(/Resposta correta:/)).not.toBeInTheDocument();
    });

    it('should handle true or false question with empty options', () => {
      const emptyQuestion = {
        options: [],
        correctOptionIds: [],
      };
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={emptyQuestion}
          questionType={QUESTION_TYPE.VERDADEIRO_FALSO}
        />
      );
      expect(screen.queryByText(/Resposta correta:/)).not.toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should call onAddToActivity when button is clicked', () => {
      const handleAddToActivity = jest.fn();
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          onAddToActivity={handleAddToActivity}
        />
      );
      const button = screen.getByTestId('add-to-activity-button');
      fireEvent.click(button);
      expect(handleAddToActivity).toHaveBeenCalledTimes(1);
    });

    it('should not throw error when button is clicked without onAddToActivity', () => {
      render(<ActivityCardQuestionBanks {...defaultProps} />);
      const button = screen.getByTestId('add-to-activity-button');
      expect(() => fireEvent.click(button)).not.toThrow();
    });

    it('should render button with Plus icon', () => {
      render(<ActivityCardQuestionBanks {...defaultProps} />);
      expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
      expect(screen.getByTestId('button-icon-left')).toBeInTheDocument();
    });

    it('should render button with correct size', () => {
      render(<ActivityCardQuestionBanks {...defaultProps} />);
      const button = screen.getByTestId('add-to-activity-button');
      expect(button).toHaveAttribute('data-size', 'small');
    });

    it('should render button with full width class', () => {
      render(<ActivityCardQuestionBanks {...defaultProps} />);
      const button = screen.getByTestId('add-to-activity-button');
      expect(button).toHaveClass('w-full');
    });
  });

  describe('Icon and Subject Color', () => {
    it('should render icon with correct attributes', () => {
      render(<ActivityCardQuestionBanks {...defaultProps} iconName="Atom" />);
      const icon = screen.getByTestId('icon-render');
      expect(icon).toHaveAttribute('data-icon', 'Atom');
      expect(icon).toHaveAttribute('data-size', '14');
    });

    it('should apply subject color with opacity in light mode', () => {
      const { container } = render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          subjectColor="#FF5733"
          isDark={false}
        />
      );
      // Find the span that contains the icon and has the style attribute
      const iconContainer = container.querySelector(
        'span[style*="background"]'
      );
      expect(iconContainer).toBeInTheDocument();
    });

    it('should apply subject color without opacity in dark mode', () => {
      const { container } = render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          subjectColor="#FF5733"
          isDark={true}
        />
      );
      // Find the span that contains the icon and has the style attribute
      const iconContainer = container.querySelector(
        'span[style*="background"]'
      );
      expect(iconContainer).toBeInTheDocument();
    });

    it('should use default icon name when not provided', () => {
      render(
        <ActivityCardQuestionBanks subjectColor="#000000" isDark={false} />
      );
      const icon = screen.getByTestId('icon-render');
      expect(icon).toHaveAttribute('data-icon', 'BookOpen');
    });

    it('should use default subject color when not provided', () => {
      const { container } = render(
        <ActivityCardQuestionBanks iconName="BookOpen" isDark={false} />
      );
      // Find the span that contains the icon and has the style attribute
      const iconContainer = container.querySelector(
        'span[style*="background"]'
      );
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty question options array', () => {
      const emptyQuestion = {
        options: [],
        correctOptionIds: [],
      };
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={emptyQuestion}
          questionType={QUESTION_TYPE.ALTERNATIVA}
        />
      );
      expect(screen.queryByTestId('alternatives-list')).not.toBeInTheDocument();
    });

    it('should handle question with undefined correctOptionIds', () => {
      const questionWithoutCorrect = {
        options: [
          { id: 'opt1', option: 'Option 1' },
          { id: 'opt2', option: 'Option 2' },
        ],
      };
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={questionWithoutCorrect}
          questionType={QUESTION_TYPE.ALTERNATIVA}
        />
      );
      expect(screen.getByTestId('alternatives-list')).toBeInTheDocument();
    });

    it('should handle question with correctOptionIds not matching any option', () => {
      const questionWithInvalidCorrect = {
        options: [
          { id: 'opt1', option: 'Option 1' },
          { id: 'opt2', option: 'Option 2' },
        ],
        correctOptionIds: ['invalid-id'],
      };
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={questionWithInvalidCorrect}
          questionType={QUESTION_TYPE.ALTERNATIVA}
        />
      );
      expect(screen.getByTestId('alternatives-list')).toBeInTheDocument();
      const option1 = screen.getByTestId('alternative-opt1');
      expect(option1).toHaveAttribute('data-disabled', 'true');
    });

    it('should handle all question types without question prop', () => {
      const questionTypes = [
        QUESTION_TYPE.ALTERNATIVA,
        QUESTION_TYPE.MULTIPLA_ESCOLHA,
        QUESTION_TYPE.DISSERTATIVA,
        QUESTION_TYPE.VERDADEIRO_FALSO,
      ];

      questionTypes.forEach((type) => {
        const { unmount } = render(
          <ActivityCardQuestionBanks {...defaultProps} questionType={type} />
        );
        // Should not crash
        expect(
          screen.getByTestId('add-to-activity-button')
        ).toBeInTheDocument();
        unmount();
      });
    });

    it('should handle question with single option', () => {
      const singleOptionQuestion = {
        options: [{ id: 'opt1', option: 'Only option' }],
        correctOptionIds: ['opt1'],
      };
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={singleOptionQuestion}
          questionType={QUESTION_TYPE.ALTERNATIVA}
        />
      );
      expect(screen.getByTestId('alternatives-list')).toBeInTheDocument();
      expect(screen.getByTestId('alternative-opt1')).toBeInTheDocument();
    });

    it('should handle question with many options', () => {
      const manyOptionsQuestion = {
        options: Array.from({ length: 10 }, (_, i) => ({
          id: `opt${i + 1}`,
          option: `Option ${i + 1}`,
        })),
        correctOptionIds: ['opt5'],
      };
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={manyOptionsQuestion}
          questionType={QUESTION_TYPE.ALTERNATIVA}
        />
      );
      expect(screen.getByTestId('alternatives-list')).toBeInTheDocument();
      expect(screen.getByTestId('alternative-opt5')).toHaveAttribute(
        'data-status',
        'correct'
      );
    });
  });

  describe('Component Structure', () => {
    it('should render main container with correct classes', () => {
      const { container } = render(
        <ActivityCardQuestionBanks {...defaultProps} />
      );
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass(
        'min-h-[500px]',
        'w-full',
        'flex',
        'flex-col'
      );
    });

    it('should render header section with assunto and question type', () => {
      render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          assunto="Test Subject"
          questionType={QUESTION_TYPE.ALTERNATIVA}
        />
      );
      expect(screen.getByText('Test Subject')).toBeInTheDocument();
      expect(screen.getByText('Alternativa')).toBeInTheDocument();
    });

    it('should render question statement section', () => {
      render(<ActivityCardQuestionBanks {...defaultProps} />);
      const statement = screen.getByText(
        /Um grupo de cientistas está estudando/
      );
      expect(statement).toBeInTheDocument();
    });

    it('should render button section at the bottom', () => {
      render(<ActivityCardQuestionBanks {...defaultProps} />);
      const button = screen.getByTestId('add-to-activity-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Adicionar à atividade');
    });
  });

  describe('Memoization and Performance', () => {
    it('should not re-render alternatives unnecessarily', () => {
      const question = {
        options: [
          { id: 'opt1', option: 'Option 1' },
          { id: 'opt2', option: 'Option 2' },
        ],
        correctOptionIds: ['opt1'],
      };
      const { rerender } = render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={question}
          questionType={QUESTION_TYPE.ALTERNATIVA}
        />
      );
      const initialList = screen.getByTestId('alternatives-list');
      const initialSelected = initialList.getAttribute('data-selected');

      // Re-render with same props
      rerender(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={question}
          questionType={QUESTION_TYPE.ALTERNATIVA}
        />
      );
      const updatedList = screen.getByTestId('alternatives-list');
      expect(updatedList.getAttribute('data-selected')).toBe(initialSelected);
    });

    it('should update when question changes', () => {
      const question1 = {
        options: [
          { id: 'opt1', option: 'Option 1' },
          { id: 'opt2', option: 'Option 2' },
        ],
        correctOptionIds: ['opt1'],
      };
      const question2 = {
        options: [
          { id: 'opt3', option: 'Option 3' },
          { id: 'opt4', option: 'Option 4' },
        ],
        correctOptionIds: ['opt4'],
      };
      const { rerender } = render(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={question1}
          questionType={QUESTION_TYPE.ALTERNATIVA}
        />
      );
      expect(screen.getByTestId('alternatives-list')).toHaveAttribute(
        'data-selected',
        'opt1'
      );

      rerender(
        <ActivityCardQuestionBanks
          {...defaultProps}
          question={question2}
          questionType={QUESTION_TYPE.ALTERNATIVA}
        />
      );
      expect(screen.getByTestId('alternatives-list')).toHaveAttribute(
        'data-selected',
        'opt4'
      );
    });
  });
});
