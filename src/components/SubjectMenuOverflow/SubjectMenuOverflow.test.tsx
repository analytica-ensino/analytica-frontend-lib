import { render, screen, fireEvent } from '@testing-library/react';
import { SubjectMenuOverflow } from './SubjectMenuOverflow';

const subjects = [
  { id: 's-1', name: 'Arte', color: '#FF0000', icon: 'Palette' },
  { id: 's-2', name: 'Biologia', color: null, icon: null },
];

describe('SubjectMenuOverflow', () => {
  it('leads the strip with "Todos" and lists every subject', () => {
    render(
      <SubjectMenuOverflow
        subjects={subjects}
        selectedSubjectId={null}
        onSubjectChange={jest.fn()}
      />
    );

    for (const label of ['Todos', 'Arte', 'Biologia']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('reports the chosen subject', () => {
    const onSubjectChange = jest.fn();
    render(
      <SubjectMenuOverflow
        subjects={subjects}
        selectedSubjectId={null}
        onSubjectChange={onSubjectChange}
      />
    );

    fireEvent.click(screen.getByText('Arte'));

    expect(onSubjectChange).toHaveBeenCalledWith('s-1');
  });

  // "Todos" is a synthetic entry, so it reports the absence of a cut rather
  // than an id the caller would have to know about.
  it('reports null when "Todos" is chosen', () => {
    const onSubjectChange = jest.fn();
    render(
      <SubjectMenuOverflow
        subjects={subjects}
        selectedSubjectId="s-1"
        onSubjectChange={onSubjectChange}
      />
    );

    fireEvent.click(screen.getByText('Todos'));

    expect(onSubjectChange).toHaveBeenCalledWith(null);
  });

  // The printed report names the cut it shows; the other subjects are
  // navigation, not content.
  it('keeps every subject but the selected one out of the print', () => {
    render(
      <SubjectMenuOverflow
        subjects={subjects}
        selectedSubjectId="s-1"
        onSubjectChange={jest.fn()}
      />
    );

    const item = (label: string) =>
      screen.getByText(label).closest('li') as HTMLElement;

    expect(item('Arte')).not.toHaveAttribute('data-print-hide');
    expect(item('Biologia')).toHaveAttribute('data-print-hide');
    expect(item('Todos')).toHaveAttribute('data-print-hide');
  });

  it('dims the strip and stops clicks while loading', () => {
    render(
      <SubjectMenuOverflow
        subjects={subjects}
        selectedSubjectId={null}
        onSubjectChange={jest.fn()}
        loading
      />
    );

    const strip = screen.getByTestId('subject-menu-overflow');
    expect(strip.className).toContain('opacity-50');
    expect(strip.className).toContain('pointer-events-none');
  });

  it('renders with no subjects yet', () => {
    render(
      <SubjectMenuOverflow
        subjects={[]}
        selectedSubjectId={null}
        onSubjectChange={jest.fn()}
      />
    );

    expect(screen.getByText('Todos')).toBeInTheDocument();
  });
});
