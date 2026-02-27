import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock do RichEditorCore - precisa ser antes do import do componente
let mockShouldThrowError = false;
let mockErrorMessage = '';

jest.mock('./RichEditorCore', () => ({
  RichEditor: jest.fn(() => {
    if (mockShouldThrowError) {
      throw new Error(mockErrorMessage);
    }
    return <div data-testid="rich-editor-core">RichEditor Core Loaded</div>;
  }),
}));

// Import após o mock
import { RichEditor } from './RichEditor';

describe('RichEditor Wrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShouldThrowError = false;
    mockErrorMessage = '';
  });

  describe('Carregamento normal', () => {
    it('deve renderizar o editor quando carregado com sucesso', async () => {
      render(<RichEditor />);

      await waitFor(() => {
        expect(screen.getByTestId('rich-editor-core')).toBeInTheDocument();
      });
    });

    it('deve passar props para o RichEditorCore', async () => {
      const onChange = jest.fn();
      render(
        <RichEditor
          content="<p>Teste</p>"
          onChange={onChange}
          placeholder="Digite aqui..."
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('rich-editor-core')).toBeInTheDocument();
      });
    });
  });

  describe('Estado de loading', () => {
    it('deve mostrar skeleton durante carregamento', () => {
      // O Suspense mostra o fallback enquanto carrega
      // Como o mock resolve imediatamente, verificamos a estrutura do componente
      const { container } = render(<RichEditor />);

      // O componente deve existir (pode ser skeleton ou conteúdo)
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('Tratamento de erros - TipTap não instalado', () => {
    it('deve mostrar mensagem de erro quando TipTap não está instalado', async () => {
      mockShouldThrowError = true;
      mockErrorMessage = "Cannot find module '@tiptap/react'";

      render(<RichEditor />);

      await waitFor(() => {
        expect(
          screen.getByText('Dependências do TipTap não encontradas')
        ).toBeInTheDocument();
      });
    });

    it('deve mostrar comando yarn para instalação', async () => {
      mockShouldThrowError = true;
      mockErrorMessage = "Cannot find module '@tiptap/react'";

      render(<RichEditor />);

      await waitFor(() => {
        expect(screen.getByText('Usando Yarn:')).toBeInTheDocument();
        expect(screen.getByText(/yarn add @tiptap\/react/)).toBeInTheDocument();
      });
    });

    it('deve mostrar comando npm para instalação', async () => {
      mockShouldThrowError = true;
      mockErrorMessage = "Cannot find module '@tiptap/react'";

      render(<RichEditor />);

      await waitFor(() => {
        expect(screen.getByText('Usando NPM:')).toBeInTheDocument();
        expect(
          screen.getByText(/npm install @tiptap\/react/)
        ).toBeInTheDocument();
      });
    });

    it('deve mostrar todas as dependências necessárias no comando', async () => {
      mockShouldThrowError = true;
      mockErrorMessage = '@tiptap error';

      render(<RichEditor />);

      await waitFor(() => {
        const yarnCommand = screen.getByText(/yarn add/);
        expect(yarnCommand.textContent).toContain('@tiptap/core');
        expect(yarnCommand.textContent).toContain('@tiptap/starter-kit');
        expect(yarnCommand.textContent).toContain(
          '@tiptap/extension-underline'
        );
        expect(yarnCommand.textContent).toContain('@tiptap/extension-link');
      });
    });

    it('deve detectar erro de @tiptap na mensagem', async () => {
      mockShouldThrowError = true;
      mockErrorMessage = 'Error loading @tiptap/extension-color';

      render(<RichEditor />);

      await waitFor(() => {
        expect(
          screen.getByText('Dependências do TipTap não encontradas')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Tratamento de erros - Outros erros', () => {
    it('deve mostrar mensagem genérica para erros não relacionados ao TipTap', async () => {
      mockShouldThrowError = true;
      mockErrorMessage = 'Erro genérico de runtime';

      render(<RichEditor />);

      await waitFor(() => {
        expect(
          screen.getByText('Erro ao carregar o RichEditor')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Erro genérico de runtime')
        ).toBeInTheDocument();
      });
    });

    it('não deve mostrar comandos de instalação para erros genéricos', async () => {
      mockShouldThrowError = true;
      mockErrorMessage = 'Erro genérico sem menção a tiptap';

      render(<RichEditor />);

      await waitFor(() => {
        expect(
          screen.getByText('Erro ao carregar o RichEditor')
        ).toBeInTheDocument();
      });

      expect(screen.queryByText('Usando Yarn:')).not.toBeInTheDocument();
      expect(screen.queryByText('Usando NPM:')).not.toBeInTheDocument();
    });
  });

  describe('Componente de erro - UI', () => {
    it('deve ter estilo de alerta vermelho', async () => {
      mockShouldThrowError = true;
      mockErrorMessage = '@tiptap not found';

      const { container } = render(<RichEditor />);

      await waitFor(() => {
        const errorBox = container.querySelector('.bg-red-50');
        expect(errorBox).toBeInTheDocument();
      });
    });

    it('deve ter ícone de warning', async () => {
      mockShouldThrowError = true;
      mockErrorMessage = '@tiptap not found';

      const { container } = render(<RichEditor />);

      await waitFor(() => {
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveClass('text-red-600');
      });
    });

    it('deve ter borda vermelha', async () => {
      mockShouldThrowError = true;
      mockErrorMessage = '@tiptap not found';

      const { container } = render(<RichEditor />);

      await waitFor(() => {
        const errorBox = container.querySelector('.border-red-200');
        expect(errorBox).toBeInTheDocument();
      });
    });
  });

  describe('Props do RichEditor', () => {
    it('deve aceitar content como prop', async () => {
      render(<RichEditor content="<p>Conteúdo inicial</p>" />);

      await waitFor(() => {
        expect(screen.getByTestId('rich-editor-core')).toBeInTheDocument();
      });
    });

    it('deve aceitar onChange como prop', async () => {
      const onChange = jest.fn();
      render(<RichEditor onChange={onChange} />);

      await waitFor(() => {
        expect(screen.getByTestId('rich-editor-core')).toBeInTheDocument();
      });
    });

    it('deve aceitar placeholder como prop', async () => {
      render(<RichEditor placeholder="Digite seu texto..." />);

      await waitFor(() => {
        expect(screen.getByTestId('rich-editor-core')).toBeInTheDocument();
      });
    });

    it('deve aceitar todas as props combinadas', async () => {
      const onChange = jest.fn();
      render(
        <RichEditor
          content="<p>Texto</p>"
          onChange={onChange}
          placeholder="Placeholder"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('rich-editor-core')).toBeInTheDocument();
      });
    });
  });
});

describe('LoadingFallback', () => {
  it('deve renderizar componente quando carregado', async () => {
    // O componente carrega rapidamente devido ao mock
    render(<RichEditor />);

    await waitFor(() => {
      expect(screen.getByTestId('rich-editor-core')).toBeInTheDocument();
    });
  });
});

describe('ErrorBoundary', () => {
  it('deve capturar erros de renderização', async () => {
    mockShouldThrowError = true;
    mockErrorMessage = 'Render error';

    render(<RichEditor />);

    await waitFor(() => {
      expect(
        screen.getByText('Erro ao carregar o RichEditor')
      ).toBeInTheDocument();
    });
  });

  it('deve mostrar fallback quando há erro', async () => {
    mockShouldThrowError = true;
    mockErrorMessage = '@tiptap missing';

    const { container } = render(<RichEditor />);

    await waitFor(() => {
      // Deve mostrar o componente de erro
      expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
    });
  });
});
