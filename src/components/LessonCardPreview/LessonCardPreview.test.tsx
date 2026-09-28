import React from 'react';
import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import { LessonCardPreview } from './LessonCardPreview';

const mockGetSubjectColorWithOpacity = jest.fn(
  (color: string): string | undefined => color
);

jest.mock('../../index', () => ({
  IconRender: ({ iconName }: { iconName: string }) => (
    <span data-testid="icon">{iconName}</span>
  ),
  Text: ({ children, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...rest}>{children}</p>
  ),
  getSubjectColorWithOpacity: (color: string) =>
    mockGetSubjectColorWithOpacity(color),
}));

const subject = { name: 'Biologia', color: '#00aa00', icon: 'Leaf' };

/** Outer interactive card element (the drag ghost has no role). */
const getCard = (container: HTMLElement) =>
  container.querySelector('[role="button"]') as HTMLElement;

const getContent = () => screen.getByTestId('lesson-preview-content');

describe('LessonCardPreview', () => {
  beforeEach(() => {
    mockGetSubjectColorWithOpacity.mockImplementation((color) => color);
  });

  it('renders position, subject badge and truncated title', () => {
    render(
      <LessonCardPreview
        title="Estratégias para Preservação"
        position={1}
        subject={subject}
      />
    );

    // Visible header + drag ghost
    expect(screen.getAllByText('1º')).toHaveLength(2);
    expect(screen.getAllByText('Biologia')).toHaveLength(2);
    expect(screen.getAllByTestId('icon')[0]).toHaveTextContent('Leaf');

    const titles = screen.getAllByText('Estratégias para Preservação');
    // Ghost title, visible truncated title and the full title of the content
    expect(titles).toHaveLength(3);
    expect(titles[1].className).toContain('truncate');
    expect(titles[2].className).not.toContain('truncate');
  });

  it('falls back to default title, icon and color', () => {
    mockGetSubjectColorWithOpacity.mockReturnValue(undefined);

    render(<LessonCardPreview subject={{ name: 'Física' }} />);

    expect(screen.getAllByText('Aula sem título').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('icon')[0]).toHaveTextContent('Book');
    expect(mockGetSubjectColorWithOpacity).toHaveBeenCalledWith('#000000');
    expect(screen.queryByText(/º$/)).not.toBeInTheDocument();
  });

  it('hides the subject badge when the lesson has no subject', () => {
    render(<LessonCardPreview title="Aula" position={1} />);

    expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
  });

  it('shows the trail only when it has levels', () => {
    const { rerender } = render(<LessonCardPreview title="Aula" />);

    expect(screen.queryByTestId('lesson-trail')).not.toBeInTheDocument();

    rerender(
      <LessonCardPreview title="Aula" trail={['Biologia', 'Ecologia']} />
    );

    expect(screen.getByTestId('lesson-trail')).toHaveTextContent(
      'Biologia › Ecologia'
    );
  });

  it('toggles via the caret and links it to the content', () => {
    render(<LessonCardPreview title="Aula" value="lesson-1" />);

    const caret = screen.getByLabelText('Expandir aula');
    expect(caret).toHaveAttribute('aria-expanded', 'false');
    expect(caret).toHaveAttribute(
      'aria-controls',
      'lesson-preview-content-lesson-1'
    );
    expect(getContent()).toHaveAttribute('aria-hidden', 'true');

    fireEvent.click(caret);

    expect(screen.getByLabelText('Recolher aula')).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(getContent()).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByTestId('lesson-caret').getAttribute('class')).toContain(
      'rotate-180'
    );
  });

  it('toggles when the card is clicked', () => {
    const { container } = render(<LessonCardPreview title="Aula" />);

    const card = getCard(container);
    expect(card).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(card);
    expect(card).toHaveAttribute('aria-expanded', 'true');
    expect(card.getAttribute('aria-controls')).toBe(getContent().id);
  });

  it('toggles with Enter and Space, ignoring other keys and buttons', () => {
    const { container } = render(<LessonCardPreview title="Aula" />);
    const card = getCard(container);

    fireEvent.keyDown(card, { key: 'Tab' });
    expect(card).toHaveAttribute('aria-expanded', 'false');

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(card).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(card, { key: ' ' });
    expect(card).toHaveAttribute('aria-expanded', 'false');

    fireEvent.keyDown(screen.getByLabelText('Expandir aula'), {
      key: 'Enter',
    });
    expect(card).toHaveAttribute('aria-expanded', 'false');
  });

  it('calls onWatch without toggling the card', () => {
    const onWatch = jest.fn();
    const { container, rerender } = render(<LessonCardPreview title="Aula" />);

    expect(screen.queryByLabelText('Assistir aula')).not.toBeInTheDocument();

    rerender(<LessonCardPreview title="Aula" onWatch={onWatch} />);

    const watch = screen.getByLabelText('Assistir aula');
    expect(watch).toHaveAttribute('data-no-drag', 'true');

    fireEvent.click(watch);

    expect(onWatch).toHaveBeenCalledTimes(1);
    expect(getCard(container)).toHaveAttribute('aria-expanded', 'false');
  });

  it('calls onRemove without toggling the card', () => {
    const onRemove = jest.fn();
    const { container, rerender } = render(
      <LessonCardPreview title="Aula" position={2} />
    );

    expect(screen.queryByLabelText('Remover aula 2')).not.toBeInTheDocument();

    rerender(
      <LessonCardPreview title="Aula" position={2} onRemove={onRemove} />
    );

    fireEvent.click(screen.getByLabelText('Remover aula 2'));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(getCard(container)).toHaveAttribute('aria-expanded', 'false');
  });

  it('uses a generic remove label without position', () => {
    render(<LessonCardPreview title="Aula" onRemove={jest.fn()} />);

    expect(screen.getByLabelText('Remover aula')).toBeInTheDocument();
  });

  it('renders the drag handle only when showDragHandle is set', () => {
    const { container, rerender } = render(<LessonCardPreview title="Aula" />);

    expect(
      container.querySelector('[data-drag-handle="true"]')
    ).not.toBeInTheDocument();

    rerender(<LessonCardPreview title="Aula" showDragHandle />);

    expect(
      container.querySelector('[data-drag-handle="true"]')
    ).toBeInTheDocument();
  });

  it('renders a collapsed drag preview without actions', () => {
    const { container } = render(
      <LessonCardPreview
        title="Aula"
        position={1}
        onWatch={jest.fn()}
        onRemove={jest.fn()}
      />
    );

    const preview = container.querySelector(
      '[data-drag-preview="true"]'
    ) as HTMLElement;

    expect(preview).toHaveAttribute('aria-hidden', 'true');
    expect(preview).toHaveTextContent('1º');
    expect(preview).toHaveTextContent('Aula');
    expect(preview.querySelector('button')).not.toBeInTheDocument();
  });

  it('starts expanded when defaultExpanded is set', () => {
    render(<LessonCardPreview title="Aula" defaultExpanded />);

    expect(getContent()).toHaveAttribute('aria-hidden', 'false');
  });

  it('only prevents mouse down outside a draggable list', () => {
    const { container, rerender } = render(<LessonCardPreview title="Aula" />);

    const standalone = createEvent.mouseDown(getCard(container));
    fireEvent(getCard(container), standalone);
    expect(standalone.defaultPrevented).toBe(true);

    rerender(
      <div data-draggable="true">
        <LessonCardPreview title="Aula" />
      </div>
    );

    const inList = createEvent.mouseDown(getCard(container));
    fireEvent(getCard(container), inList);
    expect(inList.defaultPrevented).toBe(false);
  });

  it('applies a custom className to the visible card', () => {
    const { container } = render(
      <LessonCardPreview title="Aula" className="custom-card" />
    );

    expect(container.querySelector('.custom-card')).toBeInTheDocument();
  });
});
