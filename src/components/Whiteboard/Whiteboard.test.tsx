import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Whiteboard, { WhiteboardImage, WhiteboardProps } from './Whiteboard';

afterEach(() => {
  jest.clearAllMocks();
});

describe('Whiteboard Component', () => {
  const mockImages: WhiteboardImage[] = [
    {
      id: '1',
      imageUrl: 'https://example.com/image1.jpg',
      title: 'Board 1',
    },
    {
      id: '2',
      imageUrl: 'https://example.com/image2.jpg',
      title: 'Board 2',
    },
  ];

  const defaultProps: WhiteboardProps = {
    images: mockImages,
  };

  describe('Rendering', () => {
    it('should render whiteboard with images', () => {
      render(<Whiteboard {...defaultProps} />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2);
      expect(images[0]).toHaveAttribute('src', mockImages[0].imageUrl);
      expect(images[1]).toHaveAttribute('src', mockImages[1].imageUrl);
    });

    it('should render with custom className', () => {
      const { container } = render(
        <Whiteboard {...defaultProps} className="custom-class" />
      );

      const whiteboard = container.firstChild;
      expect(whiteboard).toHaveClass('custom-class');
    });

    it('should render empty state when no images provided', () => {
      render(<Whiteboard images={[]} />);

      expect(screen.getByText('Nenhuma imagem disponível')).toBeInTheDocument();
    });

    it('should render download buttons by default', () => {
      render(<Whiteboard {...defaultProps} />);

      const downloadButtons = screen.getAllByLabelText(/Download/);
      expect(downloadButtons).toHaveLength(2);
    });

    it('should not render download buttons when showDownload is false', () => {
      render(<Whiteboard {...defaultProps} showDownload={false} />);

      const downloadButtons = screen.queryAllByLabelText(/Download/);
      expect(downloadButtons).toHaveLength(0);
    });

    it('should render correct alt text for images', () => {
      render(<Whiteboard {...defaultProps} />);

      expect(screen.getByAltText('Board 1')).toBeInTheDocument();
      expect(screen.getByAltText('Board 2')).toBeInTheDocument();
    });

    it('should render fallback alt text when title is not provided', () => {
      const imagesWithoutTitle = [
        { id: '1', imageUrl: 'https://example.com/image1.jpg' },
      ];

      render(<Whiteboard images={imagesWithoutTitle} />);

      expect(screen.getByAltText('Whiteboard 1')).toBeInTheDocument();
    });

    it('should apply lazy loading to images', () => {
      render(<Whiteboard {...defaultProps} />);

      const images = screen.getAllByRole('img');
      images.forEach((img) => {
        expect(img).toHaveAttribute('loading', 'lazy');
      });
    });

    it('should pass additional HTML attributes to container', () => {
      const { container } = render(
        <Whiteboard
          {...defaultProps}
          data-testid="whiteboard"
          id="my-whiteboard"
        />
      );

      const whiteboard = container.firstChild;
      expect(whiteboard).toHaveAttribute('data-testid', 'whiteboard');
      expect(whiteboard).toHaveAttribute('id', 'my-whiteboard');
    });
  });

  describe('Grid Layout', () => {
    it('should render with 2 columns by default', () => {
      const { container } = render(<Whiteboard {...defaultProps} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
    });

    it('should render with 3 columns when specified', () => {
      const { container } = render(
        <Whiteboard {...defaultProps} imagesPerRow={3} />
      );

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass(
        'grid-cols-1',
        'sm:grid-cols-2',
        'lg:grid-cols-3'
      );
    });

    it('should render with 4 columns when specified', () => {
      const { container } = render(
        <Whiteboard {...defaultProps} imagesPerRow={4} />
      );

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass(
        'grid-cols-1',
        'sm:grid-cols-2',
        'lg:grid-cols-4'
      );
    });

    it('should handle single image correctly', () => {
      const singleImage = [mockImages[0]];
      render(<Whiteboard images={singleImage} />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(1);
    });

    it('should handle many images correctly', () => {
      const manyImages = Array.from({ length: 6 }, (_, i) => ({
        id: `${i + 1}`,
        imageUrl: `https://example.com/image${i + 1}.jpg`,
        title: `Board ${i + 1}`,
      }));

      render(<Whiteboard images={manyImages} />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(6);
    });
  });

  describe('Download Functionality', () => {
    it('should call custom onDownload callback when provided', () => {
      const onDownloadMock = jest.fn();
      render(<Whiteboard {...defaultProps} onDownload={onDownloadMock} />);

      const downloadButton = screen.getAllByLabelText(/Download/)[0];
      fireEvent.click(downloadButton);

      expect(onDownloadMock).toHaveBeenCalledWith(mockImages[0]);
    });

    it('should call onDownload when clicking on the image', () => {
      const onDownloadMock = jest.fn();
      render(<Whiteboard {...defaultProps} onDownload={onDownloadMock} />);

      const image = screen.getByAltText('Board 1');
      fireEvent.click(image);

      expect(onDownloadMock).toHaveBeenCalledWith(mockImages[0]);
    });

    it('should handle multiple download clicks', () => {
      const onDownloadMock = jest.fn();
      render(<Whiteboard {...defaultProps} onDownload={onDownloadMock} />);

      const downloadButtons = screen.getAllByLabelText(/Download/);

      fireEvent.click(downloadButtons[0]);
      expect(onDownloadMock).toHaveBeenCalledWith(mockImages[0]);

      fireEvent.click(downloadButtons[1]);
      expect(onDownloadMock).toHaveBeenCalledWith(mockImages[1]);

      expect(onDownloadMock).toHaveBeenCalledTimes(2);
    });

    it('should render download button when no callback provided', () => {
      render(<Whiteboard {...defaultProps} />);

      const downloadButtons = screen.getAllByLabelText(/Download/);
      expect(downloadButtons).toHaveLength(2);
      expect(downloadButtons[0]).toBeInTheDocument();
    });

    it('should trigger default download when no callback provided', () => {
      render(<Whiteboard {...defaultProps} />);

      // Use a real anchor to avoid API mismatch with the component implementation
      const linkEl = document.createElement('a');
      const clickSpy = jest
        .spyOn(linkEl, 'click')
        .mockImplementation(jest.fn());
      const createElementSpy = jest
        .spyOn(document, 'createElement')
        .mockReturnValue(linkEl);

      const appendChildSpy = jest
        .spyOn(document.body, 'appendChild')
        .mockImplementation(jest.fn());

      const removeChildSpy = jest
        .spyOn(document.body, 'removeChild')
        .mockImplementation(jest.fn());

      const downloadButton = screen.getAllByLabelText(/Download/)[0];
      fireEvent.click(downloadButton);

      // Verify DOM operations
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(linkEl.href).toBe(mockImages[0].imageUrl);
      expect(linkEl.download).toBe(mockImages[0].title);
      expect(linkEl.target).toBe('_blank');
      expect(linkEl.rel).toBe('noopener noreferrer');
      expect(appendChildSpy).toHaveBeenCalledWith(linkEl);
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalledWith(linkEl);

      // Cleanup
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      clickSpy.mockRestore();
    });

    it('should use fallback download name when title not provided', () => {
      const imageWithoutTitle = [
        { id: '1', imageUrl: 'https://example.com/image1.jpg' },
      ];

      render(<Whiteboard images={imageWithoutTitle} />);

      // Use a real anchor to avoid API mismatch with the component implementation
      const linkEl = document.createElement('a');
      const clickSpy = jest
        .spyOn(linkEl, 'click')
        .mockImplementation(jest.fn());
      const createElementSpy = jest
        .spyOn(document, 'createElement')
        .mockReturnValue(linkEl);

      const appendChildSpy = jest
        .spyOn(document.body, 'appendChild')
        .mockImplementation(jest.fn());

      const removeChildSpy = jest
        .spyOn(document.body, 'removeChild')
        .mockImplementation(jest.fn());

      const downloadButton = screen.getByLabelText(/Download/);
      fireEvent.click(downloadButton);

      expect(linkEl.download).toBe('whiteboard-1');

      // Cleanup
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      clickSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label for download buttons', () => {
      render(<Whiteboard {...defaultProps} />);

      expect(screen.getByLabelText('Download Board 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Download Board 2')).toBeInTheDocument();
    });

    it('should have fallback aria-label when title is not provided', () => {
      const imagesWithoutTitle = [
        { id: '1', imageUrl: 'https://example.com/image1.jpg' },
      ];

      render(<Whiteboard images={imagesWithoutTitle} />);

      expect(screen.getByLabelText('Download imagem')).toBeInTheDocument();
    });

    it('should have semantic HTML structure', () => {
      const { container } = render(<Whiteboard {...defaultProps} />);

      const images = container.querySelectorAll('img');
      const buttons = container.querySelectorAll('button');

      expect(images).toHaveLength(2);
      expect(buttons).toHaveLength(4);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined images array', () => {
      render(<Whiteboard images={undefined as unknown as WhiteboardImage[]} />);

      expect(screen.getByText('Nenhuma imagem disponível')).toBeInTheDocument();
    });

    it('should handle null images array', () => {
      render(<Whiteboard images={null as unknown as WhiteboardImage[]} />);

      expect(screen.getByText('Nenhuma imagem disponível')).toBeInTheDocument();
    });

    it('should handle images with special characters in URL', () => {
      const specialImages = [
        {
          id: '1',
          imageUrl: 'https://example.com/image%20with%20spaces.jpg',
          title: 'Special Image',
        },
      ];

      render(<Whiteboard images={specialImages} />);

      const image = screen.getByAltText('Special Image');
      expect(image).toHaveAttribute('src', specialImages[0].imageUrl);
    });

    it('should handle very long titles', () => {
      const longTitleImages = [
        {
          id: '1',
          imageUrl: 'https://example.com/image.jpg',
          title: 'A'.repeat(100),
        },
      ];

      render(<Whiteboard images={longTitleImages} />);

      const image = screen.getByAltText('A'.repeat(100));
      expect(image).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle image loading error', () => {
      const { container } = render(<Whiteboard {...defaultProps} />);

      // Get the first image
      const image = container.querySelector('img') as HTMLImageElement;
      expect(image).toBeInTheDocument();

      // Simulate image error
      fireEvent.error(image);

      // Check if error placeholder is shown
      expect(screen.getByText('Imagem indisponível')).toBeInTheDocument();
    });

    it('should handle multiple image errors', () => {
      const { container } = render(<Whiteboard {...defaultProps} />);

      // Get all images
      const images = container.querySelectorAll('img');
      expect(images).toHaveLength(2);

      // Simulate error on both images
      fireEvent.error(images[0]);
      fireEvent.error(images[1]);

      // Check if both error placeholders are shown
      const errorMessages = screen.getAllByText('Imagem indisponível');
      expect(errorMessages).toHaveLength(2);
    });

    it('should maintain error state when component re-renders', () => {
      const { rerender, container } = render(<Whiteboard {...defaultProps} />);

      // Trigger image error
      const image = container.querySelector('img') as HTMLImageElement;
      fireEvent.error(image);

      // Verify error state
      expect(screen.getByText('Imagem indisponível')).toBeInTheDocument();

      // Re-render with same props
      rerender(<Whiteboard {...defaultProps} />);

      // Error state should persist
      expect(screen.getByText('Imagem indisponível')).toBeInTheDocument();
    });
  });
});
