import { createManagedPageFlip } from './pageFlipLoop';

const render = jest.fn();
const destroy = jest.fn();
const on = jest.fn();
let frameRequestedWhileLoading: number | undefined;

jest.mock('page-flip', () => ({
  PageFlip: jest.fn().mockImplementation(() => ({
    on,
    // page-flip starts its own loop here; the reader must keep it from running.
    loadFromHTML: jest.fn(() => {
      frameRequestedWhileLoading = requestAnimationFrame(() => {
        throw new Error('the library loop must never run');
      });
    }),
    getRender: () => ({ render }),
    destroy,
  })),
}));

describe('createManagedPageFlip', () => {
  let frames: Parameters<typeof requestAnimationFrame>[0][];

  beforeEach(() => {
    jest.clearAllMocks();
    frames = [];
    jest
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((callback) => frames.push(callback));
    jest.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const create = () =>
    createManagedPageFlip(
      document.createElement('div'),
      [document.createElement('div')],
      { width: 300, height: 450 },
      (flip) => flip.on('init', () => {})
    );

  it('registers the listeners before the pages load', () => {
    create();

    expect(on).toHaveBeenCalledWith('init', expect.any(Function));
  });

  it('keeps the library loop from starting and runs its own', () => {
    create();

    expect(frameRequestedWhileLoading).toBe(0);
    expect(frames).toHaveLength(1);

    frames[0](16);
    expect(render).toHaveBeenCalledWith(16);
    expect(frames).toHaveLength(2);
  });

  it('stops drawing for good once destroyed', () => {
    const managed = create();

    managed.destroy();
    frames[0](16);

    expect(destroy).toHaveBeenCalled();
    expect(cancelAnimationFrame).toHaveBeenCalled();
    expect(render).not.toHaveBeenCalled();
    expect(frames).toHaveLength(1);
  });
});
