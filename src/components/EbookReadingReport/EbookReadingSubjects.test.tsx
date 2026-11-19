import { fireEvent, render, screen, within } from '@testing-library/react';
import {
  EbookReadingSubjects,
  SUBJECTS_PREVIEW_SIZE,
  searchSubjects,
  shareOfTotal,
} from './EbookReadingSubjects';
import type { EbookReadingBySubject, EbookReadingSubjectRow } from './types';

/** A subject of the matrix. */
const subject = (
  id: string,
  name: string,
  counts: Partial<EbookReadingSubjectRow> = {}
): EbookReadingSubjectRow => ({
  id,
  name,
  icon: 'BookOpenText',
  color: '#0066b8',
  areaKnowledgeId: 'area-1',
  areaKnowledgeName: 'Linguagens, Códigos e suas Tecnologias',
  books: 10,
  read: 5,
  opened: 3,
  notRead: 2,
  readRate: 50,
  ...counts,
});

const DATA: EbookReadingBySubject = {
  total: { books: 285, read: 174, opened: 96, notRead: 15, readRate: 61.05 },
  rows: [
    subject('pt', 'Língua Portuguesa', {
      books: 90,
      read: 65,
      opened: 20,
      notRead: 5,
      readRate: 72.22,
    }),
    subject('lit', 'Literatura'),
    subject('en', 'Inglês'),
    subject('es', 'Espanhol'),
    subject('art', 'Arte'),
  ],
};

/** The figures of "Dados de leitura", as their text. */
const figures = () =>
  screen.getByText('Dados de leitura').closest('div')?.textContent ?? '';

describe('EbookReadingSubjects', () => {
  it('shows every book on the "Todos" tab', () => {
    render(<EbookReadingSubjects data={DATA} loading={false} />);

    expect(
      screen.getByRole('heading', { name: 'Dados por componente curricular' })
    ).toBeInTheDocument();
    expect(figures()).toContain('Total de livros285100% do total');
    expect(figures()).toContain('Livros lidos17461% do total');
    expect(figures()).toContain('Abertos9634% do total');
    expect(figures()).toContain('Não lidos155% do total');
    expect(screen.getByTestId('reading-bar-books')).toHaveStyle({
      height: '100%',
    });
  });

  it("shows a subject's books on its tab", () => {
    render(<EbookReadingSubjects data={DATA} loading={false} />);
    const tabs = screen.getByRole('tablist', {
      name: 'Componentes curriculares',
    });

    fireEvent.click(within(tabs).getByText('Língua Portuguesa'));

    expect(figures()).toContain('Total de livros90100% do total');
    expect(figures()).toContain('Livros lidos6572% do total');
  });

  it('shows the first subjects, and all of them on asking', () => {
    render(<EbookReadingSubjects data={DATA} loading={false} />);
    const table = screen.getByRole('table');

    expect(within(table).queryByText('Arte')).toBeNull();
    expect(within(table).getAllByRole('row').length - 1).toBe(
      SUBJECTS_PREVIEW_SIZE
    );
    expect(
      screen.getByText('5 componentes curriculares no total')
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByText('Mostrar todos os 5 componentes curriculares')
    );

    expect(within(table).getByText('Arte')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Mostrar menos'));
    expect(within(table).queryByText('Arte')).toBeNull();
  });

  it('writes the share read of each subject', () => {
    render(<EbookReadingSubjects data={DATA} loading={false} />);

    expect(screen.getByText('72,2%')).toBeInTheDocument();
  });

  it('holds its place while it loads', () => {
    const { container } = render(<EbookReadingSubjects data={null} loading />);

    expect(container.querySelector('.h-\\[320px\\]')).toBeInTheDocument();
    expect(screen.queryByText('Dados de leitura')).toBeNull();
  });

  it('says "componente" for a single subject and offers no "show all"', () => {
    render(
      <EbookReadingSubjects
        data={{ ...DATA, rows: [DATA.rows[0]] }}
        loading={false}
      />
    );

    expect(
      screen.getByText('1 componente curricular no total')
    ).toBeInTheDocument();
    expect(screen.queryByText(/Mostrar todos/)).toBeNull();
  });
});

describe('searchSubjects', () => {
  it('finds a subject by its name, ignoring case and accents', () => {
    expect(searchSubjects(DATA.rows, 'lingua').map((row) => row.id)).toEqual([
      'pt',
    ]);
    expect(searchSubjects(DATA.rows, '  ')).toBe(DATA.rows);
    expect(searchSubjects(DATA.rows, undefined)).toBe(DATA.rows);
  });
});

describe('shareOfTotal', () => {
  it('writes a part as a whole percentage of the total', () => {
    expect(shareOfTotal(174, 285)).toBe('61% do total');
    expect(shareOfTotal(3, 0)).toBe('0% do total');
  });
});
