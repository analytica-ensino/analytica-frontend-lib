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
  it('sums the books read and opened and the time', () => {
    expect(
      studentTotals([
        book({ percent: 100 }),
        book({ ebookId: 'b', percent: 50, effectiveReadAt: null }),
      ])
    ).toEqual({ read: 1, opened: 2, seconds: 3600, progress: 75 });
    expect(studentTotals([])).toEqual({
      read: 0,
      opened: 0,
      seconds: 0,
      progress: 0,
    });
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
        className: 'Turma A',
        schoolYearName: null,
        ebooks: [],
      },
    });

    expect(
      screen.getByText('O estudante não abriu nenhum livro no período.')
    ).toBeInTheDocument();
    expect(screen.getByText('Turma A')).toBeInTheDocument();
    expect(screen.getByTestId('reading-tier-none')).toBeInTheDocument();
  });

  it('draws a placeholder for a book without a cover', () => {
    renderModal({
      data: {
        userInstitutionId: 'student-1',
        studentName: 'Ana Beatriz',
        avatarUrl: null,
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
