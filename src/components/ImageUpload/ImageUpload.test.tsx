import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageUpload from './ImageUpload';

describe('ImageUpload Component', () => {
  const mockFile = new File(['dummy content'], 'test.png', {
    type: 'image/png',
  });

  describe('rendering', () => {
    it('should render upload button when no file is selected', () => {
      render(<ImageUpload />);
      expect(screen.getByText('Inserir imagem')).toBeInTheDocument();
    });

    it('should render custom button text', () => {
      render(<ImageUpload buttonText="Upload File" />);
      expect(screen.getByText('Upload File')).toBeInTheDocument();
    });

    it('should render file name when file is selected', () => {
      render(<ImageUpload selectedFile={mockFile} />);
      expect(screen.getByText('test.png')).toBeInTheDocument();
    });

    it('should render in compact variant', () => {
      const { container } = render(
        <ImageUpload variant="compact" buttonText="Upload" />
      );
      expect(container.querySelector('.inline-flex')).toBeInTheDocument();
    });
  });

  describe('file selection', () => {
    it('should call onFileSelect when file is selected', () => {
      const onFileSelect = jest.fn();
      render(<ImageUpload onFileSelect={onFileSelect} />);

      const button = screen.getByText('Inserir imagem');
      fireEvent.click(button);

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { files: [mockFile] } });

      expect(onFileSelect).toHaveBeenCalledWith(mockFile);
    });

    it('should not call onFileSelect when disabled', () => {
      const onFileSelect = jest.fn();
      render(<ImageUpload onFileSelect={onFileSelect} disabled />);

      const button = screen.getByText('Inserir imagem');
      fireEvent.click(button);

      expect(onFileSelect).not.toHaveBeenCalled();
    });

    it('should call onTypeError for invalid file type', () => {
      const onTypeError = jest.fn();
      const invalidFile = new File(['content'], 'test.txt', {
        type: 'text/plain',
      });

      render(<ImageUpload accept="image/*" onTypeError={onTypeError} />);

      const button = screen.getByText('Inserir imagem');
      fireEvent.click(button);

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { files: [invalidFile] } });

      expect(onTypeError).toHaveBeenCalledWith(invalidFile);
    });

    it('should call onSizeError when file exceeds maxSize', () => {
      const onSizeError = jest.fn();
      const largeFile = new File(['x'.repeat(2000)], 'large.png', {
        type: 'image/png',
      });

      render(<ImageUpload maxSize={1000} onSizeError={onSizeError} />);

      const button = screen.getByText('Inserir imagem');
      fireEvent.click(button);

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { files: [largeFile] } });

      expect(onSizeError).toHaveBeenCalledWith(largeFile, 1000);
    });
  });

  describe('file removal', () => {
    it('should call onRemoveFile when remove button is clicked', () => {
      const onRemoveFile = jest.fn();
      render(
        <ImageUpload selectedFile={mockFile} onRemoveFile={onRemoveFile} />
      );

      const removeButton = screen.getByRole('button', { name: '' });
      fireEvent.click(removeButton);

      expect(onRemoveFile).toHaveBeenCalled();
    });

    it('should not call onRemoveFile when disabled', () => {
      const onRemoveFile = jest.fn();
      render(
        <ImageUpload
          selectedFile={mockFile}
          onRemoveFile={onRemoveFile}
          disabled
        />
      );

      const removeButton = document.querySelector('button[type="button"]');
      if (removeButton) {
        fireEvent.click(removeButton);
      }

      expect(onRemoveFile).not.toHaveBeenCalled();
    });
  });

  describe('progress bar', () => {
    it('should render progress bar when file is selected and progress is less than 100', () => {
      const { container } = render(
        <ImageUpload selectedFile={mockFile} uploadProgress={50} />
      );

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveStyle({ width: '50%' });
    });

    it('should not render progress bar when progress is 100', () => {
      const { container } = render(
        <ImageUpload selectedFile={mockFile} uploadProgress={100} />
      );

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).not.toBeInTheDocument();
    });

    it('should not render progress bar when showProgress is false', () => {
      const { container } = render(
        <ImageUpload
          selectedFile={mockFile}
          uploadProgress={50}
          showProgress={false}
        />
      );

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).not.toBeInTheDocument();
    });
  });

  describe('uncontrolled mode', () => {
    it('should work in uncontrolled mode without selectedFile prop', () => {
      const onFileSelect = jest.fn();
      render(<ImageUpload onFileSelect={onFileSelect} />);

      const button = screen.getByText('Inserir imagem');
      fireEvent.click(button);

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { files: [mockFile] } });

      expect(onFileSelect).toHaveBeenCalledWith(mockFile);
      expect(screen.getByText('test.png')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper aria attributes on progress bar', () => {
      const { container } = render(
        <ImageUpload selectedFile={mockFile} uploadProgress={75} />
      );

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should have disabled state on buttons when disabled', () => {
      render(<ImageUpload disabled />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('custom styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<ImageUpload className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
