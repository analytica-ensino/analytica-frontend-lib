import { RefObject } from 'react';
import { renderHook, act } from '@testing-library/react';
import { useAudioSpectrum } from './useAudioSpectrum';

// jsdom não implementa a Web Audio API nem controla o rAF — mockamos os dois.

const createSourceSpy = jest.fn();
const sourceConnectSpy = jest.fn();
const analyserConnectSpy = jest.fn();
const resumeSpy = jest.fn();
const closeSpy = jest.fn();

let binFillValue = 0;
let throwOnCreateSource = false;
let lastAnalyser: MockAnalyser | null = null;

class MockAnalyser {
  fftSize = 2048;
  smoothingTimeConstant = 0.8;
  connect = analyserConnectSpy;
  get frequencyBinCount() {
    return this.fftSize / 2;
  }
  getByteFrequencyData = (arr: Uint8Array) => arr.fill(binFillValue);
}

class MockAudioContext {
  destination = { __isDestination: true };
  state = 'suspended';
  createMediaElementSource(el: HTMLMediaElement) {
    createSourceSpy(el);
    if (throwOnCreateSource) throw new Error('element already consumed');
    return { connect: sourceConnectSpy };
  }
  createAnalyser() {
    lastAnalyser = new MockAnalyser();
    return lastAnalyser;
  }
  resume() {
    resumeSpy();
    return Promise.resolve();
  }
  close() {
    closeSpy();
    return Promise.resolve();
  }
}

// rAF controlável: guarda callbacks por id e permite disparar um frame.
type RafCb = (time: number) => void;
let rafId = 0;
const rafMap = new Map<number, RafCb>();
const cancelSpy = jest.fn();
const flushFrame = () => {
  const cbs = [...rafMap.values()];
  rafMap.clear();
  act(() => cbs.forEach((cb) => cb(0)));
};

const originals = {
  AudioContext: window.AudioContext,
  webkit: (window as unknown as { webkitAudioContext?: unknown })
    .webkitAudioContext,
  raf: window.requestAnimationFrame,
  caf: window.cancelAnimationFrame,
};

const audioRefTo = (audio: HTMLAudioElement | null) =>
  ({ current: audio }) as RefObject<HTMLAudioElement | null>;

const makeAudio = () => document.createElement('audio');

beforeEach(() => {
  createSourceSpy.mockClear();
  sourceConnectSpy.mockClear();
  analyserConnectSpy.mockClear();
  resumeSpy.mockClear();
  closeSpy.mockClear();
  cancelSpy.mockClear();
  binFillValue = 0;
  throwOnCreateSource = false;
  lastAnalyser = null;
  rafId = 0;
  rafMap.clear();

  (window as unknown as { AudioContext: unknown }).AudioContext =
    MockAudioContext;
  (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext =
    MockAudioContext;
  window.requestAnimationFrame = ((cb: RafCb) => {
    rafId += 1;
    rafMap.set(rafId, cb);
    return rafId;
  }) as typeof window.requestAnimationFrame;
  window.cancelAnimationFrame = ((id: number) => {
    cancelSpy(id);
    rafMap.delete(id);
  }) as typeof window.cancelAnimationFrame;
});

afterEach(() => {
  window.AudioContext = originals.AudioContext;
  (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext =
    originals.webkit;
  window.requestAnimationFrame = originals.raf;
  window.cancelAnimationFrame = originals.caf;
});

it('does not build the graph while inactive', () => {
  const onFrame = jest.fn();
  renderHook(() =>
    useAudioSpectrum(audioRefTo(makeAudio()), false, { barCount: 8, onFrame })
  );

  expect(createSourceSpy).not.toHaveBeenCalled();
  flushFrame();
  expect(onFrame).not.toHaveBeenCalled();
});

it('does nothing when the audio element is missing', () => {
  const onFrame = jest.fn();
  renderHook(() =>
    useAudioSpectrum(audioRefTo(null), true, { barCount: 8, onFrame })
  );

  expect(createSourceSpy).not.toHaveBeenCalled();
});

it('builds the Web Audio graph and drives onFrame when active', () => {
  const audio = makeAudio();
  const onFrame = jest.fn();

  renderHook(() =>
    useAudioSpectrum(audioRefTo(audio), true, {
      barCount: 8,
      fftSize: 512,
      smoothing: 0.5,
      onFrame,
    })
  );

  // Grafo: source(elemento) → analyser → destino, com fftSize/smoothing aplicados.
  expect(createSourceSpy).toHaveBeenCalledWith(audio);
  expect(lastAnalyser?.fftSize).toBe(512);
  expect(lastAnalyser?.smoothingTimeConstant).toBe(0.5);
  expect(sourceConnectSpy).toHaveBeenCalledWith(lastAnalyser);
  expect(analyserConnectSpy).toHaveBeenCalledWith(
    expect.objectContaining({ __isDestination: true })
  );
  expect(resumeSpy).toHaveBeenCalled();

  flushFrame();
  expect(onFrame).toHaveBeenCalledTimes(1);
  const values = onFrame.mock.calls[0][0] as number[];
  expect(values).toHaveLength(8);
  expect(values.every((v) => v >= 0 && v <= 1)).toBe(true);
});

it('normalizes and clamps amplitudes to 0..1 (gain applied)', () => {
  binFillValue = 255; // energia máxima em todos os bins
  const onFrame = jest.fn();
  renderHook(() =>
    useAudioSpectrum(audioRefTo(makeAudio()), true, {
      barCount: 6,
      gain: 1.6,
      onFrame,
    })
  );

  flushFrame();
  const values = onFrame.mock.calls[0][0] as number[];
  // 255/255 * 1.6 = 1.6 → clampado em 1.
  expect(values).toEqual([1, 1, 1, 1, 1, 1]);
});

it('emits zeros when there is no signal', () => {
  binFillValue = 0;
  const onFrame = jest.fn();
  renderHook(() =>
    useAudioSpectrum(audioRefTo(makeAudio()), true, { barCount: 5, onFrame })
  );

  flushFrame();
  expect(onFrame.mock.calls[0][0]).toEqual([0, 0, 0, 0, 0]);
});

it('stops the animation loop when isActive turns false', () => {
  const audio = makeAudio();
  const onFrame = jest.fn();
  const { rerender } = renderHook(
    ({ active }) =>
      useAudioSpectrum(audioRefTo(audio), active, { barCount: 8, onFrame }),
    { initialProps: { active: true } }
  );

  expect(rafMap.size).toBe(1); // um frame agendado

  rerender({ active: false });
  expect(cancelSpy).toHaveBeenCalled();

  onFrame.mockClear();
  flushFrame();
  expect(onFrame).not.toHaveBeenCalled();
});

it('rebuilds the graph (closing the old context) when the audio element changes', () => {
  const first = makeAudio();
  const second = makeAudio();
  const onFrame = jest.fn();

  const { rerender } = renderHook(
    ({ audio }) =>
      useAudioSpectrum(audioRefTo(audio), true, { barCount: 8, onFrame }),
    { initialProps: { audio: first } }
  );

  expect(createSourceSpy).toHaveBeenCalledTimes(1);

  rerender({ audio: second });

  expect(createSourceSpy).toHaveBeenCalledTimes(2);
  expect(createSourceSpy).toHaveBeenLastCalledWith(second);
  expect(closeSpy).toHaveBeenCalled(); // contexto anterior fechado
});

it('does not rebuild the graph when only onFrame changes (uses the latest)', () => {
  const audio = makeAudio();
  const first = jest.fn();
  const second = jest.fn();

  const { rerender } = renderHook(
    ({ onFrame }) =>
      useAudioSpectrum(audioRefTo(audio), true, { barCount: 8, onFrame }),
    { initialProps: { onFrame: first } }
  );

  expect(createSourceSpy).toHaveBeenCalledTimes(1);

  rerender({ onFrame: second });
  // Sem rebuild do grafo…
  expect(createSourceSpy).toHaveBeenCalledTimes(1);

  flushFrame();
  // …mas o frame usa a onFrame mais recente.
  expect(second).toHaveBeenCalledTimes(1);
  expect(first).not.toHaveBeenCalled();
});

it('silences errors from createMediaElementSource (element already consumed)', () => {
  throwOnCreateSource = true;
  const onFrame = jest.fn();

  expect(() =>
    renderHook(() =>
      useAudioSpectrum(audioRefTo(makeAudio()), true, { barCount: 8, onFrame })
    )
  ).not.toThrow();

  flushFrame();
  expect(onFrame).not.toHaveBeenCalled();
});

it('no-ops when the Web Audio API is unavailable', () => {
  (window as unknown as { AudioContext?: unknown }).AudioContext = undefined;
  (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext =
    undefined;
  const onFrame = jest.fn();

  expect(() =>
    renderHook(() =>
      useAudioSpectrum(audioRefTo(makeAudio()), true, { barCount: 8, onFrame })
    )
  ).not.toThrow();
  expect(createSourceSpy).not.toHaveBeenCalled();
});

it('closes the AudioContext on unmount', () => {
  const { unmount } = renderHook(() =>
    useAudioSpectrum(audioRefTo(makeAudio()), true, {
      barCount: 8,
      onFrame: jest.fn(),
    })
  );

  expect(closeSpy).not.toHaveBeenCalled();
  unmount();
  expect(closeSpy).toHaveBeenCalled();
});
