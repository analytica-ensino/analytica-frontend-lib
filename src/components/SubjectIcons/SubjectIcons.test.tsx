import { fireEvent, render, screen, within } from '@testing-library/react';
import { SubjectIcons, type SubjectIconsItem } from './SubjectIcons';

const makeSubject = (
  overrides: Partial<SubjectIconsItem> & { id: string; name: string }
): SubjectIconsItem => ({
  color: '#0066b8',
  icon: 'Atom',
  ...overrides,
});

const SUBJECTS: SubjectIconsItem[] = [
  makeSubject({ id: '1', name: 'Biologia', icon: 'Atom' }),
  makeSubject({ id: '2', name: 'Física', icon: 'Atom', color: '#b80066' }),
  makeSubject({ id: '3', name: 'Matemática', icon: 'MathOperations' }),
  makeSubject({ id: '4', name: 'Química', icon: 'Flask' }),
  makeSubject({ id: '5', name: 'História', icon: 'BookOpen' }),
];

describe('SubjectIcons', () => {
  it('renders a dash when there is no subject', () => {
    render(<SubjectIcons subjects={[]} />);

    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.queryByTestId('subject-icons')).not.toBeInTheDocument();
  });

  it('renders nothing when there is no subject and showEmptyDash is false', () => {
    const { container } = render(
      <SubjectIcons subjects={[]} showEmptyDash={false} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders a single subject without a counter', () => {
    render(<SubjectIcons subjects={SUBJECTS.slice(0, 1)} />);

    const row = screen.getByTestId('subject-icons');
    expect(within(row).getByLabelText('Biologia')).toBeInTheDocument();
    expect(within(row).queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('renders every subject when the count is within maxVisible', () => {
    render(<SubjectIcons subjects={SUBJECTS.slice(0, 3)} />);

    const row = screen.getByTestId('subject-icons');
    expect(within(row).getByLabelText('Biologia')).toBeInTheDocument();
    expect(within(row).getByLabelText('Física')).toBeInTheDocument();
    expect(within(row).getByLabelText('Matemática')).toBeInTheDocument();
    expect(within(row).queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('collapses the excess into a "+N" counter', () => {
    render(<SubjectIcons subjects={SUBJECTS} />);

    const row = screen.getByTestId('subject-icons');
    expect(within(row).getByLabelText('Biologia')).toBeInTheDocument();
    expect(within(row).getByLabelText('Matemática')).toBeInTheDocument();
    // Beyond maxVisible: drawn as the counter, not as icons.
    expect(within(row).queryByLabelText('Química')).not.toBeInTheDocument();
    expect(within(row).queryByLabelText('História')).not.toBeInTheDocument();
    expect(within(row).getByText('+2')).toBeInTheDocument();
  });

  it('honors a custom maxVisible', () => {
    render(<SubjectIcons subjects={SUBJECTS} maxVisible={1} />);

    const row = screen.getByTestId('subject-icons');
    expect(within(row).getByLabelText('Biologia')).toBeInTheDocument();
    expect(within(row).queryByLabelText('Física')).not.toBeInTheDocument();
    expect(within(row).getByText('+4')).toBeInTheDocument();
  });

  it('lists every subject name in the tooltip, including the collapsed ones', () => {
    render(<SubjectIcons subjects={SUBJECTS} />);

    // The portal tooltip only mounts its content once the trigger is hovered.
    const trigger = screen.getByTestId('subject-icons').parentElement;
    fireEvent.mouseEnter(trigger as HTMLElement);

    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Biologia, Física, Matemática, Química, História'
    );
  });

  it('applies the subject color to the chip background', () => {
    render(<SubjectIcons subjects={SUBJECTS.slice(1, 2)} />);

    // Light mode is the default, so the helper appends the 30% alpha suffix.
    expect(screen.getByLabelText('Física')).toHaveStyle({
      backgroundColor: '#b800664d',
    });
  });

  it('falls back to a default icon when the backend sent an empty icon name', () => {
    render(
      <SubjectIcons
        subjects={[makeSubject({ id: '9', name: 'Sem ícone', icon: '' })]}
      />
    );

    // The chip still renders; IconRender resolves the fallback name.
    expect(screen.getByLabelText('Sem ícone')).toBeInTheDocument();
  });

  it('applies a custom className to the wrapper', () => {
    render(<SubjectIcons subjects={SUBJECTS.slice(0, 1)} className="gap-4" />);

    expect(screen.getByTestId('subject-icons')).toHaveClass('gap-4');
  });
});
