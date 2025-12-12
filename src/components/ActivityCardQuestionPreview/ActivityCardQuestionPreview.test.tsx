import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityCardQuestionPreview } from './ActivityCardQuestionPreview';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import { questionTypeLabels } from '../../types/questionTypes';

jest.mock('../Accordation/Accordation', () => {
  return {
    CardAccordation: ({
      expanded,
      onToggleExpanded,
      trigger,
      children,
      ...rest
    }: {
      expanded?: boolean;
      onToggleExpanded?: (value: boolean) => void;
      trigger: React.ReactNode;
      children: React.ReactNode;
    }) => (
      <div data-testid="card-accordation" data-expanded={expanded} {...rest}>
        <div
          data-testid="accordation-trigger"
          onClick={() => onToggleExpanded?.(!expanded)}
        >
          {trigger}
        </div>
        {expanded ? (
          <div data-testid="accordation-content">{children}</div>
        ) : null}
      </div>
    ),
  };
});

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
  enunciado: 'Texto da questão',
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
    expect(screen.getAllByText(`#${3}`)[0]).toBeInTheDocument();
    expect(screen.getAllByText(baseProps.enunciado)[0]).toBeInTheDocument();
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
    render(<ActivityCardQuestionPreview enunciado="Sem assunto" />);

    expect(screen.getAllByText('Assunto não informado')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Book')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Tipo de questão')[0]).toBeInTheDocument();
  });

  it('toggles expansion via trigger', () => {
    render(
      <ActivityCardQuestionPreview
        {...baseProps}
        questionType={QUESTION_TYPE.DISSERTATIVA}
        defaultExpanded={false}
      />
    );

    expect(screen.queryByTestId('accordation-content')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('accordation-trigger'));

    expect(screen.getByTestId('accordation-content')).toBeInTheDocument();
    expect(screen.getByText('Resposta do aluno')).toBeInTheDocument();
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
});
