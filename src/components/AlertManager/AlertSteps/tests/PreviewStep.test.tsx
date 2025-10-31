import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PreviewStep } from '../PreviewStep';
import { useAlertFormStore } from '../../useAlertForm';
import type { ReactNode } from 'react';

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'blob:mock-url'),
});

// Mock URL.revokeObjectURL
Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
});

// Mock the Text component
jest.mock('../../../..', () => ({
  Text: ({
    children,
    size,
    weight,
    className,
  }: {
    children?: ReactNode;
    size?: string;
    weight?: string;
    className?: string;
  }) => (
    <span data-size={size} data-weight={weight} className={className}>
      {children}
    </span>
  ),
}));

// Mock the notification image
jest.mock('../../../../assets/img/notification.png', () => 'notification.png');

describe('PreviewStep', () => {
  beforeEach(() => {
    useAlertFormStore.getState().resetForm();
  });

  describe('rendering', () => {
    it('should render preview section', () => {
      render(<PreviewStep defaultImage="notification.png" />);

      expect(
        screen.getByRole('img', { name: /imagem do alerta/i })
      ).toBeInTheDocument();
      expect(screen.getByText('Nenhum Título de Alerta')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Aqui aparecerá a mensagem do alerta definido pelo usuário'
        )
      ).toBeInTheDocument();
    });

    it('should render with default image when no image is set', () => {
      render(<PreviewStep defaultImage="notification.png" />);

      const image = screen.getByRole('img', { name: /imagem do alerta/i });
      expect(image).toHaveAttribute('src', 'notification.png');
    });
  });

  describe('title display', () => {
    it('should display default title when no title is set', () => {
      render(<PreviewStep />);

      expect(screen.getByText('Nenhum Título de Alerta')).toBeInTheDocument();
    });

    it('should display custom title from store', () => {
      act(() => {
        useAlertFormStore.getState().setTitle('Test Alert Title');
      });

      render(<PreviewStep />);

      expect(screen.getByText('Test Alert Title')).toBeInTheDocument();
      expect(
        screen.queryByText('Nenhum Título de Alerta')
      ).not.toBeInTheDocument();
    });

    it('should display empty string title', () => {
      useAlertFormStore.getState().setTitle('');

      render(<PreviewStep />);

      expect(screen.getByText('Nenhum Título de Alerta')).toBeInTheDocument();
    });

    it('should display title with proper styling', () => {
      act(() => {
        useAlertFormStore.getState().setTitle('Styled Title');
      });

      render(<PreviewStep />);

      const titleElement = screen.getByText('Styled Title');
      expect(titleElement).toHaveAttribute('data-size', 'lg');
      expect(titleElement).toHaveAttribute('data-weight', 'semibold');
    });
  });

  describe('message display', () => {
    it('should display default message when no message is set', () => {
      render(<PreviewStep />);

      expect(
        screen.getByText(
          'Aqui aparecerá a mensagem do alerta definido pelo usuário'
        )
      ).toBeInTheDocument();
    });

    it('should display custom message from store', () => {
      act(() => {
        useAlertFormStore.getState().setMessage('Test alert message content');
      });

      render(<PreviewStep />);

      expect(
        screen.getByText('Test alert message content')
      ).toBeInTheDocument();
      expect(
        screen.queryByText(
          'Aqui aparecerá a mensagem do alerta definido pelo usuário'
        )
      ).not.toBeInTheDocument();
    });

    it('should display empty string message', () => {
      useAlertFormStore.getState().setMessage('');

      render(<PreviewStep />);

      expect(
        screen.getByText(
          'Aqui aparecerá a mensagem do alerta definido pelo usuário'
        )
      ).toBeInTheDocument();
    });

    it('should display message with proper styling', () => {
      act(() => {
        useAlertFormStore.getState().setMessage('Styled Message');
      });

      render(<PreviewStep />);

      const messageElement = screen.getByText('Styled Message');
      expect(messageElement).toHaveAttribute('data-size', 'sm');
      expect(messageElement).toHaveAttribute('data-weight', 'normal');
      expect(messageElement).toHaveClass('text-text-500');
    });
  });

  describe('image display', () => {
    it('should display default notification image when no image is set', () => {
      render(<PreviewStep defaultImage="notification.png" />);

      const image = screen.getByRole('img', { name: /imagem do alerta/i });
      expect(image).toHaveAttribute('src', 'notification.png');
    });

    it('should display image URL when image is a string', () => {
      const imageUrl = 'https://example.com/image.jpg';
      act(() => {
        useAlertFormStore.getState().setImage(imageUrl);
      });

      render(<PreviewStep />);

      const image = screen.getByRole('img', { name: /imagem do alerta/i });
      // String URLs should be used directly
      expect(image).toHaveAttribute('src', imageUrl);
    });

    it('should display image from File object', () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      act(() => {
        useAlertFormStore.getState().setImage(mockFile);
      });

      render(<PreviewStep />);

      const image = screen.getByRole('img', { name: /imagem do alerta/i });
      // File objects create blob URLs, so we check that src starts with 'blob:'
      expect(image.getAttribute('src')).toMatch(/^blob:/);
    });

    it('should display default image when image is a Blob (not supported)', () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      act(() => {
        useAlertFormStore.getState().setImage(mockBlob as unknown as File);
      });

      render(<PreviewStep defaultImage="notification.png" />);

      const image = screen.getByRole('img', { name: /imagem do alerta/i });
      // Since we only support File objects, Blob should fallback to default image
      expect(image).toHaveAttribute('src', 'notification.png');
    });

    it('should handle null image', () => {
      useAlertFormStore.getState().setImage(null);

      render(<PreviewStep defaultImage="notification.png" />);

      const image = screen.getByRole('img', { name: /imagem do alerta/i });
      expect(image).toHaveAttribute('src', 'notification.png');
    });
  });

  describe('store integration', () => {
    it('should update when store values change', () => {
      const { rerender } = render(
        <PreviewStep defaultImage="notification.png" />
      );

      // Initial state
      expect(screen.getByText('Nenhum Título de Alerta')).toBeInTheDocument();

      // Update store
      act(() => {
        useAlertFormStore.getState().setTitle('Updated Title');
        useAlertFormStore.getState().setMessage('Updated Message');
      });

      rerender(<PreviewStep defaultImage="notification.png" />);

      expect(screen.getByText('Updated Title')).toBeInTheDocument();
      expect(screen.getByText('Updated Message')).toBeInTheDocument();
    });

    it('should use selector to get specific state values', () => {
      // Set initial values
      const imageUrl = 'selector-image.jpg';
      act(() => {
        useAlertFormStore.getState().setTitle('Selector Title');
        useAlertFormStore.getState().setMessage('Selector Message');
        useAlertFormStore.getState().setImage(imageUrl);
      });

      render(<PreviewStep defaultImage="notification.png" />);

      expect(screen.getByText('Selector Title')).toBeInTheDocument();
      expect(screen.getByText('Selector Message')).toBeInTheDocument();

      // When there is a title, image alt should be the title
      const image = screen.getByAltText('Selector Title');
      // String URLs should be used directly
      expect(image).toHaveAttribute('src', imageUrl);
    });
  });

  describe('imageLink and defaultImage functionality', () => {
    it('should prioritize imageLink over image from store', () => {
      const imageUrl = 'https://example.com/store-image.jpg';
      act(() => {
        useAlertFormStore.getState().setImage(imageUrl);
      });

      render(
        <PreviewStep
          imageLink="https://example.com/uploaded-image.jpg"
          defaultImage="notification.png"
        />
      );

      const image = screen.getByRole('img', { name: /imagem do alerta/i });
      expect(image).toHaveAttribute(
        'src',
        'https://example.com/uploaded-image.jpg'
      );
    });

    it('should prioritize imageLink over defaultImage', () => {
      render(
        <PreviewStep
          imageLink="https://example.com/uploaded-image.jpg"
          defaultImage="notification.png"
        />
      );

      const image = screen.getByRole('img', { name: /imagem do alerta/i });
      expect(image).toHaveAttribute(
        'src',
        'https://example.com/uploaded-image.jpg'
      );
    });

    it('should use image from store when imageLink is not provided', () => {
      const imageUrl = 'https://example.com/store-image.jpg';
      act(() => {
        useAlertFormStore.getState().setImage(imageUrl);
      });

      render(<PreviewStep defaultImage="notification.png" />);

      const image = screen.getByRole('img', { name: /imagem do alerta/i });
      expect(image).toHaveAttribute('src', imageUrl);
    });

    it('should use defaultImage as fallback when no image is set', () => {
      render(<PreviewStep defaultImage="https://example.com/default.jpg" />);

      const image = screen.getByRole('img', { name: /imagem do alerta/i });
      expect(image).toHaveAttribute('src', 'https://example.com/default.jpg');
    });

    it('should not render image when no image source is available', () => {
      render(<PreviewStep />);

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('should prioritize: imageLink > File (blob) > defaultImage', () => {
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      act(() => {
        useAlertFormStore.getState().setImage(testFile);
      });

      render(
        <PreviewStep
          imageLink="https://example.com/uploaded-image.jpg"
          defaultImage="notification.png"
        />
      );

      const image = screen.getByRole('img', { name: /imagem do alerta/i });
      expect(image).toHaveAttribute(
        'src',
        'https://example.com/uploaded-image.jpg'
      );
    });
  });

  describe('component structure', () => {
    it('should have proper section structure', () => {
      render(<PreviewStep defaultImage="notification.png" />);

      const section = screen
        .getByRole('img', { name: /imagem do alerta/i })
        .closest('section');
      expect(section).toHaveClass('flex', 'flex-col', 'gap-4');
    });

    it('should have proper preview container structure', () => {
      render(<PreviewStep defaultImage="notification.png" />);

      const image = screen.getByRole('img', { name: /imagem do alerta/i });
      const container = image.closest('div');
      expect(container).toHaveClass(
        'bg-background-50',
        'px-5',
        'py-6',
        'flex',
        'flex-col',
        'items-center',
        'gap-4',
        'rounded-xl'
      );
    });

    it('should have proper content structure', () => {
      render(<PreviewStep defaultImage="notification.png" />);

      const title = screen.getByText('Nenhum Título de Alerta');
      const contentContainer = title.closest('div');
      expect(contentContainer).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'text-center',
        'gap-3'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(1000);
      act(() => {
        useAlertFormStore.getState().setTitle(longTitle);
      });

      render(<PreviewStep />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle very long message', () => {
      const longMessage = 'B'.repeat(1000);
      act(() => {
        useAlertFormStore.getState().setMessage(longMessage);
      });

      render(<PreviewStep />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle special characters in title and message', () => {
      const specialTitle = 'Título com acentos: àáâãéêíóôõúç';
      const specialMessage =
        'Mensagem com símbolos: !@#$%^&*()_+-=[]{}|;:,.<>?';

      act(() => {
        useAlertFormStore.getState().setTitle(specialTitle);
        useAlertFormStore.getState().setMessage(specialMessage);
      });

      render(<PreviewStep />);

      expect(screen.getByText(specialTitle)).toBeInTheDocument();
      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });
  });
});
