import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityCardQuestionPreview } from './ActivityCardQuestionPreview';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import { questionTypeLabels } from '../../types/questionTypes';

jest.mock('../../index', () => {
  return {
    IconRender: ({ iconName }: { iconName: string }) => (
      <span data-testid="icon">{iconName}</span>
    ),
    Text: ({
      children,
      ...rest
    }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p {...rest}>{children}</p>
    ),
    getSubjectColorWithOpacity: (color: string) => color,
    Badge: ({
      children,
      action,
    }: {
      children: React.ReactNode;
      action: string;
    }) => (
      <span data-testid="badge" data-action={action}>
        {children}
      </span>
    ),
  };
});

jest.mock('../Alternative/Alternative', () => ({
  ...jest.requireActual('../Alternative/Alternative'),
  AlternativesList: ({
    alternatives,
    selectedValue,
  }: {
    alternatives: unknown[];
    selectedValue?: string;
  }) => (
    <div
      data-testid="alternatives-list"
      data-alternatives={JSON.stringify(alternatives)}
      data-selected={selectedValue}
    />
  ),
}));

jest.mock('../MultipleChoice/MultipleChoice', () => ({
  MultipleChoiceList: ({
    choices,
    selectedValues,
  }: {
    choices: unknown[];
    selectedValues?: string[];
  }) => (
    <div
      data-testid="multiple-choice-list"
      data-choices={JSON.stringify(choices)}
      data-selected={JSON.stringify(selectedValues)}
    />
  ),
}));

const baseProps = {
  subjectName: 'Biologia',
  subjectColor: '#00aa00',
  iconName: 'Leaf',
  statement: 'Texto da questão',
};

describe('ActivityCardQuestionPreview', () => {
  it('renders header info and position badge', () => {
    render(
      <ActivityCardQuestionPreview
        {...baseProps}
        questionType={QUESTION_TYPE.ALTERNATIVA}
        position={3}
      />
    );

    expect(screen.getAllByText(baseProps.subjectName)[0]).toBeInTheDocument();
    expect(
      screen.getAllByText(questionTypeLabels[QUESTION_TYPE.ALTERNATIVA])[0]
    ).toBeInTheDocument();
    expect(screen.getAllByText('3º')[0]).toBeInTheDocument();
    expect(screen.getAllByText(baseProps.statement)[0]).toBeInTheDocument();
    const positionContainer = screen
      .getAllByText(baseProps.subjectName)[0]
      .closest('[data-position]');
    expect(positionContainer).toHaveAttribute('data-position', '3');
  });

  it('uses fallback label when questionType is undefined', () => {
    render(
      <ActivityCardQuestionPreview
        {...baseProps}
        questionTypeLabel="Custom type"
      />
    );

    expect(screen.getAllByText('Custom type')[0]).toBeInTheDocument();
  });

  it('uses defaults when subjectName and iconName are missing', () => {
    render(<ActivityCardQuestionPreview statement="Sem assunto" />);

    expect(screen.getAllByText('Assunto não informado')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Book')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Tipo de questão')[0]).toBeInTheDocument();
  });

  it('toggles expansion when the card is clicked', () => {
    render(
      <ActivityCardQuestionPreview
        {...baseProps}
        questionType={QUESTION_TYPE.DISSERTATIVA}
        defaultExpanded={false}
        position={1}
      />
    );

    const card = screen
      .getAllByText(baseProps.subjectName)[0]
      .closest('[data-position]') as HTMLElement;
    const content = screen.getAllByTestId('question-preview-content')[0];

    expect(card).toHaveAttribute('aria-expanded', 'false');
    expect(content).toHaveAttribute('aria-hidden', 'true');

    fireEvent.click(card);

    expect(card).toHaveAttribute('aria-expanded', 'true');
    expect(content).toHaveAttribute('aria-hidden', 'false');
  });

  it('toggles expansion via the caret button', () => {
    render(
      <ActivityCardQuestionPreview
        {...baseProps}
        questionType={QUESTION_TYPE.DISSERTATIVA}
      />
    );

    fireEvent.click(screen.getAllByLabelText('Expandir questão')[0]);

    expect(
      screen.getAllByTestId('question-preview-content')[0]
    ).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getAllByLabelText('Recolher questão')[0]).toBeInTheDocument();
  });

  it('renders the remove action only when onRemove is provided and does not toggle the card', () => {
    const onRemove = jest.fn();

    const { rerender } = render(
      <ActivityCardQuestionPreview {...baseProps} position={2} />
    );

    expect(
      screen.queryByLabelText('Remover questão 2')
    ).not.toBeInTheDocument();

    rerender(
      <ActivityCardQuestionPreview
        {...baseProps}
        position={2}
        onRemove={onRemove}
      />
    );

    fireEvent.click(screen.getAllByLabelText('Remover questão 2')[0]);

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(
      screen.getAllByTestId('question-preview-content')[0]
    ).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the drag handle only when showDragHandle is set', () => {
    const { container, rerender } = render(
      <ActivityCardQuestionPreview {...baseProps} />
    );

    expect(
      container.querySelector('[data-drag-handle="true"]')
    ).not.toBeInTheDocument();

    rerender(<ActivityCardQuestionPreview {...baseProps} showDragHandle />);

    expect(
      container.querySelector('[data-drag-handle="true"]')
    ).toBeInTheDocument();
  });

  it('renders alternatives list with correct props', () => {
    render(
      <ActivityCardQuestionPreview
        {...baseProps}
        questionType={QUESTION_TYPE.ALTERNATIVA}
        question={{
          options: [
            { id: 'a', option: 'Opção A' },
            { id: 'b', option: 'Opção B' },
          ],
          correctOptionIds: ['a'],
        }}
        defaultExpanded
        value="q1"
      />
    );

    const list = screen.getByTestId('alternatives-list');
    const alternatives = JSON.parse(
      list.getAttribute('data-alternatives') || '[]'
    );

    expect(alternatives).toHaveLength(2);
    expect(alternatives[0]).toMatchObject({
      value: 'a',
      label: 'Opção A',
      status: 'correct',
      disabled: false,
    });
    expect(list.getAttribute('data-selected')).toBe('a');
  });

  it('renders multiple choice list with correct props', () => {
    render(
      <ActivityCardQuestionPreview
        {...baseProps}
        questionType={QUESTION_TYPE.MULTIPLA_ESCOLHA}
        question={{
          options: [
            { id: 'a', option: 'Opção A' },
            { id: 'b', option: 'Opção B' },
          ],
          correctOptionIds: ['a', 'b'],
        }}
        defaultExpanded
        value="q2"
      />
    );

    const list = screen.getByTestId('multiple-choice-list');
    const choices = JSON.parse(list.getAttribute('data-choices') || '[]');
    const selected = JSON.parse(list.getAttribute('data-selected') || '[]');

    expect(choices).toHaveLength(2);
    expect(choices[1]).toMatchObject({
      value: 'b',
      label: 'Opção B',
      status: 'correct',
      disabled: false,
    });
    expect(selected).toEqual(['a', 'b']);
  });

  it('renders true or false blocks with badges', () => {
    render(
      <ActivityCardQuestionPreview
        {...baseProps}
        questionType={QUESTION_TYPE.VERDADEIRO_FALSO}
        question={{
          options: [
            { id: 'a', option: 'Afirmação 1' },
            { id: 'b', option: 'Afirmação 2' },
          ],
          correctOptionIds: ['a'],
        }}
        defaultExpanded
      />
    );

    expect(
      screen.getByText('Resposta correta: Verdadeiro')
    ).toBeInTheDocument();
    expect(screen.getByText('Resposta correta: Falso')).toBeInTheDocument();
    const badges = screen
      .getAllByTestId('badge')
      .map((b) => b.getAttribute('data-action'));
    expect(badges).toContain('success');
    expect(badges).toContain('error');
  });

  it('renders RELACIONAR matching pairs with correct values', () => {
    render(
      <ActivityCardQuestionPreview
        {...baseProps}
        questionType={QUESTION_TYPE.RELACIONAR}
        matchingPairs={[
          { id: '1', option: 'Gato', correctValue: 'Leite' },
          { id: '2', option: 'Cachorro', correctValue: 'Ração' },
          { id: '3', option: 'Galinha', correctValue: 'Milho' },
        ]}
        defaultExpanded
      />
    );

    // Check that the title is rendered
    expect(screen.getByText('Alternativas')).toBeInTheDocument();

    // Check that options are rendered with letters
    expect(screen.getByText('a) Gato')).toBeInTheDocument();
    expect(screen.getByText('b) Cachorro')).toBeInTheDocument();
    expect(screen.getByText('c) Galinha')).toBeInTheDocument();

    // Check that correct values are displayed
    expect(screen.getByText('Resposta correta: Leite')).toBeInTheDocument();
    expect(screen.getByText('Resposta correta: Ração')).toBeInTheDocument();
    expect(screen.getByText('Resposta correta: Milho')).toBeInTheDocument();

    // Check that success badges are rendered
    const badges = screen
      .getAllByTestId('badge')
      .filter((b) => b.getAttribute('data-action') === 'success');
    expect(badges).toHaveLength(3);
  });

  it('renders nothing for RELACIONAR when matchingPairs is empty', () => {
    render(
      <ActivityCardQuestionPreview
        {...baseProps}
        questionType={QUESTION_TYPE.RELACIONAR}
        matchingPairs={[]}
        defaultExpanded
      />
    );

    expect(screen.queryByText('Alternativas')).not.toBeInTheDocument();
  });

  it('renders nothing for RELACIONAR when matchingPairs is undefined', () => {
    render(
      <ActivityCardQuestionPreview
        {...baseProps}
        questionType={QUESTION_TYPE.RELACIONAR}
        defaultExpanded
      />
    );

    expect(screen.queryByText('Alternativas')).not.toBeInTheDocument();
  });

  it('renders the resolution block when solutionExplanation is provided', () => {
    render(
      <ActivityCardQuestionPreview
        {...baseProps}
        questionType={QUESTION_TYPE.ALTERNATIVA}
        solutionExplanation="Explicacao da resolucao"
        defaultExpanded
      />
    );

    expect(screen.getByText('Resolução')).toBeInTheDocument();
    expect(screen.getByText('Explicacao da resolucao')).toBeInTheDocument();
  });

  it('does not render the resolution block when solutionExplanation is null', () => {
    render(
      <ActivityCardQuestionPreview
        {...baseProps}
        questionType={QUESTION_TYPE.ALTERNATIVA}
        solutionExplanation={null}
        defaultExpanded
      />
    );

    expect(screen.queryByText('Resolução')).not.toBeInTheDocument();
  });

  it('does not render the resolution block when solutionExplanation is only whitespace/markup', () => {
    render(
      <ActivityCardQuestionPreview
        {...baseProps}
        questionType={QUESTION_TYPE.ALTERNATIVA}
        solutionExplanation="   "
        defaultExpanded
      />
    );

    expect(screen.queryByText('Resolução')).not.toBeInTheDocument();
  });
});
