import React from 'react';
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
  createEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  ActivityPreview,
  type ActivityPreviewProps,
  type PreviewQuestion,
} from './ActivityPreview';

jest.mock('../../assets/img/mock-content.png', () => 'mock-content.png');
jest.mock(
  '../../assets/img/mock-image-question.png',
  () => 'mock-image-question.png'
);

jest.mock('../../index', () => {
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
      RELACIONAR: 'RELACIONAR',
      PREENCHER_LACUNAS: 'PREENCHER_LACUNAS',
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
    statement,
    value,
    position,
    solutionExplanation,
  }: {
    statement?: string;
    value: string;
    position?: number;
    solutionExplanation?: string | null;
  }) => (
    <div
      data-testid="activity-card-preview"
      data-value={value}
      data-position={position}
      data-solution={solutionExplanation ?? ''}
    >
      <div data-drag-preview="true">drag-preview</div>
      <span>{statement ?? value}</span>
      <span data-testid="position">{position}</span>
    </div>
  ),
}));

/**
 * jsdom has no layout, so the drop indicator geometry has to be stubbed:
 * the list starts at y=0 and each card is 100px tall with a 10px gap.
 */
const stubListGeometry = () => {
  const setRect = (element: Element, top: number, height: number) => {
    element.getBoundingClientRect = () =>
      ({
        top,
        height,
        bottom: top + height,
        left: 0,
        right: 200,
        width: 200,
        x: 0,
        y: top,
        toJSON: () => ({}),
      }) as DOMRect;
  };

  setRect(screen.getByTestId('questions-list'), 0, 210);
  setRect(screen.getByLabelText('Mover questão First question'), 0, 100);
  setRect(screen.getByLabelText('Mover questão Second question'), 110, 100);
};

/**
 * jsdom has no DragEvent, so `clientY` passed through fireEvent's init is
 * dropped. Define it on the event itself instead.
 */
const fireDragAt = (
  type: 'dragOver' | 'drop',
  element: Element,
  dataTransfer: DataTransfer,
  clientY: number
) => {
  const event = createEvent[type](element, { dataTransfer });
  Object.defineProperty(event, 'clientY', { value: clientY });
  fireEvent(element, event);
  return event;
};

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
  { id: 'q1', statement: 'First question' },
  { id: 'q2', statement: 'Second question' },
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

    stubListGeometry();

    fireEvent.dragStart(firstCard, { dataTransfer });
    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'q1');
    fireDragAt('dragOver', secondCard, dataTransfer, 200);
    fireDragAt('drop', secondCard, dataTransfer, 200);

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

    expect(dataTransfer.setDragImage).toHaveBeenCalledWith(preview, 8, 8);
  });

  it('prevents default on drag over while a reorder drag is active', () => {
    const dataTransfer = createDataTransfer();
    renderComponent();

    const firstCard = screen.getByLabelText('Mover questão First question');
    fireEvent.dragStart(firstCard, { dataTransfer });

    const event = createEvent.dragOver(firstCard, {
      dataTransfer,
      clientY: 40,
    });
    event.preventDefault = jest.fn();

    fireEvent(firstCard, event);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('ignores drag over when no reorder drag is active', () => {
    renderComponent();

    const firstCard = screen.getByLabelText('Mover questão First question');
    const event = createEvent.dragOver(firstCard);
    event.preventDefault = jest.fn();

    fireEvent(firstCard, event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(screen.queryByTestId('drop-placeholder')).not.toBeInTheDocument();
  });

  it('shows the drop placeholder at the position the card will land on', () => {
    const dataTransfer = createDataTransfer();
    renderComponent();

    const firstCard = screen.getByLabelText('Mover questão First question');
    stubListGeometry();

    fireEvent.dragStart(firstCard, { dataTransfer });
    expect(screen.queryByTestId('drop-placeholder')).not.toBeInTheDocument();

    // Below the second card's midpoint (160) -> lands after it
    fireDragAt('dragOver', firstCard, dataTransfer, 200);

    const cards = screen.getAllByTestId('activity-card-preview');
    const placeholder = screen.getByTestId('drop-placeholder');
    expect(placeholder).toBeInTheDocument();
    expect(
      placeholder.compareDocumentPosition(cards[1]) &
        Node.DOCUMENT_POSITION_PRECEDING
    ).toBeTruthy();

    fireEvent.dragEnd(firstCard);
    expect(screen.queryByTestId('drop-placeholder')).not.toBeInTheDocument();
  });

  it('drops the card at the indicated position instead of the hovered card', () => {
    const onReorder = jest.fn();
    const dataTransfer = createDataTransfer();
    renderComponent({ onReorder });

    const firstCard = screen.getByLabelText('Mover questão First question');
    stubListGeometry();

    fireEvent.dragStart(firstCard, { dataTransfer });
    fireDragAt('dragOver', firstCard, dataTransfer, 200);
    fireDragAt('drop', firstCard, dataTransfer, 200);

    expect(getOrder()).toEqual(['q2', 'q1']);
    expect(onReorder).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'q2', position: 1 }),
      expect.objectContaining({ id: 'q1', position: 2 }),
    ]);
  });

  it('auto-scrolls the list while dragging towards its top edge', () => {
    const frames: ((time: number) => void)[] = [];
    const rafSpy = jest
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        frames.push(callback);
        return frames.length;
      });
    const cafSpy = jest
      .spyOn(globalThis, 'cancelAnimationFrame')
      .mockImplementation(() => undefined);

    try {
      const dataTransfer = createDataTransfer();
      renderComponent();

      const list = screen.getByTestId('questions-list');
      const scroller = list.parentElement as HTMLElement;

      // jsdom has no layout: make the panel a real scrolling box
      scroller.style.overflowY = 'auto';
      Object.defineProperty(scroller, 'scrollHeight', { value: 1000 });
      Object.defineProperty(scroller, 'clientHeight', { value: 300 });
      let scrollTop = 500;
      Object.defineProperty(scroller, 'scrollTop', {
        configurable: true,
        get: () => scrollTop,
        set: (value: number) => {
          scrollTop = value;
        },
      });
      scroller.getBoundingClientRect = () =>
        ({ top: 0, bottom: 300, height: 300 }) as DOMRect;

      stubListGeometry();

      const firstCard = screen.getByLabelText('Mover questão First question');
      fireEvent.dragStart(firstCard, { dataTransfer });

      // Pointer near the top edge of the scroller
      fireDragAt('dragOver', firstCard, dataTransfer, 8);

      expect(frames).toHaveLength(1);
      frames.shift()?.(0);
      expect(scroller.scrollTop).toBeLessThan(500);

      // Back to the middle: the auto-scroll stops
      const before = scroller.scrollTop;
      fireDragAt('dragOver', firstCard, dataTransfer, 150);
      frames.shift()?.(0);
      expect(scroller.scrollTop).toBe(before);
    } finally {
      rafSpy.mockRestore();
      cafSpy.mockRestore();
    }
  });

  it('does not reorder when the drop indicator points at the original slot', () => {
    const onReorder = jest.fn();
    const dataTransfer = createDataTransfer();
    renderComponent({ onReorder });

    const firstCard = screen.getByLabelText('Mover questão First question');
    stubListGeometry();

    fireEvent.dragStart(firstCard, { dataTransfer });
    // Above the second card's midpoint (160) -> still the first slot
    fireDragAt('dragOver', firstCard, dataTransfer, 140);
    fireDragAt('drop', firstCard, dataTransfer, 140);

    expect(getOrder()).toEqual(['q1', 'q2']);
    expect(onReorder).not.toHaveBeenCalled();
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
      <ActivityPreview
        questions={baseQuestions}
        onPositionsChange={onPositionsChange}
      />
    );

    await waitFor(() => expect(onPositionsChange).toHaveBeenCalledTimes(1));
    onPositionsChange.mockClear();

    const newQuestions: PreviewQuestion[] = [
      { id: 'q3', statement: 'Third question' },
    ];
    rerender(
      <ActivityPreview
        questions={newQuestions}
        onPositionsChange={onPositionsChange}
      />
    );

    expect(getOrder()).toEqual(['q3']);
    await waitFor(() =>
      expect(onPositionsChange).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'q3', position: 1 }),
      ])
    );
  });

  it('passes solutionExplanation through to each question card', () => {
    renderComponent({
      questions: [
        { id: 'q1', statement: 'First', solutionExplanation: 'Resolucao X' },
      ],
    });

    expect(
      screen.getByTestId('activity-card-preview').getAttribute('data-solution')
    ).toBe('Resolucao X');
  });
});
