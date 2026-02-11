import { render, screen, fireEvent } from '@testing-library/react';
import ImageDropzone from './ImageDropzone';

// Mock URL.createObjectURL
const mockCreateObjectURL = jest.fn(() => 'mock-url');
window.URL.createObjectURL = mockCreateObjectURL;

describe('ImageDropzone', () => {
  beforeEach(() => {
    mockCreateObjectURL.mockClear();
  });

  it('should render with label', () => {
    render(<ImageDropzone label="Capa" />);

    expect(screen.getByText('Capa')).toBeInTheDocument();
  });

  it('should render with helper text', () => {
    render(
      <ImageDropzone label="Capa" helperText="Formatos aceitos: JPG, PNG" />
    );

    expect(screen.getByText('Formatos aceitos: JPG, PNG')).toBeInTheDocument();
  });

  it('should render with error message', () => {
    render(<ImageDropzone label="Capa" errorMessage="Imagem obrigatória" />);

    expect(screen.getByText('Imagem obrigatória')).toBeInTheDocument();
  });

  it('should hide helper text when error message is present', () => {
    render(
      <ImageDropzone
        label="Capa"
        helperText="Formatos aceitos"
        errorMessage="Erro"
      />
    );

    expect(screen.queryByText('Formatos aceitos')).not.toBeInTheDocument();
    expect(screen.getByText('Erro')).toBeInTheDocument();
  });

  it('should display required indicator when required', () => {
    render(<ImageDropzone label="Capa" required />);

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should show upload icon and placeholder when no image', () => {
    render(<ImageDropzone label="Capa" />);

    expect(screen.getByText('Clique aqui')).toBeInTheDocument();
  });

  it('should show image preview when imageUrl is provided', () => {
    render(
      <ImageDropzone label="Capa" imageUrl="https://example.com/image.jpg" />
    );

    const img = screen.getByAltText('Preview da imagem');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('should show change text when image is displayed', () => {
    render(
      <ImageDropzone
        label="Capa"
        imageUrl="https://example.com/image.jpg"
        changeText="Clique para alterar"
      />
    );

    expect(screen.getByText('Clique para alterar')).toBeInTheDocument();
  });

  it('should call onFileSelect when file is selected', () => {
    const handleFileSelect = jest.fn();
    render(<ImageDropzone label="Capa" onFileSelect={handleFileSelect} />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(handleFileSelect).toHaveBeenCalledWith(file);
  });

  it('should not call onFileSelect when disabled', () => {
    const handleFileSelect = jest.fn();
    render(
      <ImageDropzone label="Capa" onFileSelect={handleFileSelect} disabled />
    );

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it('should call onSizeError when file exceeds maxSize', () => {
    const handleSizeError = jest.fn();
    render(
      <ImageDropzone
        label="Capa"
        maxSize={1000}
        onSizeError={handleSizeError}
      />
    );

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(['x'.repeat(2000)], 'large.png', {
      type: 'image/png',
    });

    fireEvent.change(input, { target: { files: [file] } });

    expect(handleSizeError).toHaveBeenCalledWith(file, 1000);
  });

  it('should call onTypeError when invalid file type is selected', () => {
    const handleTypeError = jest.fn();
    render(
      <ImageDropzone
        label="Capa"
        accept="image/*"
        onTypeError={handleTypeError}
      />
    );

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(handleTypeError).toHaveBeenCalledWith(file);
  });

  it('should handle drag and drop events', () => {
    render(<ImageDropzone label="Capa" />);

    const dropzone = screen.getByText('Clique aqui').closest('label');

    fireEvent.dragEnter(dropzone!);
    fireEvent.dragOver(dropzone!);
    fireEvent.dragLeave(dropzone!);
  });

  it('should show remove button when onRemoveFile is provided and image exists', () => {
    const handleRemove = jest.fn();
    render(
      <ImageDropzone
        label="Capa"
        imageUrl="https://example.com/image.jpg"
        onRemoveFile={handleRemove}
      />
    );

    const removeButton = screen.getByRole('button', { name: 'Remover imagem' });
    expect(removeButton).toBeInTheDocument();
  });

  it('should call onRemoveFile when remove button is clicked', () => {
    const handleRemove = jest.fn();
    render(
      <ImageDropzone
        label="Capa"
        imageUrl="https://example.com/image.jpg"
        onRemoveFile={handleRemove}
      />
    );

    const removeButton = screen.getByRole('button', { name: 'Remover imagem' });
    fireEvent.click(removeButton);

    expect(handleRemove).toHaveBeenCalled();
  });

  it('should not show remove button when disabled', () => {
    const handleRemove = jest.fn();
    render(
      <ImageDropzone
        label="Capa"
        imageUrl="https://example.com/image.jpg"
        onRemoveFile={handleRemove}
        disabled
      />
    );

    expect(
      screen.queryByRole('button', { name: 'Remover imagem' })
    ).not.toBeInTheDocument();
  });

  it('should not show remove button when onRemoveFile is not provided', () => {
    render(
      <ImageDropzone label="Capa" imageUrl="https://example.com/image.jpg" />
    );

    expect(
      screen.queryByRole('button', { name: 'Remover imagem' })
    ).not.toBeInTheDocument();
  });
});
