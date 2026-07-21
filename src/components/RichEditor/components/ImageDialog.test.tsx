import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ImageDialog, MAX_IMAGE_SIZE } from './ImageDialog';

const setup = (props: Partial<Parameters<typeof ImageDialog>[0]> = {}) => {
  const onInsert = jest.fn();
  const onClose = jest.fn();
  render(<ImageDialog open onClose={onClose} onInsert={onInsert} {...props} />);
  return { onInsert, onClose };
};

const selectFile = (file: File) => {
  const input = document.querySelector(
    'input[type="file"]'
  ) as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
};

const imageFile = (name = 'foto.png', size = 1024) => {
  const file = new File(['x'], name, { type: 'image/png' });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('ImageDialog', () => {
  it('deve expor o limite de 5MB alinhado ao backend', () => {
    expect(MAX_IMAGE_SIZE).toBe(5 * 1024 * 1024);
  });

  describe('sem onUploadImage', () => {
    it('deve mostrar apenas o modo URL', () => {
      setup();

      expect(screen.getByText('URL da imagem')).toBeInTheDocument();
      expect(screen.queryByText('Enviar arquivo')).not.toBeInTheDocument();
    });

    it('deve inserir a URL digitada', () => {
      const { onInsert } = setup();

      fireEvent.change(
        screen.getByPlaceholderText('https://exemplo.com/imagem.png'),
        { target: { value: 'https://cdn.exemplo.com/foto.png' } }
      );
      fireEvent.click(screen.getByRole('button', { name: 'Inserir imagem' }));

      expect(onInsert).toHaveBeenCalledWith(
        'https://cdn.exemplo.com/foto.png',
        ''
      );
    });

    it('não deve inserir quando a URL está vazia', () => {
      const { onInsert } = setup();

      fireEvent.click(screen.getByRole('button', { name: 'Inserir imagem' }));

      expect(onInsert).not.toHaveBeenCalled();
    });
  });

  describe('com onUploadImage', () => {
    it('deve fazer upload e inserir a URL pública retornada', async () => {
      const onUploadImage = jest
        .fn()
        .mockResolvedValue('https://cdn.exemplo.com/enviada.png');
      const { onInsert } = setup({ onUploadImage });

      selectFile(imageFile());
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Inserir imagem' })
        ).toBeEnabled()
      );
      fireEvent.click(screen.getByRole('button', { name: 'Inserir imagem' }));

      await waitFor(() =>
        expect(onInsert).toHaveBeenCalledWith(
          'https://cdn.exemplo.com/enviada.png',
          ''
        )
      );
      expect(onUploadImage).toHaveBeenCalledTimes(1);
    });

    it('deve exibir erro e não inserir quando o upload falha', async () => {
      const onUploadImage = jest
        .fn()
        .mockRejectedValue(new Error('Falha na rede'));
      const { onInsert } = setup({ onUploadImage });

      selectFile(imageFile());
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Inserir imagem' })
        ).toBeEnabled()
      );
      fireEvent.click(screen.getByRole('button', { name: 'Inserir imagem' }));

      await waitFor(() =>
        expect(screen.getByText('Falha na rede')).toBeInTheDocument()
      );
      expect(onInsert).not.toHaveBeenCalled();
    });

    it('deve rejeitar arquivo acima de 5MB', async () => {
      const onUploadImage = jest.fn();
      setup({ onUploadImage });

      selectFile(imageFile('grande.png', MAX_IMAGE_SIZE + 1));

      await waitFor(() =>
        expect(
          screen.getByText('A imagem deve ter no máximo 5MB.')
        ).toBeInTheDocument()
      );
      expect(onUploadImage).not.toHaveBeenCalled();
    });

    it('deve permitir alternar para o modo URL', () => {
      const onUploadImage = jest.fn();
      const { onInsert } = setup({ onUploadImage });

      fireEvent.click(screen.getByRole('button', { name: /Usar URL/ }));
      fireEvent.change(
        screen.getByPlaceholderText('https://exemplo.com/imagem.png'),
        { target: { value: 'https://cdn.exemplo.com/url.png' } }
      );
      fireEvent.click(screen.getByRole('button', { name: 'Inserir imagem' }));

      expect(onInsert).toHaveBeenCalledWith(
        'https://cdn.exemplo.com/url.png',
        ''
      );
      expect(onUploadImage).not.toHaveBeenCalled();
    });

    it('deve enviar o texto alternativo informado', async () => {
      const onUploadImage = jest
        .fn()
        .mockResolvedValue('https://cdn.exemplo.com/enviada.png');
      const { onInsert } = setup({ onUploadImage });

      selectFile(imageFile());
      fireEvent.change(
        screen.getByPlaceholderText('Descreva a imagem para leitores de tela'),
        { target: { value: 'Gráfico de barras' } }
      );
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Inserir imagem' })
        ).toBeEnabled()
      );
      fireEvent.click(screen.getByRole('button', { name: 'Inserir imagem' }));

      await waitFor(() =>
        expect(onInsert).toHaveBeenCalledWith(
          'https://cdn.exemplo.com/enviada.png',
          'Gráfico de barras'
        )
      );
    });
  });
});
