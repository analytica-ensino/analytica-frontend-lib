import {
  DEFAULT_MAX_INSERT_WIDTH,
  MIN_IMAGE_HEIGHT,
  MIN_IMAGE_WIDTH,
  measureNaturalWidth,
  parseImageWidth,
} from './imageSize';

const imageWith = (attributes: Record<string, string>): HTMLElement => {
  const element = document.createElement('img');
  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });
  return element;
};

describe('constantes de tamanho', () => {
  it('deve manter o piso de altura menor que o de largura', () => {
    // Banners largos e baixos precisam encolher sem esbarrar na altura mínima.
    expect(MIN_IMAGE_HEIGHT).toBeLessThan(MIN_IMAGE_WIDTH);
  });

  it('deve limitar a inserção a uma largura maior que o mínimo', () => {
    expect(DEFAULT_MAX_INSERT_WIDTH).toBeGreaterThan(MIN_IMAGE_WIDTH);
  });
});

describe('parseImageWidth', () => {
  it('deve ler a largura do atributo width', () => {
    expect(parseImageWidth(imageWith({ width: '400' }))).toBe(400);
  });

  it('deve aceitar o atributo width com unidade px', () => {
    expect(parseImageWidth(imageWith({ width: '400px' }))).toBe(400);
  });

  it('deve arredondar largura fracionada', () => {
    expect(parseImageWidth(imageWith({ width: '399.6px' }))).toBe(400);
  });

  it('deve recusar largura percentual', () => {
    expect(parseImageWidth(imageWith({ width: '50%' }))).toBeNull();
  });

  it('deve recusar largura em unidade não suportada', () => {
    expect(parseImageWidth(imageWith({ width: '20em' }))).toBeNull();
  });

  it('deve recusar largura zero ou negativa', () => {
    expect(parseImageWidth(imageWith({ width: '0' }))).toBeNull();
    expect(parseImageWidth(imageWith({ width: '-100' }))).toBeNull();
  });

  it('deve recusar valor inválido', () => {
    expect(parseImageWidth(imageWith({ width: 'auto' }))).toBeNull();
  });

  it('deve retornar null quando não há largura nenhuma', () => {
    expect(parseImageWidth(imageWith({}))).toBeNull();
  });

  it('deve ler a largura do style inline como fallback', () => {
    expect(parseImageWidth(imageWith({ style: 'width: 320px' }))).toBe(320);
  });

  it('deve ler a largura do style mesmo com outras propriedades antes', () => {
    expect(
      parseImageWidth(imageWith({ style: 'display:block; width:250px;' }))
    ).toBe(250);
  });

  it('deve ignorar max-width no style inline', () => {
    expect(
      parseImageWidth(imageWith({ style: 'max-width: 320px' }))
    ).toBeNull();
  });

  it('deve ignorar largura percentual no style inline', () => {
    expect(parseImageWidth(imageWith({ style: 'width: 50%' }))).toBeNull();
  });

  it('deve priorizar o atributo width sobre o style inline', () => {
    expect(
      parseImageWidth(imageWith({ width: '400', style: 'width: 320px' }))
    ).toBe(400);
  });
});

describe('measureNaturalWidth', () => {
  type FakeImage = {
    src: string;
    naturalWidth: number;
    onload: (() => void) | null;
    onerror: (() => void) | null;
  };

  let instances: FakeImage[] = [];
  const originalImage = globalThis.Image;

  /**
   * Replaces the global Image constructor with a fake whose load result the
   * test drives by hand.
   * @param naturalWidth - Width the fake image reports once loaded
   */
  const stubImage = (naturalWidth = 0) => {
    instances = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).Image = function FakeImageConstructor(this: FakeImage) {
      this.src = '';
      this.naturalWidth = naturalWidth;
      this.onload = null;
      this.onerror = null;
      instances.push(this);
    };
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    globalThis.Image = originalImage;
  });

  it('deve resolver com a largura natural quando a imagem carrega', async () => {
    stubImage(1600);
    const promise = measureNaturalWidth('https://cdn.exemplo.com/foto.png');

    instances[0].onload?.();

    await expect(promise).resolves.toBe(1600);
  });

  it('deve atribuir o src recebido à imagem medida', async () => {
    stubImage(800);
    const promise = measureNaturalWidth('https://cdn.exemplo.com/foto.png');

    expect(instances[0].src).toBe('https://cdn.exemplo.com/foto.png');

    instances[0].onload?.();
    await promise;
  });

  it('deve resolver null quando a imagem falha ao carregar', async () => {
    stubImage(1600);
    const promise = measureNaturalWidth('https://cdn.exemplo.com/quebrada.png');

    instances[0].onerror?.();

    await expect(promise).resolves.toBeNull();
  });

  it('deve resolver null quando a largura natural é zero', async () => {
    stubImage(0);
    const promise = measureNaturalWidth('https://cdn.exemplo.com/foto.png');

    instances[0].onload?.();

    await expect(promise).resolves.toBeNull();
  });

  it('deve resolver null quando estoura o tempo limite', async () => {
    stubImage(1600);
    const promise = measureNaturalWidth('https://cdn.exemplo.com/lenta.png');

    jest.advanceTimersByTime(3000);

    await expect(promise).resolves.toBeNull();
  });

  it('deve ignorar carregamento tardio após o tempo limite', async () => {
    stubImage(1600);
    const promise = measureNaturalWidth('https://cdn.exemplo.com/lenta.png');

    jest.advanceTimersByTime(3000);
    instances[0].onload?.();

    await expect(promise).resolves.toBeNull();
  });

  it('deve respeitar um tempo limite customizado', async () => {
    stubImage(1600);
    const promise = measureNaturalWidth(
      'https://cdn.exemplo.com/foto.png',
      100
    );

    jest.advanceTimersByTime(100);

    await expect(promise).resolves.toBeNull();
  });

  it('deve resolver null quando o src é vazio', async () => {
    stubImage(1600);

    await expect(measureNaturalWidth('')).resolves.toBeNull();
    expect(instances).toHaveLength(0);
  });

  it('deve resolver null quando o ambiente não tem Image', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).Image = undefined;

    await expect(
      measureNaturalWidth('https://cdn.exemplo.com/foto.png')
    ).resolves.toBeNull();
  });
});
