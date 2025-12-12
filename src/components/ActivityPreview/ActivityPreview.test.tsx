import React from 'react';
import { render, screen, fireEvent, within, waitFor, createEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ActivityPreview, type ActivityPreviewProps, type PreviewQuestion } from './ActivityPreview';

jest.mock('../../assets/img/mock-content.png', () => 'mock-content.png');
jest.mock('../../assets/img/mock-image-question.png', () => 'mock-image-question.png');

jest.mock('../../index', () => {
  const React = require('react');
  const asComponent =
    (tag: keyof React.JSX.IntrinsicElements) =>
    ({ children, ...props }: { children?: React.ReactNode }) =>
      React.createElement(tag, props, children);

  const placeholder = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  );

  return {
    Button: asComponent('button'),
    Text: asComponent('span'),
    Chips: asComponent('button'),
    Radio: asComponent('div'),
    IconRender: () => null,
    getSubjectColorWithOpacity: () => '#000000',
    useTheme: () => ({ theme: 'light' }),
    CheckboxGroup: placeholder,
    DropdownMenu: placeholder,
    DropdownMenuContent: placeholder,
    DropdownMenuTrigger: placeholder,
    QUESTION_TYPE: {
      ALTERNATIVA: 'ALTERNATIVA',
      VERDADEIRO_FALSO: 'VERDADEIRO_FALSO',
      DISSERTATIVA: 'DISSERTATIVA',
      IMAGEM: 'IMAGEM',
      MULTIPLA_ESCOLHA: 'MULTIPLA_ESCOLHA',
      LIGAR_PONTOS: 'LIGAR_PONTOS',
      PREENCHER: 'PREENCHER',
    },
  };
});

jest.mock('../Quiz/useQuizStore', () => ({
  QUESTION_TYPE: {
    ALTERNATIVA: 'ALTERNATIVA',
    VERDADEIRO_FALSO: 'VERDADEIRO_FALSO',
    DISSERTATIVA: 'DISSERTATIVA',
    IMAGEM: 'IMAGEM',
  },
}));

jest.mock('../ActivityCardQuestionPreview/ActivityCardQuestionPreview', () => ({
  ActivityCardQuestionPreview: ({
    enunciado,
    value,
    position,
  }: {
    enunciado?: string;
    value: string;
    position?: number;
  }) => (
    <div
      data-testid="activity-card-preview"
      data-value={value}
      data-position={position}
    >
      <div data-drag-preview="true">drag-preview</div>
      <span>{enunciado ?? value}</span>
      <span data-testid="position">{position}</span>
    </div>
  ),
}));

const createDataTransfer = (initialId?: string) => {
  const store = new Map<string, string>();
  if (initialId) store.set('text/plain', initialId);

  return {
    setData: jest.fn((type: string, value: string) => store.set(type, value)),
    getData: jest.fn((type: string) => store.get(type) ?? ''),
    setDragImage: jest.fn(),
  } as unknown as DataTransfer;
};

const baseQuestions: PreviewQuestion[] = [
  { id: 'q1', enunciado: 'First question' },
  { id: 'q2', enunciado: 'Second question' },
];

const renderComponent = (props: Partial<ActivityPreviewProps> = {}) =>
  render(<ActivityPreview questions={baseQuestions} {...props} />);

const getOrder = () =>
  screen
    .queryAllByTestId('activity-card-preview')
    .map((el) => el.getAttribute('data-value'));

describe('ActivityPreview', () => {
  it('renders title and plural total label', () => {
    renderComponent({ title: 'Custom title' });

    expect(screen.getByText('Custom title')).toBeInTheDocument();
    expect(screen.getByText('2 questões adicionadas')).toBeInTheDocument();
  });

  it('renders singular total label for one question', () => {
    renderComponent({ questions: [{ id: 'only-one' }] });

    expect(screen.getByText('1 questão adicionada')).toBeInTheDocument();
  });

  it('calls download and remove handlers', () => {
    const onDownloadPdf = jest.fn();
    const onRemoveAll = jest.fn();

    renderComponent({ onDownloadPdf, onRemoveAll });

    fireEvent.click(screen.getByText('Baixar pdf'));
    fireEvent.click(screen.getByText('Remover tudo'));

    expect(onDownloadPdf).toHaveBeenCalledTimes(1);
    expect(onRemoveAll).toHaveBeenCalledTimes(1);
  });

  it('notifies initial positions on mount', async () => {
    const onPositionsChange = jest.fn();

    renderComponent({ onPositionsChange });

    await waitFor(() =>
      expect(onPositionsChange).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'q1', position: 1 }),
        expect.objectContaining({ id: 'q2', position: 2 }),
      ])
    );
  });

  it('reorders items via drag and drop and updates callbacks', async () => {
    const onReorder = jest.fn();
    const onPositionsChange = jest.fn();
    const dataTransfer = createDataTransfer();

    renderComponent({ onReorder, onPositionsChange });

    await waitFor(() => expect(onPositionsChange).toHaveBeenCalled());
    onPositionsChange.mockClear();

    const firstCard = screen.getByLabelText('Mover questão First question');
    const secondCard = screen.getByLabelText('Mover questão Second question');

    fireEvent.dragStart(firstCard, { dataTransfer });
    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'q1');
    fireEvent.drop(secondCard, { dataTransfer });

    expect(getOrder()).toEqual(['q2', 'q1']);
    expect(onReorder).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'q2', position: 1 }),
      expect.objectContaining({ id: 'q1', position: 2 }),
    ]);
    expect(onPositionsChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'q2', position: 1 }),
      expect.objectContaining({ id: 'q1', position: 2 }),
    ]);
  });

  it('uses drag preview element when setting drag image', () => {
    const dataTransfer = createDataTransfer();
    renderComponent();

    const firstCard = screen.getByLabelText('Mover questão First question');
    const preview = within(firstCard).getByText('drag-preview');

    fireEvent.dragStart(firstCard, { dataTransfer });

    expect(dataTransfer.setDragImage).toHaveBeenCalledWith(
      preview,
      8,
      8
    );
  });

  it('prevents default on drag over', () => {
    renderComponent();

    const firstCard = screen.getByLabelText('Mover questão First question');
    const event = createEvent.dragOver(firstCard);
    event.preventDefault = jest.fn();

    fireEvent(firstCard, event);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('does not reorder when dropping on the same item', () => {
    const onReorder = jest.fn();
    const dataTransfer = createDataTransfer('q1');

    renderComponent({ onReorder });

    const firstCard = screen.getByLabelText('Mover questão First question');
    fireEvent.drop(firstCard, { dataTransfer });

    expect(getOrder()).toEqual(['q1', 'q2']);
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('moves items with keyboard arrows', () => {
    renderComponent();

    const firstCard = screen.getByLabelText('Mover questão First question');
    const arrowDownEvent = createEvent.keyDown(firstCard, { key: 'ArrowDown' });
    arrowDownEvent.preventDefault = jest.fn();

    fireEvent(firstCard, arrowDownEvent);
    expect(arrowDownEvent.preventDefault).toHaveBeenCalled();
    expect(getOrder()).toEqual(['q2', 'q1']);

    const secondCard = screen.getByLabelText('Mover questão First question');
    const arrowUpEvent = createEvent.keyDown(secondCard, { key: 'ArrowUp' });
    arrowUpEvent.preventDefault = jest.fn();

    fireEvent(secondCard, arrowUpEvent);
    expect(arrowUpEvent.preventDefault).toHaveBeenCalled();
    expect(getOrder()).toEqual(['q1', 'q2']);
  });

  it('prevents default on Enter and Space without reordering', () => {
    renderComponent();

    const firstCard = screen.getByLabelText('Mover questão First question');
    const enterEvent = createEvent.keyDown(firstCard, { key: 'Enter' });
    enterEvent.preventDefault = jest.fn();
    fireEvent(firstCard, enterEvent);
    expect(enterEvent.preventDefault).toHaveBeenCalled();
    expect(getOrder()).toEqual(['q1', 'q2']);

    const spaceEvent = createEvent.keyDown(firstCard, { key: ' ' });
    spaceEvent.preventDefault = jest.fn();
    fireEvent(firstCard, spaceEvent);
    expect(spaceEvent.preventDefault).toHaveBeenCalled();
    expect(getOrder()).toEqual(['q1', 'q2']);
  });

  it('resets order when questions prop changes and emits positions', async () => {
    const onPositionsChange = jest.fn();
    const { rerender } = render(
      <ActivityPreview questions={baseQuestions} onPositionsChange={onPositionsChange} />
    );

    await waitFor(() => expect(onPositionsChange).toHaveBeenCalledTimes(1));
    onPositionsChange.mockClear();

    const newQuestions: PreviewQuestion[] = [{ id: 'q3', enunciado: 'Third question' }];
    rerender(<ActivityPreview questions={newQuestions} onPositionsChange={onPositionsChange} />);

    expect(getOrder()).toEqual(['q3']);
    await waitFor(() =>
      expect(onPositionsChange).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'q3', position: 1 }),
      ])
    );
  });
});
