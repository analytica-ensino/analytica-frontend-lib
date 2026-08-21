import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipientStep } from '../components/RecipientStep';
import type { CategoryConfig } from '../types';

// Mock CheckboxGroup to simplify testing
jest.mock('../../../CheckBoxGroup/CheckBoxGroup', () => ({
  CheckboxGroup: ({
    categories,
    onCategoriesChange,
  }: {
    categories: CategoryConfig[];
    onCategoriesChange: (cats: CategoryConfig[]) => void;
  }) => (
    <div data-testid="checkbox-group">
      <span data-testid="categories-count">{categories.length}</span>
      <span data-testid="categories-json">{JSON.stringify(categories)}</span>
      <button
        data-testid="trigger-change"
        onClick={() => onCategoriesChange(categories)}
      >
        Change
      </button>
    </div>
  ),
}));

const mockCategories: CategoryConfig[] = [
  {
    key: 'turma-a',
    label: 'Turma A',
    itens: [
      { id: '1', name: 'Aluno 1' },
      { id: '2', name: 'Aluno 2' },
    ],
  },
];

describe('RecipientStep', () => {
  const defaultProps = {
    categories: mockCategories,
    onCategoriesChange: jest.fn(),
    entityNameWithArticle: 'a aula',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the question text with entity name', () => {
    render(<RecipientStep {...defaultProps} />);
    expect(
      screen.getByText('Para quem você vai enviar a aula?')
    ).toBeInTheDocument();
  });

  it('should render with different entity name', () => {
    render(
      <RecipientStep {...defaultProps} entityNameWithArticle="a atividade" />
    );
    expect(
      screen.getByText('Para quem você vai enviar a atividade?')
    ).toBeInTheDocument();
  });

  it('should render CheckboxGroup with categories', () => {
    render(<RecipientStep {...defaultProps} />);
    expect(screen.getByTestId('checkbox-group')).toBeInTheDocument();
    expect(screen.getByTestId('categories-count')).toHaveTextContent('1');
  });

  it('should call onCategoriesChange when categories change', () => {
    const onCategoriesChange = jest.fn();
    render(
      <RecipientStep
        {...defaultProps}
        onCategoriesChange={onCategoriesChange}
      />
    );

    fireEvent.click(screen.getByTestId('trigger-change'));
    expect(onCategoriesChange).toHaveBeenCalledWith(mockCategories);
  });

  it('should render error message when studentsError is provided', () => {
    render(
      <RecipientStep
        {...defaultProps}
        studentsError="Selecione pelo menos um destinatário"
      />
    );
    expect(
      screen.getByText('Selecione pelo menos um destinatário')
    ).toBeInTheDocument();
  });

  it('should not render error message when studentsError is not provided', () => {
    render(<RecipientStep {...defaultProps} />);
    expect(
      screen.queryByText('Selecione pelo menos um destinatário')
    ).not.toBeInTheDocument();
  });

  it('should render with testId prefix when provided', () => {
    render(<RecipientStep {...defaultProps} testIdPrefix="lesson" />);
    expect(screen.getByTestId('lesson-recipient-step')).toBeInTheDocument();
  });

  it('should render error with testId when both testIdPrefix and error are provided', () => {
    render(
      <RecipientStep
        {...defaultProps}
        testIdPrefix="lesson"
        studentsError="Erro"
      />
    );
    expect(screen.getByTestId('lesson-students-error')).toBeInTheDocument();
  });

  it('should have scrollable container', () => {
    render(<RecipientStep {...defaultProps} />);
    const scrollContainer = screen.getByTestId('scroll-container');
    expect(scrollContainer).toHaveClass('overflow-y-auto');
    expect(scrollContainer).toHaveClass('flex-1');
    expect(scrollContainer).toHaveClass('min-h-0');
  });

  it('should render scroll container with testId prefix when provided', () => {
    render(<RecipientStep {...defaultProps} testIdPrefix="lesson" />);
    expect(screen.getByTestId('lesson-scroll-container')).toBeInTheDocument();
  });

  it('marks the students category as searchable and leaves others untouched', () => {
    const categories: CategoryConfig[] = [
      { key: 'turma-a', label: 'Turma A', itens: [{ id: '1', name: 'A' }] },
      {
        key: 'students',
        label: 'Estudantes',
        itens: [
          { id: '1', name: 'André' },
          { id: '2', name: 'Carlos' },
        ],
      },
    ];

    render(<RecipientStep {...defaultProps} categories={categories} />);

    const passed: CategoryConfig[] = JSON.parse(
      screen.getByTestId('categories-json').textContent as string
    );
    const students = passed.find((c) => c.key === 'students');
    const turma = passed.find((c) => c.key === 'turma-a');

    expect(students?.searchable).toBe(true);
    expect(turma?.searchable).toBeFalsy();
  });

  describe('warningMessage', () => {
    const WARNING =
      'ATENÇÃO! Alguns estudantes podem estar matriculados em duas turmas (FGB e IF). Confira para qual turma deseja enviar.';

    it('renders the warning alert with the exact text it receives', () => {
      render(<RecipientStep {...defaultProps} warningMessage={WARNING} />);

      expect(screen.getByText(WARNING)).toBeInTheDocument();
    });

    it('renders any text, not just the Enem Paraná message', () => {
      render(<RecipientStep {...defaultProps} warningMessage="Outro aviso." />);

      expect(screen.getByText('Outro aviso.')).toBeInTheDocument();
    });

    it('renders no alert when warningMessage is omitted', () => {
      const { container } = render(<RecipientStep {...defaultProps} />);

      expect(container.querySelector('.alert-wrapper')).toBeNull();
    });

    it('renders no alert when warningMessage is an empty string', () => {
      const { container } = render(
        <RecipientStep {...defaultProps} warningMessage="" />
      );

      expect(container.querySelector('.alert-wrapper')).toBeNull();
    });

    it('renders no alert when warningMessage is only whitespace', () => {
      const { container } = render(
        <RecipientStep {...defaultProps} warningMessage="   " />
      );

      expect(container.querySelector('.alert-wrapper')).toBeNull();
    });

    it('places the alert between the question and the recipients list', () => {
      const { container } = render(
        <RecipientStep {...defaultProps} warningMessage={WARNING} />
      );

      const alert = container.querySelector('.alert-wrapper') as HTMLElement;
      const question = screen.getByText('Para quem você vai enviar a aula?');
      const list = screen.getByTestId('scroll-container');

      // Node.DOCUMENT_POSITION_FOLLOWING === 4
      expect(question.compareDocumentPosition(alert) & 4).toBeTruthy();
      expect(alert.compareDocumentPosition(list) & 4).toBeTruthy();
    });

    it('exposes a testid for the alert when testIdPrefix is provided', () => {
      render(
        <RecipientStep
          {...defaultProps}
          warningMessage={WARNING}
          testIdPrefix="send-activity"
        />
      );

      expect(
        screen.getByTestId('send-activity-recipient-warning')
      ).toBeInTheDocument();
    });
  });

  it('does not mutate the original categories prop', () => {
    const categories: CategoryConfig[] = [
      { key: 'students', label: 'Estudantes', itens: [{ id: '1', name: 'A' }] },
    ];

    render(<RecipientStep {...defaultProps} categories={categories} />);

    // Original reference must remain unflagged (no in-place mutation)
    expect(categories[0].searchable).toBeUndefined();
  });
});
