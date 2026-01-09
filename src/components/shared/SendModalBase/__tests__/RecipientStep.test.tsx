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
    const scrollContainer = screen
      .getByTestId('checkbox-group')
      .closest(String.raw`.max-h-\[300px\]`);
    expect(scrollContainer).toHaveClass('overflow-y-auto');
  });
});
