import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingModal from './loadingModal';

describe('LoadingModal', () => {
  const defaultProps = {
    open: true,
    title: 'Test Title',
    subtitle: 'Test Subtitle',
  };

  it('renders the modal when open is true', () => {
    render(<LoadingModal {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<LoadingModal {...defaultProps} open={false} />);

    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument();
  });

  it('renders with default title and subtitle when not provided', () => {
    render(<LoadingModal open={true} />);

    expect(screen.getByText('Titulo...')).toBeInTheDocument();
    expect(screen.getByText('Subtitulo...')).toBeInTheDocument();
  });

  it('renders with custom title and subtitle', () => {
    const customTitle = 'Custom Loading Title';
    const customSubtitle = 'Custom loading subtitle text';

    render(
      <LoadingModal open={true} title={customTitle} subtitle={customSubtitle} />
    );

    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customSubtitle)).toBeInTheDocument();
  });

  it('applies correct CSS classes to the modal container', () => {
    render(<LoadingModal {...defaultProps} />);

    const modalContainer = document.querySelector('.fixed.inset-0.z-50');
    expect(modalContainer).toHaveClass(
      'fixed',
      'inset-0',
      'z-50',
      'flex',
      'items-center',
      'justify-center',
      'bg-background/90',
      'backdrop-blur-xs'
    );
  });

  it('applies correct CSS classes to the content container', () => {
    render(<LoadingModal {...defaultProps} />);

    const contentContainer = document.querySelector('.max-w-\\[364px\\]');
    expect(contentContainer).toHaveClass(
      'w-full',
      'max-w-[364px]',
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
      'gap-14'
    );
  });

  it('applies correct CSS classes to the title', () => {
    render(<LoadingModal {...defaultProps} />);

    const title = screen.getByText('Test Title');
    expect(title).toHaveClass('text-text-950', 'text-lg');
  });

  it('applies correct CSS classes to the subtitle', () => {
    render(<LoadingModal {...defaultProps} />);

    const subtitle = screen.getByText('Test Subtitle');
    expect(subtitle).toHaveClass('text-text-600', 'text-lg');
  });

  it('renders the loading spinner SVG', () => {
    render(<LoadingModal {...defaultProps} />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '102');
    expect(svg).toHaveAttribute('height', '102');
    expect(svg).toHaveAttribute('viewBox', '0 0 102 102');
  });

  it('renders both SVG paths for the loading animation', () => {
    render(<LoadingModal {...defaultProps} />);

    const paths = document.querySelectorAll('svg path');
    expect(paths).toHaveLength(2);

    // First path (outer circle)
    expect(paths[0]).toHaveAttribute('fill', '#BBDCF7');

    // Second path (loading arc)
    expect(paths[1]).toHaveAttribute('fill', '#2883D7');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<LoadingModal {...defaultProps} ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders with empty title and subtitle', () => {
    render(<LoadingModal open={true} title="" subtitle="" />);

    // Check that the elements exist even with empty text
    const titleElement = document.querySelector('.text-text-950');
    const subtitleElement = document.querySelector('.text-text-600');

    expect(titleElement).toBeInTheDocument();
    expect(subtitleElement).toBeInTheDocument();
  });

  it('renders with long title and subtitle text', () => {
    const longTitle =
      'This is a very long title that might wrap to multiple lines and test the layout';
    const longSubtitle =
      'This is a very long subtitle that might also wrap to multiple lines and test how the component handles longer text content';

    render(
      <LoadingModal open={true} title={longTitle} subtitle={longSubtitle} />
    );

    expect(screen.getByText(longTitle)).toBeInTheDocument();
    expect(screen.getByText(longSubtitle)).toBeInTheDocument();
  });

  it('renders with special characters in title and subtitle', () => {
    const specialTitle = 'Loading... 🚀 ⚡';
    const specialSubtitle = 'Please wait... 50% complete';

    render(
      <LoadingModal
        open={true}
        title={specialTitle}
        subtitle={specialSubtitle}
      />
    );

    expect(screen.getByText(specialTitle)).toBeInTheDocument();
    expect(screen.getByText(specialSubtitle)).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<LoadingModal {...defaultProps} />);

      // Check if the modal has proper structure
      const modalContainer = document.querySelector('.fixed.inset-0.z-50');
      expect(modalContainer).toBeInTheDocument();

      // Check if content is properly structured
      const contentContainer = document.querySelector('.max-w-\\[364px\\]');
      expect(contentContainer).toBeInTheDocument();
    });

    it('renders text content that is accessible to screen readers', () => {
      render(<LoadingModal {...defaultProps} />);

      const title = screen.getByText('Test Title');
      const subtitle = screen.getByText('Test Subtitle');

      expect(title).toBeInTheDocument();
      expect(subtitle).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles undefined title gracefully', () => {
      render(<LoadingModal open={true} title={undefined} subtitle="Test" />);

      expect(screen.getByText('Titulo...')).toBeInTheDocument();
    });

    it('handles undefined subtitle gracefully', () => {
      render(<LoadingModal open={true} title="Test" subtitle={undefined} />);

      expect(screen.getByText('Subtitulo...')).toBeInTheDocument();
    });

    it('handles null title gracefully', () => {
      render(
        <LoadingModal
          open={true}
          title={null as unknown as string}
          subtitle="Test"
        />
      );

      // When null is passed, it renders as null, not the default value
      const titleElement = document.querySelector('.text-text-950');
      expect(titleElement).toBeInTheDocument();
      expect(titleElement?.textContent).toBe('');
    });

    it('handles null subtitle gracefully', () => {
      render(
        <LoadingModal
          open={true}
          title="Test"
          subtitle={null as unknown as string}
        />
      );

      // When null is passed, it renders as null, not the default value
      const subtitleElement = document.querySelector('.text-text-600');
      expect(subtitleElement).toBeInTheDocument();
      expect(subtitleElement?.textContent).toBe('');
    });
  });
});
