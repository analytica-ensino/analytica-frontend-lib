import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { createElement } from 'react';
import { ActivityPageLayout, ActivityTab } from './ActivityPageLayout';
import type { ColumnConfig } from '../TableProvider/TableProvider';

// Mock TableProvider to keep tests focused on layout
jest.mock('../TableProvider/TableProvider', () => ({
  __esModule: true,
  default: ({ headerContent }: { headerContent?: ReactNode }) => (
    <div data-testid="table-provider">{headerContent}</div>
  ),
}));

// Mock Menu components
jest.mock('../Menu/Menu', () => ({
  Menu: ({
    children,
    onValueChange,
  }: {
    children: ReactNode;
    onValueChange?: (v: string) => void;
  }) => (
    <button data-testid="menu" onClick={() => onValueChange?.('rascunhos')}>
      {children}
    </button>
  ),
  MenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  MenuItem: ({ children, value }: { children: ReactNode; value: string }) => (
    <button data-testid={`menu-item-${value}`}>{children}</button>
  ),
}));

// Mock Button
jest.mock('../Button/Button', () => ({
  __esModule: true,
  default: ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

// Mock Text
jest.mock('../Text/Text', () => ({
  __esModule: true,
  default: ({
    children,
    as = 'span',
    ...rest
  }: {
    children: ReactNode;
    as?: string;
    [key: string]: unknown;
  }) => createElement(as, rest, children),
}));

type TestRow = Record<string, unknown> & { id: string; name: string };

const mockHeaders: ColumnConfig<TestRow>[] = [
  { key: 'name', label: 'Nome', sortable: true },
];

const defaultProps = {
  activeTab: ActivityTab.HISTORY,
  pageTitle: 'Atividades',
  testId: 'activity-page',
  data: [] as TestRow[],
  headers: mockHeaders,
  loading: false,
  error: null,
  pagination: { total: 0, totalPages: 1 },
  itemLabel: 'atividades',
  searchPlaceholder: 'Buscar atividades',
  emptyState: <div>Sem atividades</div>,
  noSearchImage: '/no-search.png',
  onParamsChange: jest.fn(),
  onRowClick: jest.fn(),
  onTabChange: jest.fn(),
  onCreateActivity: jest.fn(),
};

describe('ActivityPageLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the page title', () => {
      render(<ActivityPageLayout {...defaultProps} />);
      expect(screen.getByText('Atividades')).toBeInTheDocument();
    });

    it('should render with the provided testId', () => {
      render(<ActivityPageLayout {...defaultProps} />);
      expect(screen.getByTestId('activity-page')).toBeInTheDocument();
    });

    it('should render tab menu items', () => {
      render(<ActivityPageLayout {...defaultProps} />);
      expect(screen.getByTestId('menu-item-historico')).toBeInTheDocument();
      expect(screen.getByTestId('menu-item-rascunhos')).toBeInTheDocument();
      expect(screen.getByTestId('menu-item-modelos')).toBeInTheDocument();
    });

    it('should render the table provider when there is no error', () => {
      render(<ActivityPageLayout {...defaultProps} />);
      expect(screen.getByTestId('table-provider')).toBeInTheDocument();
    });

    it('should render error message when error prop is provided', () => {
      render(<ActivityPageLayout {...defaultProps} error="Erro ao carregar" />);
      expect(screen.getByText('Erro ao carregar')).toBeInTheDocument();
      expect(screen.queryByTestId('table-provider')).not.toBeInTheDocument();
    });

    it('should render "Criar atividade" button inside table header', () => {
      render(<ActivityPageLayout {...defaultProps} />);
      expect(screen.getByText('Criar atividade')).toBeInTheDocument();
    });
  });

  describe('callbacks', () => {
    it('should call onTabChange when a tab is selected', async () => {
      const onTabChange = jest.fn();
      render(
        <ActivityPageLayout {...defaultProps} onTabChange={onTabChange} />
      );
      await userEvent.click(screen.getByTestId('menu'));
      expect(onTabChange).toHaveBeenCalledWith('rascunhos');
    });

    it('should call onCreateActivity when create button is clicked', async () => {
      const onCreateActivity = jest.fn();
      render(
        <ActivityPageLayout
          {...defaultProps}
          onCreateActivity={onCreateActivity}
        />
      );
      await userEvent.click(screen.getByText('Criar atividade'));
      expect(onCreateActivity).toHaveBeenCalledTimes(1);
    });
  });

  describe('ActivityTab enum', () => {
    it('should have correct tab values', () => {
      expect(ActivityTab.HISTORY).toBe('historico');
      expect(ActivityTab.DRAFTS).toBe('rascunhos');
      expect(ActivityTab.MODELS).toBe('modelos');
    });
  });

  describe('initialFilters', () => {
    it('should render table provider when initialFilters has categories with items', () => {
      const filters = [
        {
          key: 'subject',
          label: 'Disciplina',
          categories: [
            {
              key: 'subjects',
              label: 'Disciplinas',
              itens: [
                { id: '1', name: 'Matemática' },
                { id: '2', name: 'Português' },
              ],
            },
          ],
        },
      ];
      render(<ActivityPageLayout {...defaultProps} initialFilters={filters} />);
      expect(screen.getByTestId('table-provider')).toBeInTheDocument();
    });

    it('should render table provider when initialFilters has categories without items', () => {
      const filters = [
        {
          key: 'subject',
          label: 'Disciplina',
          categories: [
            {
              key: 'subjects',
              label: 'Disciplinas',
              itens: [],
            },
          ],
        },
      ];
      render(<ActivityPageLayout {...defaultProps} initialFilters={filters} />);
      expect(screen.getByTestId('table-provider')).toBeInTheDocument();
    });

    it('should render table provider when initialFilters has categories without itens field', () => {
      const filters = [
        {
          key: 'subject',
          label: 'Disciplina',
          categories: [
            {
              key: 'subjects',
              label: 'Disciplinas',
            },
          ],
        },
      ];
      render(<ActivityPageLayout {...defaultProps} initialFilters={filters} />);
      expect(screen.getByTestId('table-provider')).toBeInTheDocument();
    });
  });
});
