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

/**
 * jsdom never loads images, so the natural-width measurement would sit on its
 * timeout in every test. This stub decides the outcome synchronously when the
 * dialog assigns `src`.
 */
let stubbedNaturalWidth: number | null = null;
/** When true the measurement stays pending until `settlePendingImages` runs. */
let deferImageLoad = false;
let pendingImages: { settle: () => void }[] = [];
const originalImage = globalThis.Image;

const settlePendingImages = () => {
  pendingImages.forEach((image) => image.settle());
  pendingImages = [];
};

beforeEach(() => {
  stubbedNaturalWidth = null;
  deferImageLoad = false;
  pendingImages = [];

  class FakeImage {
    naturalWidth = 0;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;

    private settleNow() {
      if (stubbedNaturalWidth === null) {
        this.onerror?.();
        return;
      }
      this.naturalWidth = stubbedNaturalWidth;
      this.onload?.();
    }

    set src(_value: string) {
      if (deferImageLoad) {
        pendingImages.push({ settle: () => this.settleNow() });
        return;
      }
      this.settleNow();
    }
  }
  globalThis.Image = FakeImage as unknown as typeof globalThis.Image;
});

afterEach(() => {
  globalThis.Image = originalImage;
});

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

    it('deve inserir a URL digitada', async () => {
      const { onInsert } = setup();

      fireEvent.change(
        screen.getByPlaceholderText('https://exemplo.com/imagem.png'),
        { target: { value: 'https://cdn.exemplo.com/foto.png' } }
      );
      fireEvent.click(screen.getByRole('button', { name: 'Inserir imagem' }));

      await waitFor(() =>
        expect(onInsert).toHaveBeenCalledWith(
          'https://cdn.exemplo.com/foto.png',
          '',
          undefined
        )
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
          '',
          undefined
        )
      );
      expect(onUploadImage).toHaveBeenCalledTimes(1);
    });

    it('deve limitar a largura na inserção quando a imagem é maior que o padrão', async () => {
      stubbedNaturalWidth = 1600;
      const onUploadImage = jest
        .fn()
        .mockResolvedValue('https://cdn.exemplo.com/enem.png');
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
          'https://cdn.exemplo.com/enem.png',
          '',
          640
        )
      );
    });

    it('não deve definir largura quando a imagem já cabe no padrão', async () => {
      stubbedNaturalWidth = 320;
      const onUploadImage = jest
        .fn()
        .mockResolvedValue('https://cdn.exemplo.com/pequena.png');
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
          'https://cdn.exemplo.com/pequena.png',
          '',
          undefined
        )
      );
    });

    it('deve inserir sem largura quando a medição falha', async () => {
      // stubbedNaturalWidth continua null: a imagem dispara onerror.
      const onUploadImage = jest
        .fn()
        .mockResolvedValue('https://cdn.exemplo.com/inacessivel.png');
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
          'https://cdn.exemplo.com/inacessivel.png',
          '',
          undefined
        )
      );
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

      expect(await screen.findByText('Falha na rede')).toBeInTheDocument();
      expect(onInsert).not.toHaveBeenCalled();
    });

    it('deve rejeitar arquivo acima de 5MB', async () => {
      const onUploadImage = jest.fn();
      setup({ onUploadImage });

      selectFile(imageFile('grande.png', MAX_IMAGE_SIZE + 1));

      expect(
        await screen.findByText('A imagem deve ter no máximo 5MB.')
      ).toBeInTheDocument();
      expect(onUploadImage).not.toHaveBeenCalled();
    });

    it('deve permitir alternar para o modo URL', async () => {
      const onUploadImage = jest.fn();
      const { onInsert } = setup({ onUploadImage });

      fireEvent.click(screen.getByRole('button', { name: /Usar URL/ }));
      fireEvent.change(
        screen.getByPlaceholderText('https://exemplo.com/imagem.png'),
        { target: { value: 'https://cdn.exemplo.com/url.png' } }
      );
      fireEvent.click(screen.getByRole('button', { name: 'Inserir imagem' }));

      await waitFor(() =>
        expect(onInsert).toHaveBeenCalledWith(
          'https://cdn.exemplo.com/url.png',
          '',
          undefined
        )
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
          'Gráfico de barras',
          undefined
        )
      );
    });
  });

  describe('interações auxiliares', () => {
    it('deve fechar e limpar o estado ao cancelar', () => {
      const onUploadImage = jest.fn();
      const { onClose } = setup({ onUploadImage });

      selectFile(imageFile());
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(onClose).toHaveBeenCalled();
    });

    it('deve rejeitar arquivo que não é imagem', async () => {
      const onUploadImage = jest.fn();
      setup({ onUploadImage });

      const naoImagem = new File(['x'], 'documento.pdf', {
        type: 'application/pdf',
      });
      selectFile(naoImagem);

      expect(
        await screen.findByText('Selecione um arquivo de imagem válido.')
      ).toBeInTheDocument();
      expect(onUploadImage).not.toHaveBeenCalled();
    });

    it('deve permitir voltar do modo URL para o modo arquivo', () => {
      const onUploadImage = jest.fn();
      setup({ onUploadImage });

      fireEvent.click(screen.getByRole('button', { name: /Usar URL/ }));
      expect(screen.getByText('URL da imagem')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Enviar arquivo/ }));

      expect(screen.queryByText('URL da imagem')).not.toBeInTheDocument();
      expect(document.querySelector('input[type="file"]')).toBeInTheDocument();
    });

    it('deve limpar o arquivo selecionado ao removê-lo', async () => {
      const onUploadImage = jest.fn();
      setup({ onUploadImage });

      selectFile(imageFile());
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Inserir imagem' })
        ).toBeEnabled()
      );

      const remover = screen.getByRole('button', { name: /remover/i });
      fireEvent.click(remover);

      expect(
        screen.getByRole('button', { name: 'Inserir imagem' })
      ).toBeDisabled();
    });
  });

  describe('cancelamento durante o upload', () => {
    it('não deve inserir a imagem se o diálogo for fechado antes do upload terminar', async () => {
      let resolveUpload: (url: string) => void = () => {};
      const onUploadImage = jest.fn(
        () =>
          new Promise<string>((resolve) => {
            resolveUpload = resolve;
          })
      );
      const { onInsert, onClose } = setup({ onUploadImage });

      selectFile(imageFile());
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Inserir imagem' })
        ).toBeEnabled()
      );
      fireEvent.click(screen.getByRole('button', { name: 'Inserir imagem' }));

      // O botão Cancelar fica desabilitado durante o upload, mas o Modal ainda
      // fecha no Escape — que é o caminho real do problema.
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();

      resolveUpload('https://cdn.exemplo.com/tardia.png');
      await waitFor(() => expect(onUploadImage).toHaveBeenCalled());

      expect(onInsert).not.toHaveBeenCalled();
    });

    it('não deve inserir a URL se o diálogo for fechado durante a medição', async () => {
      deferImageLoad = true;
      stubbedNaturalWidth = 1600;
      const { onInsert, onClose } = setup();

      fireEvent.change(
        screen.getByPlaceholderText('https://exemplo.com/imagem.png'),
        { target: { value: 'https://cdn.exemplo.com/lenta.png' } }
      );
      fireEvent.click(screen.getByRole('button', { name: 'Inserir imagem' }));

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();

      settlePendingImages();
      await waitFor(() => expect(onInsert).not.toHaveBeenCalled());
    });

    it('não deve inserir o upload se o diálogo for fechado durante a medição', async () => {
      deferImageLoad = true;
      stubbedNaturalWidth = 1600;
      const onUploadImage = jest
        .fn()
        .mockResolvedValue('https://cdn.exemplo.com/enviada.png');
      const { onInsert, onClose } = setup({ onUploadImage });

      selectFile(imageFile());
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Inserir imagem' })
        ).toBeEnabled()
      );
      fireEvent.click(screen.getByRole('button', { name: 'Inserir imagem' }));

      // Espera o upload resolver e a medição ficar pendente.
      await waitFor(() => expect(pendingImages).toHaveLength(1));

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();

      settlePendingImages();
      await waitFor(() => expect(onInsert).not.toHaveBeenCalled());
    });

    it('não deve exibir erro de upload após o fechamento', async () => {
      let rejectUpload: (e: Error) => void = () => {};
      const onUploadImage = jest.fn(
        () =>
          new Promise<string>((_, reject) => {
            rejectUpload = reject;
          })
      );
      setup({ onUploadImage });

      selectFile(imageFile());
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Inserir imagem' })
        ).toBeEnabled()
      );
      fireEvent.click(screen.getByRole('button', { name: 'Inserir imagem' }));
      fireEvent.keyDown(document, { key: 'Escape' });

      rejectUpload(new Error('Falha tardia'));
      await waitFor(() => expect(onUploadImage).toHaveBeenCalled());

      expect(screen.queryByText('Falha tardia')).not.toBeInTheDocument();
    });
  });
});
