import {
  createPastedImageHandler,
  extractPastedImageFiles,
  namePastedImage,
} from './pastedImage';

const fakeFile = (name: string, type: string) =>
  new File(['x'], name, { type });

const clipboardWith = (files: File[]) => ({ files }) as unknown as DataTransfer;

describe('extractPastedImageFiles', () => {
  it('deve devolver os arquivos de imagem do clipboard', () => {
    const print = fakeFile('image.png', 'image/png');

    expect(extractPastedImageFiles(clipboardWith([print]))).toEqual([print]);
  });

  it('deve ignorar arquivos que não são imagem', () => {
    const planilha = fakeFile('notas.csv', 'text/csv');

    expect(extractPastedImageFiles(clipboardWith([planilha]))).toEqual([]);
  });

  it('deve devolver vazio quando o clipboard não tem arquivos', () => {
    expect(extractPastedImageFiles(null)).toEqual([]);
    expect(extractPastedImageFiles(clipboardWith([]))).toEqual([]);
  });
});

describe('namePastedImage', () => {
  it('deve manter o arquivo quando ele já tem nome', () => {
    const print = fakeFile('image.png', 'image/png');

    expect(namePastedImage(print)).toBe(print);
  });

  it('deve nomear o arquivo sem nome usando a extensão do tipo MIME', () => {
    const semNome = fakeFile('', 'image/jpeg');

    const named = namePastedImage(semNome);

    expect(named.name).toBe('imagem-colada.jpg');
    expect(named.type).toBe('image/jpeg');
  });

  it('deve usar png quando o tipo MIME é desconhecido', () => {
    const semNome = fakeFile('', 'image/vnd.qualquer');

    expect(namePastedImage(semNome).name).toBe('imagem-colada.png');
  });
});

describe('createPastedImageHandler', () => {
  const handlerWith = (overrides = {}) => {
    const onImages = jest.fn();
    const onOversized = jest.fn();
    const handler = createPastedImageHandler({
      enabled: true,
      upload: jest.fn(),
      onImages,
      onOversized,
      ...overrides,
    });
    return { handler, onImages, onOversized };
  };

  it('não deve assumir a colagem quando o evento não traz clipboardData', () => {
    const { handler, onImages } = handlerWith();

    const handled = handler({
      clipboardData: null,
      preventDefault: jest.fn(),
    } as unknown as ClipboardEvent);

    expect(handled).toBe(false);
    expect(onImages).not.toHaveBeenCalled();
  });
});
