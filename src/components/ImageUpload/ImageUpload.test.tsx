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

    it('should accept file with valid extension pattern', () => {
      const onFileSelect = jest.fn();
      const onTypeError = jest.fn();
      const pngFile = new File(['content'], 'test.PNG', {
        type: 'image/png',
      });

      render(
        <ImageUpload
          accept=".png,.jpg,.jpeg"
          onFileSelect={onFileSelect}
          onTypeError={onTypeError}
        />
      );

      const button = screen.getByText('Inserir imagem');
      fireEvent.click(button);

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { files: [pngFile] } });

      expect(onFileSelect).toHaveBeenCalledWith(pngFile);
      expect(onTypeError).not.toHaveBeenCalled();
    });

    it('should accept file with valid extension pattern (case insensitive)', () => {
      const onFileSelect = jest.fn();
      const onTypeError = jest.fn();
      const jpgFile = new File(['content'], 'test.JPG', {
        type: 'image/jpeg',
      });

      render(
        <ImageUpload
          accept=".png,.jpg,.jpeg"
          onFileSelect={onFileSelect}
          onTypeError={onTypeError}
        />
      );

      const button = screen.getByText('Inserir imagem');
      fireEvent.click(button);

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { files: [jpgFile] } });

      expect(onFileSelect).toHaveBeenCalledWith(jpgFile);
      expect(onTypeError).not.toHaveBeenCalled();
    });

    it('should call onTypeError for invalid extension pattern', () => {
      const onTypeError = jest.fn();
      const invalidFile = new File(['content'], 'test.txt', {
        type: 'text/plain',
      });

      render(
        <ImageUpload accept=".png,.jpg,.jpeg" onTypeError={onTypeError} />
      );

      const button = screen.getByText('Inserir imagem');
      fireEvent.click(button);

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { files: [invalidFile] } });

      expect(onTypeError).toHaveBeenCalledWith(invalidFile);
    });

    it('should accept file with mixed accept patterns (MIME and extension)', () => {
      const onFileSelect = jest.fn();
      const onTypeError = jest.fn();
      const pngFile = new File(['content'], 'test.png', {
        type: 'image/png',
      });

      render(
        <ImageUpload
          accept="image/*,.pdf,.doc"
          onFileSelect={onFileSelect}
          onTypeError={onTypeError}
        />
      );

      const button = screen.getByText('Inserir imagem');
      fireEvent.click(button);

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { files: [pngFile] } });

      expect(onFileSelect).toHaveBeenCalledWith(pngFile);
      expect(onTypeError).not.toHaveBeenCalled();
    });

    it('should accept file with exact MIME type match', () => {
      const onFileSelect = jest.fn();
      const onTypeError = jest.fn();
      const pngFile = new File(['content'], 'test.png', {
        type: 'image/png',
      });

      render(
        <ImageUpload
          accept="image/png,image/jpeg"
          onFileSelect={onFileSelect}
          onTypeError={onTypeError}
        />
      );

      const button = screen.getByText('Inserir imagem');
      fireEvent.click(button);

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { files: [pngFile] } });

      expect(onFileSelect).toHaveBeenCalledWith(pngFile);
      expect(onTypeError).not.toHaveBeenCalled();
    });

    it('should handle accept string with spaces and mixed patterns', () => {
      const onFileSelect = jest.fn();
      const onTypeError = jest.fn();
      const pngFile = new File(['content'], 'test.png', {
        type: 'image/png',
      });

      render(
        <ImageUpload
          accept="image/*, .pdf, .doc, image/jpeg"
          onFileSelect={onFileSelect}
          onTypeError={onTypeError}
        />
      );

      const button = screen.getByText('Inserir imagem');
      fireEvent.click(button);

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { files: [pngFile] } });

      expect(onFileSelect).toHaveBeenCalledWith(pngFile);
      expect(onTypeError).not.toHaveBeenCalled();
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
