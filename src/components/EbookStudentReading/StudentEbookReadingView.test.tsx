import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  StudentEbookReadingTitle,
  StudentEbookReadingView,
} from './StudentEbookReadingView';
import type { BaseApiClient } from '../../types/api';
import type {
  EbookStudentReading,
  StudentAttachedEbook,
} from '../../types/ebookAttachment';

const mockReader = jest.fn();
jest.mock('../EbookReader/EbookReader', () => ({
  __esModule: true,
  default: (props: {
    title: string;
    mode?: string;
    variant?: string;
    initialSection?: string;
  }) => {
    mockReader(props);
    return <div data-testid="reader">{props.title}</div>;
  },
}));

const mockPreview = jest.fn();
jest.mock('../EbookAttachment/useEbookPreview', () => ({
  useEbookPreview: (...args: unknown[]) => mockPreview(...args),
}));

const ebook: StudentAttachedEbook = {
  id: 'eb-1',
  code: 'EB01',
  title: 'Meu pé de laranja lima',
  subtitle: null,
  coverUrl: null,
  category: 'Educação Financeira',
  percent: 40,
  effectiveReadAt: null,
};

const sections = (seen: string[]) =>
  [
    ['cover', 'Capa'],
    ['p1', 'O começo'],
    ['p2', 'O meio'],
    ['end', 'Fim'],
  ].map(([section, title], position) => ({
    section,
    title,
    position,
    seenAt: seen.includes(section) ? '2026-11-20T12:00:00Z' : null,
  }));

const reading = (
  progress: EbookStudentReading['progress'],
  seen: string[]
): EbookStudentReading => ({ progress, sections: sections(seen) });

const renderView = (get: jest.Mock) =>
  render(
    <StudentEbookReadingView
      apiClient={{ get } as unknown as BaseApiClient}
      ebook={ebook}
      userInstitutionId="ui-1"
    />
  );

describe('StudentEbookReadingView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPreview.mockReturnValue({
      preview: { title: 'Meu pé de laranja lima', materialType: 'STUDENT' },
      content: { html: '<main></main>', css: '', assetBaseUrl: '' },
      error: false,
    });
  });

  it('shows where the student stopped, the chapters seen and each one as read or not', async () => {
    const get = jest.fn().mockResolvedValue({
      data: {
        data: reading(
          {
            lastSection: 'p1',
            percent: 50,
            totalSeconds: 300,
            effectiveReadAt: null,
          },
          ['cover', 'p1']
        ),
      },
    });
    renderView(get);

    expect(
      screen.getByTestId('student-ebook-reading-loading')
    ).toBeInTheDocument();
    expect(await screen.findByText('Leitura em andamento')).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith('/ebooks/eb-1/students/ui-1/reading');
    expect(screen.getByText('O estudante parou em')).toBeInTheDocument();
    expect(screen.getByText('2 de 4 capítulos')).toBeInTheDocument();
    const chapters = screen.getAllByTestId('student-ebook-chapter');
    expect(
      chapters.map((chapter) => [
        chapter.firstChild?.textContent,
        within(chapter).queryByText('Leu') ? 'Leu' : 'Não leu',
      ])
    ).toEqual([
      ['Capa', 'Leu'],
      ['O começo', 'Leu'],
      ['O meio', 'Não leu'],
      ['Fim', 'Não leu'],
    ]);
  });

  it('opens the book in a compact preview at the cover, and where the student stopped on request', async () => {
    const get = jest.fn().mockResolvedValue({
      data: {
        data: reading(
          {
            lastSection: 'p2',
            percent: 75,
            totalSeconds: 300,
            effectiveReadAt: null,
          },
          ['cover', 'p1', 'p2']
        ),
      },
    });
    renderView(get);
    await screen.findByTestId('reader');

    expect(mockPreview).toHaveBeenCalledWith({ get }, 'eb-1');
    expect(mockReader).toHaveBeenLastCalledWith(
      expect.objectContaining({
        mode: 'preview',
        variant: 'compact',
        initialSection: undefined,
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ir para onde parou' }));

    expect(mockReader).toHaveBeenLastCalledWith(
      expect.objectContaining({ initialSection: 'p2' })
    );
  });

  it('marks a finished reading and a book never opened', async () => {
    const finished = jest.fn().mockResolvedValue({
      data: {
        data: reading(
          {
            lastSection: 'end',
            percent: 100,
            totalSeconds: 900,
            effectiveReadAt: '2026-11-21T10:00:00Z',
          },
          ['cover', 'p1', 'p2', 'end']
        ),
      },
    });
    const { unmount } = renderView(finished);
    expect(await screen.findByText('Leitura finalizada')).toBeInTheDocument();
    // Stopped at the last chapter, which is also in the list
    expect(screen.getAllByText('Fim')).toHaveLength(2);
    unmount();

    const neverOpened = jest
      .fn()
      .mockResolvedValue({ data: { data: reading(null, []) } });
    renderView(neverOpened);
    expect(await screen.findByText('Leitura não iniciada')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.getByText('0 de 4 capítulos')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Ir para onde parou' })
    ).not.toBeInTheDocument();
  });

  it('offers to try again when the reading fails', async () => {
    const get = jest
      .fn()
      .mockRejectedValueOnce(new Error('rede'))
      .mockResolvedValueOnce({ data: { data: reading(null, []) } });
    renderView(get);

    expect(
      await screen.findByText(
        'Não foi possível carregar a leitura do estudante.'
      )
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Leitura não iniciada')).toBeInTheDocument();
    expect(get).toHaveBeenCalledTimes(2);
  });

  it('says when the book cannot be opened in the preview', async () => {
    mockPreview.mockReturnValue({ preview: null, content: null, error: true });
    const get = jest
      .fn()
      .mockResolvedValue({ data: { data: reading(null, []) } });
    renderView(get);

    expect(
      await screen.findByText('Não foi possível abrir o livro.')
    ).toBeInTheDocument();
    expect(screen.queryByTestId('reader')).not.toBeInTheDocument();
  });
});

describe('StudentEbookReadingTitle', () => {
  it('goes back from the reading', () => {
    const onBack = jest.fn();
    render(<StudentEbookReadingTitle onBack={onBack} />);

    expect(screen.getByText('Leitura do livro')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
