import { render, screen, fireEvent } from '@testing-library/react';
import FileDropzone from './FileDropzone';

describe('FileDropzone', () => {
  const defaultProps = {
    accept: 'image/*',
    fileType: 'image' as const,
  };

  describe('Basic rendering', () => {
    it('should render with label', () => {
      render(<FileDropzone {...defaultProps} label="Upload de imagem" />);

      expect(screen.getByText('Upload de imagem')).toBeInTheDocument();
    });

    it('should render with helper text', () => {
      render(
        <FileDropzone {...defaultProps} helperText="Formatos aceitos: JPG, PNG" />
      );

      expect(screen.getByText('Formatos aceitos: JPG, PNG')).toBeInTheDocument();
    });

    it('should render with error message', () => {
      render(
        <FileDropzone {...defaultProps} errorMessage="Arquivo muito grande" />
      );

      expect(screen.getByText('Arquivo muito grande')).toBeInTheDocument();
    });

    it('should hide helper text when error message is present', () => {
      render(
        <FileDropzone
          {...defaultProps}
          helperText="Formatos aceitos: JPG, PNG"
          errorMessage="Arquivo inválido"
        />
      );

      expect(
        screen.queryByText('Formatos aceitos: JPG, PNG')
      ).not.toBeInTheDocument();
      expect(screen.getByText('Arquivo inválido')).toBeInTheDocument();
    });

    it('should display required indicator when required', () => {
      render(<FileDropzone {...defaultProps} label="Imagem" required />);

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should render default placeholder for image type', () => {
      render(<FileDropzone {...defaultProps} />);

      expect(
        screen.getByText('para subir a imagem ou arraste aqui')
      ).toBeInTheDocument();
    });

    it('should render default placeholder for video type', () => {
      render(<FileDropzone accept="video/*" fileType="video" />);

      expect(
        screen.getByText('para subir o vídeo ou arraste aqui')
      ).toBeInTheDocument();
    });

    it('should render default placeholder for audio type', () => {
      render(<FileDropzone accept="audio/*" fileType="audio" />);

      expect(
        screen.getByText('para subir o áudio ou arraste aqui')
      ).toBeInTheDocument();
    });

    it('should render default placeholder for pdf type', () => {
      render(<FileDropzone accept=".pdf" fileType="pdf" />);

      expect(
        screen.getByText('para subir o PDF ou arraste aqui')
      ).toBeInTheDocument();
    });

    it('should render default placeholder for subtitle type', () => {
      render(<FileDropzone accept=".vtt,.srt" fileType="subtitle" />);

      expect(
        screen.getByText('para subir a legenda ou arraste aqui')
      ).toBeInTheDocument();
    });

    it('should render custom placeholder', () => {
      render(
        <FileDropzone {...defaultProps} placeholder="Arraste sua foto aqui" />
      );

      expect(screen.getByText('Arraste sua foto aqui')).toBeInTheDocument();
    });

    it('should render custom action text', () => {
      render(<FileDropzone {...defaultProps} actionText="Selecione" />);

      expect(screen.getByText('Selecione')).toBeInTheDocument();
    });
  });

  describe('File selection', () => {
    it('should call onFileSelect when valid file is selected', () => {
      const handleFileSelect = jest.fn();
      render(
        <FileDropzone {...defaultProps} onFileSelect={handleFileSelect} />
      );

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      expect(handleFileSelect).toHaveBeenCalledWith(file);
    });

    it('should not call onFileSelect when disabled', () => {
      const handleFileSelect = jest.fn();
      render(
        <FileDropzone {...defaultProps} onFileSelect={handleFileSelect} disabled />
      );

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      expect(handleFileSelect).not.toHaveBeenCalled();
    });

    it('should reset input value after selection', () => {
      const handleFileSelect = jest.fn();
      render(
        <FileDropzone {...defaultProps} onFileSelect={handleFileSelect} />
      );

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      expect(input.value).toBe('');
    });
  });

  describe('File validation', () => {
    it('should call onTypeError when file type is invalid', () => {
      const handleTypeError = jest.fn();
      render(
        <FileDropzone
          {...defaultProps}
          accept="image/png"
          onTypeError={handleTypeError}
        />
      );

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      expect(handleTypeError).toHaveBeenCalledWith(file);
    });

    it('should call onSizeError when file size exceeds maxSize', () => {
      const handleSizeError = jest.fn();
      const maxSize = 1024; // 1KB
      render(
        <FileDropzone
          {...defaultProps}
          maxSize={maxSize}
          onSizeError={handleSizeError}
        />
      );

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const largeContent = 'x'.repeat(2048); // 2KB
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      expect(handleSizeError).toHaveBeenCalledWith(file, maxSize);
    });

    it('should accept file with extension format', () => {
      const handleFileSelect = jest.fn();
      render(
        <FileDropzone
          accept=".jpg,.png"
          fileType="image"
          onFileSelect={handleFileSelect}
        />
      );

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      expect(handleFileSelect).toHaveBeenCalledWith(file);
    });

    it('should accept file with wildcard mime type', () => {
      const handleFileSelect = jest.fn();
      render(
        <FileDropzone
          accept="image/*"
          fileType="image"
          onFileSelect={handleFileSelect}
        />
      );

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      expect(handleFileSelect).toHaveBeenCalledWith(file);
    });
  });

  describe('Drag and drop', () => {
    it('should change style when dragging over', () => {
      render(<FileDropzone {...defaultProps} />);

      const dropzone = document.querySelector('label.flex') as HTMLElement;
      fireEvent.dragEnter(dropzone);

      expect(dropzone.className).toContain('bg-primary-50');
    });

    it('should reset style when drag leaves', () => {
      render(<FileDropzone {...defaultProps} />);

      const dropzone = document.querySelector('label.flex') as HTMLElement;
      fireEvent.dragEnter(dropzone);
      fireEvent.dragLeave(dropzone);

      expect(dropzone.className).not.toContain('bg-primary-50');
      expect(dropzone.className).toContain('border-border-200');
    });

    it('should call onFileSelect when valid file is dropped', () => {
      const handleFileSelect = jest.fn();
      render(
        <FileDropzone {...defaultProps} onFileSelect={handleFileSelect} />
      );

      const dropzone = document.querySelector('label.flex') as HTMLElement;
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const dataTransfer = { files: [file] };

      fireEvent.drop(dropzone, { dataTransfer });

      expect(handleFileSelect).toHaveBeenCalledWith(file);
    });

    it('should not accept drop when disabled', () => {
      const handleFileSelect = jest.fn();
      render(
        <FileDropzone {...defaultProps} onFileSelect={handleFileSelect} disabled />
      );

      const dropzone = document.querySelector('label.flex') as HTMLElement;
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const dataTransfer = { files: [file] };

      fireEvent.drop(dropzone, { dataTransfer });

      expect(handleFileSelect).not.toHaveBeenCalled();
    });

    it('should not change style when dragging over disabled dropzone', () => {
      render(<FileDropzone {...defaultProps} disabled />);

      const dropzone = document.querySelector('label.flex') as HTMLElement;
      fireEvent.dragEnter(dropzone);

      expect(dropzone.className).not.toContain('bg-primary-50');
    });
  });

  describe('File preview', () => {
    it('should display file name when file is selected', () => {
      const file = new File(['test'], 'documento.pdf', {
        type: 'application/pdf',
      });
      render(
        <FileDropzone accept=".pdf" fileType="pdf" selectedFile={file} />
      );

      expect(screen.getByText('documento.pdf')).toBeInTheDocument();
    });

    it('should display "Arquivo carregado" when fileUrl is provided without selectedFile', () => {
      render(
        <FileDropzone
          accept=".pdf"
          fileType="pdf"
          fileUrl="https://example.com/file.pdf"
        />
      );

      expect(screen.getByText('Arquivo carregado')).toBeInTheDocument();
    });

    it('should display change text when file exists', () => {
      const file = new File(['test'], 'video.mp4', { type: 'video/mp4' });
      render(
        <FileDropzone accept="video/*" fileType="video" selectedFile={file} />
      );

      expect(
        screen.getByText('Clique para trocar o arquivo')
      ).toBeInTheDocument();
    });

    it('should display custom change text', () => {
      const file = new File(['test'], 'video.mp4', { type: 'video/mp4' });
      render(
        <FileDropzone
          accept="video/*"
          fileType="video"
          selectedFile={file}
          changeText="Substituir vídeo"
        />
      );

      expect(screen.getByText('Substituir vídeo')).toBeInTheDocument();
    });

    it('should display image change text for image type', () => {
      render(
        <FileDropzone
          {...defaultProps}
          fileUrl="https://example.com/image.jpg"
          showPreview={false}
        />
      );

      expect(
        screen.getByText('Clique para alterar a imagem')
      ).toBeInTheDocument();
    });
  });

  describe('Remove file', () => {
    it('should display remove button when onRemoveFile is provided', () => {
      const handleRemoveFile = jest.fn();
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      render(
        <FileDropzone
          accept=".pdf"
          fileType="pdf"
          selectedFile={file}
          onRemoveFile={handleRemoveFile}
        />
      );

      expect(screen.getByLabelText('Remover arquivo')).toBeInTheDocument();
    });

    it('should call onRemoveFile when remove button is clicked', () => {
      const handleRemoveFile = jest.fn();
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      render(
        <FileDropzone
          accept=".pdf"
          fileType="pdf"
          selectedFile={file}
          onRemoveFile={handleRemoveFile}
        />
      );

      const removeButton = screen.getByLabelText('Remover arquivo');
      fireEvent.click(removeButton);

      expect(handleRemoveFile).toHaveBeenCalled();
    });

    it('should not call onRemoveFile when disabled', () => {
      const handleRemoveFile = jest.fn();
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      render(
        <FileDropzone
          accept=".pdf"
          fileType="pdf"
          selectedFile={file}
          onRemoveFile={handleRemoveFile}
          disabled
        />
      );

      const removeButton = screen.queryByLabelText('Remover arquivo');
      expect(removeButton).not.toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('should apply error border style when errorMessage is present', () => {
      render(
        <FileDropzone {...defaultProps} errorMessage="Arquivo inválido" />
      );

      const dropzone = document.querySelector('label.flex') as HTMLElement;
      expect(dropzone.className).toContain('border-indicator-error');
    });
  });

  describe('Disabled state', () => {
    it('should apply disabled styles when disabled', () => {
      render(<FileDropzone {...defaultProps} disabled />);

      const dropzone = document.querySelector('label.flex') as HTMLElement;
      expect(dropzone.className).toContain('cursor-not-allowed');
      expect(dropzone.className).toContain('opacity-50');
    });

    it('should disable file input when disabled', () => {
      render(<FileDropzone {...defaultProps} disabled />);

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      expect(input).toBeDisabled();
    });
  });

  describe('Image preview', () => {
    it('should not show image preview when showPreview is false', () => {
      render(
        <FileDropzone
          {...defaultProps}
          fileUrl="https://example.com/image.jpg"
          showPreview={false}
        />
      );

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('should show image preview when showPreview is true and fileUrl is provided', () => {
      render(
        <FileDropzone
          {...defaultProps}
          fileUrl="https://example.com/image.jpg"
          showPreview={true}
        />
      );

      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('should apply custom previewMaxHeight', () => {
      render(
        <FileDropzone
          {...defaultProps}
          fileUrl="https://example.com/image.jpg"
          showPreview={true}
          previewMaxHeight="max-h-64"
        />
      );

      const img = screen.getByRole('img');
      expect(img.className).toContain('max-h-64');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible file input', () => {
      render(<FileDropzone {...defaultProps} label="Upload de arquivo" />);

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const label = screen.getByText('Upload de arquivo');

      expect(input).toHaveAttribute('id');
      expect(label).toHaveAttribute('for', input.id);
    });
  });
});
