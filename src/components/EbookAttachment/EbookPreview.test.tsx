import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { ReactNode } from 'react';
import { EbookPreview } from './EbookPreview';
import type { BaseApiClient } from '../../types/api';
import type { EbookPreviewData } from '../../types/ebookAttachment';

const mockReader = jest.fn();
jest.mock('../EbookReader/EbookReader', () => ({
  __esModule: true,
  default: (props: {
    title: string;
    onMaterialChange?: (material: 'STUDENT' | 'TEACHER') => void;
    headerActions?: ReactNode;
  }) => {
    mockReader(props);
    return (
      <div data-testid="reader">
        <span>{props.title}</span>
        {props.onMaterialChange && (
          <button
            type="button"
            onClick={() => props.onMaterialChange?.('TEACHER')}
          >
            Guia do professor
          </button>
        )}
        {props.headerActions}
      </div>
    );
  },
}));

const mockPreview = jest.fn();
jest.mock('./useEbookPreview', () => ({
  useEbookPreview: (...args: unknown[]) => mockPreview(...args),
}));

const CONTENT = { html: '<main></main>', css: '', assetBaseUrl: '' };

const preview = (
  overrides: Partial<EbookPreviewData> = {}
): EbookPreviewData => ({
  id: 'eb-1',
  materialType: 'STUDENT',
  pairEbookId: null,
  title: 'Livro 1',
  subtitle: null,
  coverUrl: null,
  details: {
    code: null,
    theme: null,
    audience: [],
    schoolYears: [],
    authors: [],
    bncc: [],
    words: null,
    readingMinutes: null,
  },
  version: {
    id: 'v-1',
    number: 1,
    htmlUrl: null,
    cssUrl: null,
    narrationUrl: null,
    assetBaseUrl: null,
    fontsUrl: null,
  },
  ...overrides,
});

const api = { get: jest.fn() } as unknown as BaseApiClient;

describe('EbookPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the actions it is given, and leaves out what the book lacks', () => {
    mockPreview.mockReturnValue({
      preview: preview(),
      content: CONTENT,
      error: false,
    });

    render(
      <EbookPreview
        apiClient={api}
        ebookId="eb-1"
        onBack={jest.fn()}
        headerActions={<button type="button">Ação</button>}
      />
    );

    expect(screen.getByRole('button', { name: 'Ação' })).toBeInTheDocument();
    expect(mockReader).toHaveBeenLastCalledWith(
      expect.objectContaining({
        mode: 'preview',
        subtitle: '',
        onMaterialChange: undefined,
        details: {
          code: undefined,
          theme: undefined,
          audience: undefined,
          authors: [],
          bncc: [],
          words: undefined,
          readingMinutes: undefined,
        },
      })
    );
  });

  it('opens the other material of the title from its tab', () => {
    mockPreview.mockReturnValue({
      preview: preview({ pairEbookId: 'eb-1-guia' }),
      content: CONTENT,
      error: false,
    });
    render(<EbookPreview apiClient={api} ebookId="eb-1" onBack={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Guia do professor' }));

    expect(mockPreview).toHaveBeenLastCalledWith(api, 'eb-1-guia');
  });

  it('goes back when the book cannot be opened', () => {
    mockPreview.mockReturnValue({ preview: null, content: null, error: true });
    const onBack = jest.fn();
    render(<EbookPreview apiClient={api} ebookId="eb-1" onBack={onBack} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível abrir o livro.'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
