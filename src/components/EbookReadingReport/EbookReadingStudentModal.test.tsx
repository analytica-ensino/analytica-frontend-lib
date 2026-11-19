import { fireEvent, render, screen } from '@testing-library/react';
import {
  EbookReadingStudentModal,
  studentTotals,
  type EbookReadingStudentModalProps,
} from './EbookReadingStudentModal';
import type { EbookReadingStudentBook } from './types';

/** A book of the student. */
const book = (
  overrides: Partial<EbookReadingStudentBook> = {}
): EbookReadingStudentBook => ({
  ebookId: 'eb-40',
  code: 'EB40',
  title: 'O Caso da Couve Mordida',
  coverUrl: 'https://cdn.test/capa.webp',
  category: 'Educação 4.0 e 5.0',
  percent: 100,
  timeSpentSeconds: 1800,
  accesses: 4,
  lastReadAt: '2026-11-17T12:00:00Z',
  effectiveReadAt: '2026-11-17T12:00:00Z',
  sectionsSeen: [
    { sectionKey: 'caso', title: 'O caso', seenAt: null },
    { sectionKey: 'p04', title: 'p04', seenAt: null },
  ],
  ...overrides,
});

/** A book released to the student and not read. */
const UNREAD = {
  ebookId: 'eb-06',
  code: 'EB06',
  title: 'O Preço do Tempo',
  coverUrl: null,
  category: 'Educação Financeira',
};

/** Renders the modal, open, with the given state. */
const renderModal = (props: Partial<EbookReadingStudentModalProps> = {}) => {
  const onRetry = jest.fn();
  const onClose = jest.fn();
  render(
    <EbookReadingStudentModal
      isOpen
      onClose={onClose}
      title="Desempenho em 7 dias"
      data={{
        userInstitutionId: 'student-1',
        studentName: 'Ana Beatriz',
        avatarUrl: null,
        schoolName: 'Escola Monteiro Lobato',
        notRead: [],
        className: null,
        schoolYearName: null,
        ebooks: [book()],
      }}
      loading={false}
      error={false}
      onRetry={onRetry}
      {...props}
    />
  );
  return { onRetry, onClose };
};

describe('EbookReadingStudentModal', () => {
  it('splits the books into read, only opened and not read, with the time', () => {
    expect(
      studentTotals(
        [
          book({ percent: 100 }),
          book({ ebookId: 'b', percent: 50, effectiveReadAt: null }),
        ],
        [UNREAD]
      )
    ).toEqual({ read: 1, opened: 1, notRead: 1, seconds: 3600, progress: 75 });
    expect(studentTotals([])).toEqual({
      read: 0,
      opened: 0,
      notRead: 0,
      seconds: 0,
      progress: 0,
    });
  });

  it('lists the books released and not read after the ones opened', () => {
    renderModal({
      data: {
        userInstitutionId: 'student-1',
        studentName: 'Ana Beatriz',
        avatarUrl: null,
        schoolName: 'Escola Monteiro Lobato',
        className: 'Turma A',
        schoolYearName: '4º ano',
        ebooks: [book()],
        notRead: [UNREAD],
      },
    });

    const history = screen.getByRole('region', { name: 'Histórico completo' });
    const rows = history.querySelectorAll('li');
    expect(rows).toHaveLength(2);
    expect(rows[1]).toHaveAttribute('data-testid', 'student-book-eb-06');
    expect(rows[1]).toHaveTextContent('O Preço do Tempo');
    expect(rows[1]).toHaveTextContent('Não lido');
    expect(rows[1]).toHaveTextContent('0%');
    expect(
      screen.getByText('Escola Monteiro Lobato • Turma A • 4º ano')
    ).toBeInTheDocument();
  });

  it('counts the books read, opened and not read, and the time', () => {
    renderModal({
      data: {
        userInstitutionId: 'student-1',
        studentName: 'Ana Beatriz',
        avatarUrl: null,
        schoolName: 'Escola Monteiro Lobato',
        className: null,
        schoolYearName: null,
        ebooks: [
          book(),
          book({ ebookId: 'b', percent: 0, effectiveReadAt: null }),
        ],
        notRead: [UNREAD],
      },
    });

    const figures = screen.getByRole('region', { name: 'Dados de leitura' });
    expect(figures).toHaveTextContent(
      'Livros lidos1Livros abertos1Livros não lidos1Tempo de leitura01:00:00'
    );
  });

  it("shows the student's books with their cover and where they are", () => {
    renderModal();

    expect(screen.getByText('Ana Beatriz')).toBeInTheDocument();
    expect(screen.getByText('EB40 • Educação 4.0 e 5.0')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Última leitura: 17/11/2026 • Tempo de leitura: 00:30:00 • 2 seções vistas'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('student-book-eb-40').querySelector('img')
    ).toHaveAttribute('src', 'https://cdn.test/capa.webp');
    expect(screen.getByTestId('reading-tier-highlight')).toBeInTheDocument();
  });

  it("takes the tier from the student's row when it has it", () => {
    renderModal({ averageProgress: 10 });

    expect(screen.getByTestId('reading-tier-attention')).toBeInTheDocument();
  });

  it('says when the student opened no book', () => {
    renderModal({
      data: {
        userInstitutionId: 'student-1',
        studentName: 'Ana Beatriz',
        avatarUrl: null,
        schoolName: 'Escola Monteiro Lobato',
        notRead: [],
        className: 'Turma A',
        schoolYearName: null,
        ebooks: [],
      },
    });

    expect(
      screen.getByText('O estudante não tem livros no período.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Escola Monteiro Lobato • Turma A')
    ).toBeInTheDocument();
    expect(screen.getByTestId('reading-tier-none')).toBeInTheDocument();
  });

  it('draws a placeholder for a book without a cover', () => {
    renderModal({
      data: {
        userInstitutionId: 'student-1',
        studentName: 'Ana Beatriz',
        avatarUrl: null,
        schoolName: 'Escola Monteiro Lobato',
        notRead: [],
        className: null,
        schoolYearName: null,
        ebooks: [book({ coverUrl: null, code: null, category: null })],
      },
    });

    expect(
      screen.getByTestId('student-book-eb-40').querySelector('img')
    ).toBeNull();
  });

  it('waits while the reading loads', () => {
    renderModal({ data: null, loading: true });

    expect(screen.getByTestId('student-modal-loading')).toBeInTheDocument();
  });

  it('offers to try again when the reading does not load', () => {
    const { onRetry } = renderModal({ data: null, error: true });

    fireEvent.click(screen.getByText('Tentar novamente'));

    expect(
      screen.getByText('Não foi possível carregar a leitura do estudante.')
    ).toBeInTheDocument();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
