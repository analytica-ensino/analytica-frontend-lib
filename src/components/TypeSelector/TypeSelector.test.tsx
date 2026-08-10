import { render, screen, fireEvent } from '@testing-library/react';
import { TypeSelector } from './TypeSelector';
import type { ActivityCategoryConfig } from './TypeSelector.types';
import { ReactNode } from 'react';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock Select component
jest.mock('../Select/Select', () => ({
  __esModule: true,
  default: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    children: ReactNode;
  }) => (
    <div data-testid="select" data-value={value}>
      {children}
      <button
        data-testid="change-to-prova"
        onClick={() => onValueChange('PROVA')}
      >
        Change to PROVA
      </button>
      <button
        data-testid="change-to-atividade"
        onClick={() => onValueChange('ATIVIDADE')}
      >
        Change to ATIVIDADE
      </button>
      <button
        data-testid="change-to-presencial"
        onClick={() => onValueChange('PRESENCIAL')}
      >
        Change to PRESENCIAL
      </button>
    </div>
  ),
  SelectTrigger: ({ children }: { children: ReactNode }) => (
    <div data-testid="select-trigger">{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder: string }) => (
    <span data-testid="select-value">{placeholder}</span>
  ),
  SelectContent: ({ children }: { children: ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ value, children }: { value: string; children: ReactNode }) => (
    <div data-testid={`select-item-${value}`} data-value={value}>
      {children}
    </div>
  ),
}));

describe('TypeSelector', () => {
  const mockConfig: ActivityCategoryConfig = {
    ATIVIDADE: {
      labels: {
        pageTitle: {
          history: 'Histórico de atividades',
          drafts: 'Rascunhos de atividades',
          models: 'Modelos de atividades',
        },
        createButton: 'Criar atividade',
        selectorLabel: 'Atividades',
        itemLabel: {
          history: 'atividades',
          drafts: 'rascunhos',
          models: 'modelos',
        },
        searchPlaceholder: {
          history: 'Buscar atividade',
          drafts: 'Buscar rascunho',
          models: 'Buscar modelo',
        },
        emptyState: {
          title: 'Criar atividade',
          description: 'Descrição',
          buttonText: 'Criar atividade',
        },
        statusLabel: 'Status',
      },
      routes: {
        base: '/atividades',
        create: '/criar-atividade',
        details: (id: string) => `/atividades/${id}`,
        editDraft: (id: string) => `/criar-atividade?id=${id}`,
        editModel: (id: string) => `/criar-atividade?id=${id}`,
      },
      statusOptions: [{ id: 'active', name: 'Ativa' }],
    },
    PROVA: {
      labels: {
        pageTitle: {
          history: 'Histórico de provas',
          drafts: 'Rascunhos de provas',
          models: 'Modelos de provas',
        },
        createButton: 'Criar prova',
        selectorLabel: 'Provas',
        itemLabel: {
          history: 'provas',
          drafts: 'rascunhos',
          models: 'modelos',
        },
        searchPlaceholder: {
          history: 'Buscar prova',
          drafts: 'Buscar rascunho',
          models: 'Buscar modelo',
        },
        emptyState: {
          title: 'Criar prova',
          description: 'Descrição',
          buttonText: 'Criar prova',
        },
        statusLabel: 'Status',
      },
      routes: {
        base: '/provas',
        create: '/criar-prova',
        details: (id: string) => `/provas/${id}`,
        editDraft: (id: string) => `/criar-prova?id=${id}`,
        editModel: (id: string) => `/criar-prova?id=${id}`,
      },
      statusOptions: [{ id: 'active', name: 'Ativa' }],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the select component', () => {
      render(
        <TypeSelector
          value="ATIVIDADE"
          currentTab="history"
          config={mockConfig}
        />
      );

      expect(screen.getByTestId('select')).toBeInTheDocument();
    });

    it('should render ATIVIDADE selector label', () => {
      render(
        <TypeSelector
          value="ATIVIDADE"
          currentTab="history"
          config={mockConfig}
        />
      );

      expect(screen.getByText('Atividades')).toBeInTheDocument();
    });

    it('should render PROVA selector label', () => {
      render(
        <TypeSelector
          value="ATIVIDADE"
          currentTab="history"
          config={mockConfig}
        />
      );

      expect(screen.getByText('Provas')).toBeInTheDocument();
    });

    it('should have correct value attribute', () => {
      render(
        <TypeSelector
          value="ATIVIDADE"
          currentTab="history"
          config={mockConfig}
        />
      );

      expect(screen.getByTestId('select')).toHaveAttribute(
        'data-value',
        'ATIVIDADE'
      );
    });
  });

  describe('navigation', () => {
    it('should navigate to PROVA base route when changing from ATIVIDADE on history tab', () => {
      render(
        <TypeSelector
          value="ATIVIDADE"
          currentTab="history"
          config={mockConfig}
        />
      );

      fireEvent.click(screen.getByTestId('change-to-prova'));

      expect(mockNavigate).toHaveBeenCalledWith('/provas');
    });

    it('should navigate to PROVA drafts route when changing from ATIVIDADE on drafts tab', () => {
      render(
        <TypeSelector
          value="ATIVIDADE"
          currentTab="drafts"
          config={mockConfig}
        />
      );

      fireEvent.click(screen.getByTestId('change-to-prova'));

      expect(mockNavigate).toHaveBeenCalledWith('/provas/rascunhos');
    });

    it('should navigate to PROVA models route when changing from ATIVIDADE on models tab', () => {
      render(
        <TypeSelector
          value="ATIVIDADE"
          currentTab="models"
          config={mockConfig}
        />
      );

      fireEvent.click(screen.getByTestId('change-to-prova'));

      expect(mockNavigate).toHaveBeenCalledWith('/provas/modelos');
    });

    it('should navigate to ATIVIDADE base route when changing from PROVA on history tab', () => {
      render(
        <TypeSelector value="PROVA" currentTab="history" config={mockConfig} />
      );

      fireEvent.click(screen.getByTestId('change-to-atividade'));

      expect(mockNavigate).toHaveBeenCalledWith('/atividades');
    });

    it('should navigate to ATIVIDADE drafts route when changing from PROVA on drafts tab', () => {
      render(
        <TypeSelector value="PROVA" currentTab="drafts" config={mockConfig} />
      );

      fireEvent.click(screen.getByTestId('change-to-atividade'));

      expect(mockNavigate).toHaveBeenCalledWith('/atividades/rascunhos');
    });

    it('should not navigate when selecting the same type', () => {
      render(
        <TypeSelector
          value="ATIVIDADE"
          currentTab="history"
          config={mockConfig}
        />
      );

      fireEvent.click(screen.getByTestId('change-to-atividade'));

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('select items', () => {
    it('should render select item for ATIVIDADE', () => {
      render(
        <TypeSelector
          value="ATIVIDADE"
          currentTab="history"
          config={mockConfig}
        />
      );

      expect(screen.getByTestId('select-item-ATIVIDADE')).toBeInTheDocument();
    });

    it('should render select item for PROVA', () => {
      render(
        <TypeSelector
          value="ATIVIDADE"
          currentTab="history"
          config={mockConfig}
        />
      );

      expect(screen.getByTestId('select-item-PROVA')).toBeInTheDocument();
    });
  });

  describe('PRESENCIAL category', () => {
    const presencialConfig: ActivityCategoryConfig = {
      ...mockConfig,
      PRESENCIAL: {
        labels: {
          ...mockConfig.ATIVIDADE.labels,
          selectorLabel: 'Presenciais',
        },
        routes: {
          base: '/atividades-presenciais',
          create: '/criar-atividade-presencial',
          details: (id: string) => `/atividades-presenciais/${id}`,
          editDraft: (id: string) => `/criar-atividade-presencial?id=${id}`,
          editModel: (id: string) => `/criar-atividade-presencial?id=${id}`,
        },
        statusOptions: [{ id: 'active', name: 'Ativa' }],
      },
    };

    it('should not offer PRESENCIAL when the config omits it', () => {
      render(
        <TypeSelector
          value="ATIVIDADE"
          currentTab="history"
          config={mockConfig}
        />
      );

      expect(screen.queryByTestId('select-item-PRESENCIAL')).toBeNull();
      expect(screen.queryByText('Presenciais')).toBeNull();
    });

    it('should offer PRESENCIAL when the config provides it', () => {
      render(
        <TypeSelector
          value="ATIVIDADE"
          currentTab="history"
          config={presencialConfig}
        />
      );

      expect(screen.getByTestId('select-item-PRESENCIAL')).toBeInTheDocument();
      expect(screen.getByText('Presenciais')).toBeInTheDocument();
    });

    it('should navigate to the PRESENCIAL base route preserving the history tab', () => {
      render(
        <TypeSelector
          value="ATIVIDADE"
          currentTab="history"
          config={presencialConfig}
        />
      );

      fireEvent.click(screen.getByTestId('change-to-presencial'));

      expect(mockNavigate).toHaveBeenCalledWith('/atividades-presenciais');
    });

    it('should navigate to the PRESENCIAL models route preserving the models tab', () => {
      render(
        <TypeSelector
          value="ATIVIDADE"
          currentTab="models"
          config={presencialConfig}
        />
      );

      fireEvent.click(screen.getByTestId('change-to-presencial'));

      expect(mockNavigate).toHaveBeenCalledWith(
        '/atividades-presenciais/modelos'
      );
    });

    it('should honour an explicit allowedCategories over the config-derived list', () => {
      render(
        <TypeSelector
          value="ATIVIDADE"
          currentTab="history"
          config={presencialConfig}
          allowedCategories={['ATIVIDADE']}
        />
      );

      expect(screen.getByTestId('select-item-ATIVIDADE')).toBeInTheDocument();
      expect(screen.queryByTestId('select-item-PROVA')).toBeNull();
      expect(screen.queryByTestId('select-item-PRESENCIAL')).toBeNull();
    });

    it('should not navigate when the selected category is missing from the config', () => {
      render(
        <TypeSelector
          value="ATIVIDADE"
          currentTab="history"
          config={mockConfig}
        />
      );

      fireEvent.click(screen.getByTestId('change-to-presencial'));

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
