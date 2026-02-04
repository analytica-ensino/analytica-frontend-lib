import { render, act } from '@testing-library/react';
import { ZendeskWidget } from './ZendeskWidget';

describe('ZendeskWidget', () => {
  const testKey = 'test-zendesk-key-123';

  beforeEach(() => {
    jest.clearAllMocks();
    // Limpa scripts do Zendesk do DOM
    const existingScript = document.getElementById('ze-snippet');
    if (existingScript) existingScript.remove();
    // Limpa window.zE
    delete (globalThis as unknown as Record<string, unknown>).zE;
  });

  afterEach(() => {
    const existingScript = document.getElementById('ze-snippet');
    if (existingScript) existingScript.remove();
    delete (globalThis as unknown as Record<string, unknown>).zE;
  });

  describe('renderização', () => {
    it('deve retornar null (não renderiza nada visível)', () => {
      const { container } = render(<ZendeskWidget zendeskKey={testKey} />);
      expect(container.innerHTML).toBe('');
    });

    it('não deve adicionar script quando zendeskKey é vazio', () => {
      render(<ZendeskWidget zendeskKey="" />);
      expect(document.getElementById('ze-snippet')).toBeNull();
    });
  });

  describe('injeção do script', () => {
    it('deve adicionar o script do Zendesk ao body', () => {
      render(<ZendeskWidget zendeskKey={testKey} />);

      const script = document.getElementById('ze-snippet');
      expect(script).not.toBeNull();
      expect(script?.tagName).toBe('SCRIPT');
    });

    it('deve configurar a URL correta com a key', () => {
      render(<ZendeskWidget zendeskKey={testKey} />);

      const script = document.getElementById('ze-snippet') as HTMLScriptElement;
      expect(script.src).toBe(
        `https://static.zdassets.com/ekr/snippet.js?key=${testKey}`
      );
    });

    it('deve configurar o script como async', () => {
      render(<ZendeskWidget zendeskKey={testKey} />);

      const script = document.getElementById('ze-snippet') as HTMLScriptElement;
      expect(script.async).toBe(true);
    });

    it('não deve duplicar o script se já existir', () => {
      const existingScript = document.createElement('script');
      existingScript.id = 'ze-snippet';
      document.body.appendChild(existingScript);

      render(<ZendeskWidget zendeskKey={testKey} />);

      const scripts = document.querySelectorAll('#ze-snippet');
      expect(scripts.length).toBe(1);
    });
  });

  describe('onload callback', () => {
    it('deve configurar locale pt-BR quando o script carrega', () => {
      const mockZE = jest.fn();

      render(<ZendeskWidget zendeskKey={testKey} />);

      const script = document.getElementById('ze-snippet') as HTMLScriptElement;

      // Simula window.zE antes de chamar onload
      (globalThis as unknown as Record<string, unknown>).zE = mockZE;

      act(() => {
        script.onload?.(new Event('load'));
      });

      expect(mockZE).toHaveBeenCalledWith('messenger:set', 'locale', 'pt-BR');
    });

    it('não deve falhar se window.zE não existir no onload', () => {
      render(<ZendeskWidget zendeskKey={testKey} />);

      const script = document.getElementById('ze-snippet') as HTMLScriptElement;

      expect(() => {
        act(() => {
          script.onload?.(new Event('load'));
        });
      }).not.toThrow();
    });
  });

  describe('cleanup no unmount', () => {
    it('deve remover o script do DOM ao desmontar', () => {
      const { unmount } = render(<ZendeskWidget zendeskKey={testKey} />);

      expect(document.getElementById('ze-snippet')).not.toBeNull();

      unmount();

      expect(document.getElementById('ze-snippet')).toBeNull();
    });

    it('deve chamar zE messenger close ao desmontar', () => {
      const mockZE = jest.fn();
      (globalThis as unknown as Record<string, unknown>).zE = mockZE;

      const { unmount } = render(<ZendeskWidget zendeskKey={testKey} />);

      unmount();

      expect(mockZE).toHaveBeenCalledWith('messenger', 'close');
    });

    it('não deve falhar no cleanup se window.zE não existir', () => {
      const { unmount } = render(<ZendeskWidget zendeskKey={testKey} />);

      delete (globalThis as unknown as Record<string, unknown>).zE;

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('mudança de zendeskKey', () => {
    it('deve recriar o script ao mudar a key', () => {
      const { rerender } = render(<ZendeskWidget zendeskKey={testKey} />);

      const firstScript = document.getElementById(
        'ze-snippet'
      ) as HTMLScriptElement;
      expect(firstScript.src).toContain(testKey);

      // Remove o script (simula cleanup do effect anterior)
      rerender(<ZendeskWidget zendeskKey="new-key-456" />);

      const newScript = document.getElementById(
        'ze-snippet'
      ) as HTMLScriptElement;
      expect(newScript).not.toBeNull();
    });
  });
});
