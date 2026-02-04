import { render, act } from '@testing-library/react';
import { ZendeskWidget, _resetWidgetCount } from './ZendeskWidget';

describe('ZendeskWidget', () => {
  const testKey = 'test-zendesk-key-123';

  beforeEach(() => {
    jest.clearAllMocks();
    _resetWidgetCount();
    const existingScript = document.getElementById('ze-snippet');
    if (existingScript) existingScript.remove();
    delete (globalThis as unknown as Record<string, unknown>).zE;
  });

  afterEach(() => {
    const existingScript = document.getElementById('ze-snippet');
    if (existingScript) existingScript.remove();
    delete (globalThis as unknown as Record<string, unknown>).zE;
  });

  describe('rendering', () => {
    it('should return null (renders nothing visible)', () => {
      const { container } = render(<ZendeskWidget zendeskKey={testKey} />);
      expect(container.innerHTML).toBe('');
    });

    it('should not add script when zendeskKey is empty', () => {
      render(<ZendeskWidget zendeskKey="" />);
      expect(document.getElementById('ze-snippet')).toBeNull();
    });
  });

  describe('script injection', () => {
    it('should add the Zendesk script to the body', () => {
      render(<ZendeskWidget zendeskKey={testKey} />);

      const script = document.getElementById('ze-snippet');
      expect(script).not.toBeNull();
      expect(script?.tagName).toBe('SCRIPT');
    });

    it('should set the correct URL with the key', () => {
      render(<ZendeskWidget zendeskKey={testKey} />);

      const script = document.getElementById('ze-snippet') as HTMLScriptElement;
      expect(script.src).toBe(
        `https://static.zdassets.com/ekr/snippet.js?key=${testKey}`
      );
    });

    it('should set the script as async', () => {
      render(<ZendeskWidget zendeskKey={testKey} />);

      const script = document.getElementById('ze-snippet') as HTMLScriptElement;
      expect(script.async).toBe(true);
    });

    it('should not duplicate the script if it already exists', () => {
      const existingScript = document.createElement('script');
      existingScript.id = 'ze-snippet';
      document.body.appendChild(existingScript);

      render(<ZendeskWidget zendeskKey={testKey} />);

      const scripts = document.querySelectorAll('#ze-snippet');
      expect(scripts.length).toBe(1);
    });
  });

  describe('onload callback', () => {
    it('should set locale to pt-BR when the script loads', () => {
      const mockZE = jest.fn();

      render(<ZendeskWidget zendeskKey={testKey} />);

      const script = document.getElementById('ze-snippet') as HTMLScriptElement;

      (globalThis as unknown as Record<string, unknown>).zE = mockZE;

      act(() => {
        script.onload?.(new Event('load'));
      });

      expect(mockZE).toHaveBeenCalledWith('messenger:set', 'locale', 'pt-BR');
    });

    it('should not fail if globalThis.zE does not exist on load', () => {
      render(<ZendeskWidget zendeskKey={testKey} />);

      const script = document.getElementById('ze-snippet') as HTMLScriptElement;

      expect(() => {
        act(() => {
          script.onload?.(new Event('load'));
        });
      }).not.toThrow();
    });
  });

  describe('cleanup on unmount', () => {
    it('should remove the script from the DOM on unmount', () => {
      const { unmount } = render(<ZendeskWidget zendeskKey={testKey} />);

      expect(document.getElementById('ze-snippet')).not.toBeNull();

      unmount();

      expect(document.getElementById('ze-snippet')).toBeNull();
    });

    it('should call zE messenger close on unmount', () => {
      const mockZE = jest.fn();
      (globalThis as unknown as Record<string, unknown>).zE = mockZE;

      const { unmount } = render(<ZendeskWidget zendeskKey={testKey} />);

      unmount();

      expect(mockZE).toHaveBeenCalledWith('messenger', 'close');
    });

    it('should not fail on cleanup if globalThis.zE does not exist', () => {
      const { unmount } = render(<ZendeskWidget zendeskKey={testKey} />);

      delete (globalThis as unknown as Record<string, unknown>).zE;

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('reference counting with multiple instances', () => {
    it('should not remove the script when only one of two instances unmounts', () => {
      const { unmount: unmount1 } = render(
        <ZendeskWidget zendeskKey={testKey} />
      );
      const { unmount: unmount2 } = render(
        <ZendeskWidget zendeskKey={testKey} />
      );

      expect(document.getElementById('ze-snippet')).not.toBeNull();

      unmount1();

      expect(document.getElementById('ze-snippet')).not.toBeNull();

      unmount2();

      expect(document.getElementById('ze-snippet')).toBeNull();
    });

    it('should call zE close only when the last instance unmounts', () => {
      const mockZE = jest.fn();
      (globalThis as unknown as Record<string, unknown>).zE = mockZE;

      const { unmount: unmount1 } = render(
        <ZendeskWidget zendeskKey={testKey} />
      );
      const { unmount: unmount2 } = render(
        <ZendeskWidget zendeskKey={testKey} />
      );

      unmount1();
      expect(mockZE).not.toHaveBeenCalledWith('messenger', 'close');

      unmount2();
      expect(mockZE).toHaveBeenCalledWith('messenger', 'close');

      delete (globalThis as unknown as Record<string, unknown>).zE;
    });
  });

  describe('zendeskKey change', () => {
    it('should recreate the script when the key changes', () => {
      const { rerender } = render(<ZendeskWidget zendeskKey={testKey} />);

      const firstScript = document.getElementById(
        'ze-snippet'
      ) as HTMLScriptElement;
      expect(firstScript.src).toContain(testKey);

      rerender(<ZendeskWidget zendeskKey="new-key-456" />);

      const newScript = document.getElementById(
        'ze-snippet'
      ) as HTMLScriptElement;
      expect(newScript).not.toBeNull();
    });
  });
});
