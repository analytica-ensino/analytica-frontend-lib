import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { ReactNode } from 'react';
import { EbookPickerPreview } from './EbookPickerPreview';
import type { BaseApiClient } from '../../types/api';
import type { EbookPreviewData } from '../../types/ebookAttachment';

const mockReader = jest.fn();
jest.mock('../EbookReader/EbookReader', () => ({
  __esModule: true,
  default: (props: {
    title: string;
    subtitle?: string;
    mode?: string;
    material?: string;
    content: { html: string; css: string; assetBaseUrl: string };
    onMaterialChange?: (material: 'STUDENT' | 'TEACHER') => void;
    onBack?: () => void;
    headerActions?: ReactNode;
  }) => {
    mockReader(props);
    return (
      <div data-testid="reader">
        <span>{props.title}</span>
        <span>{props.subtitle}</span>
        <span>{props.content.html}</span>
        {props.onMaterialChange && (
          <button
            type="button"
            onClick={() =>
              props.onMaterialChange?.(
                props.material === 'STUDENT' ? 'TEACHER' : 'STUDENT'
              )
            }
          >
            Trocar material
          </button>
        )}
        <button type="button" onClick={props.onBack}>
          Voltar
        </button>
        {props.headerActions}
      </div>
    );
  },
}));

const preview = (
  id: string,
  overrides: Partial<EbookPreviewData> = {}
): EbookPreviewData => ({
  id,
  materialType: 'STUDENT',
  pairEbookId: null,
  title: `Livro ${id}`,
  subtitle: null,
  coverUrl: null,
  details: {
    code: 'EB01',
    theme: 'Educação 4.0 e 5.0',
    audience: ['Estudantes'],
    schoolYears: ['4º ano'],
    authors: ['Ana Autora'],
    bncc: ['EF04MA25'],
    words: 884,
    readingMinutes: 13,
  },
  version: {
    id: `v-${id}`,
    number: 1,
    htmlUrl: `https://cdn.test/${id}/content.html`,
    cssUrl: null,
    narrationUrl: null,
    assetBaseUrl: `https://cdn.test/${id}/`,
    fontsUrl: null,
  },
  ...overrides,
});

const makeApi = (byId: Record<string, EbookPreviewData>) => {
  const get = jest.fn((url: string) => {
    const id = url.split('/')[2];
    return byId[id]
      ? Promise.resolve({ data: { data: byId[id] } })
      : Promise.reject(new Error('not found'));
  });
  return { api: { get } as unknown as BaseApiClient, get };
};

const renderPreview = (
  byId: Record<string, EbookPreviewData>,
  props: Partial<Parameters<typeof EbookPickerPreview>[0]> = {}
) => {
  const { api, get } = makeApi(byId);
  const handlers = { onToggle: jest.fn(), onBack: jest.fn() };
  render(
    <EbookPickerPreview
      apiClient={api}
      ebookId="1"
      selected={false}
      canAdd
      addLabel="Adicionar à aula"
      {...handlers}
      {...props}
    />
  );
  return { get, ...handlers };
};

describe('EbookPickerPreview', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = jest.fn((url: string) =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(`html de ${url}`),
      })
    ) as unknown as typeof fetch;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it('opens the book in preview mode, with its files and details', async () => {
    const { get } = renderPreview({ '1': preview('1') });

    expect(screen.getByTestId('ebook-preview-loading')).toBeInTheDocument();
    expect(await screen.findByTestId('reader')).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith('/ebooks/1/preview');
    expect(
      screen.getByText('html de https://cdn.test/1/content.html')
    ).toBeInTheDocument();
    expect(screen.getByText('4º ano · Educação 4.0 e 5.0')).toBeInTheDocument();
    expect(mockReader).toHaveBeenLastCalledWith(
      expect.objectContaining({
        mode: 'preview',
        material: 'STUDENT',
        details: {
          code: 'EB01',
          theme: 'Educação 4.0 e 5.0',
          audience: 'Estudantes',
          authors: ['Ana Autora'],
          bncc: ['EF04MA25'],
          words: 884,
          readingMinutes: 13,
        },
      })
    );
    // A book without a guide has no tabs
    expect(screen.queryByText('Trocar material')).not.toBeInTheDocument();
  });

  it('adds the book from the header, or takes it out once selected', async () => {
    const { onToggle } = renderPreview({ '1': preview('1') });

    fireEvent.click(
      await screen.findByRole('button', { name: 'Adicionar à aula' })
    );
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('offers to take a selected book out', async () => {
    renderPreview({ '1': preview('1') }, { selected: true });

    expect(
      await screen.findByRole('button', { name: 'Remover da seleção' })
    ).toBeInTheDocument();
  });

  it('cannot add past the limit', async () => {
    renderPreview({ '1': preview('1') }, { canAdd: false });

    expect(
      await screen.findByRole('button', { name: 'Adicionar à aula' })
    ).toBeDisabled();
  });

  it('switches to the teacher guide and back, still selecting the student book', async () => {
    const { get, onToggle } = renderPreview({
      '1': preview('1', { pairEbookId: 'g1' }),
      g1: preview('g1', {
        materialType: 'TEACHER',
        pairEbookId: '1',
        title: 'Guia do livro 1',
      }),
    });

    fireEvent.click(await screen.findByText('Trocar material'));
    expect(await screen.findByText('Guia do livro 1')).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith('/ebooks/g1/preview');

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar à aula' }));
    expect(onToggle).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Trocar material'));
    expect(await screen.findByText('Livro 1')).toBeInTheDocument();
  });

  it('says when the book does not open, and goes back', async () => {
    globalThis.fetch = jest.fn(() =>
      Promise.resolve({ ok: false, text: () => Promise.resolve('') })
    ) as unknown as typeof fetch;
    const { onBack } = renderPreview({ '1': preview('1') });

    expect(
      await screen.findByText('Não foi possível abrir o livro.')
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    await waitFor(() => expect(onBack).toHaveBeenCalledTimes(1));
  });
});
