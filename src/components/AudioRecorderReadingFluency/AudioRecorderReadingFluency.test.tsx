import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AudioRecorderPapole } from './AudioRecorderPapole';

// jsdom não implementa getUserMedia / MediaRecorder / Web Audio — mockamos o
// mínimo pra exercitar o fluxo gravar → parar.

const trackStop = jest.fn();
const makeStream = () =>
  ({ getTracks: () => [{ stop: trackStop }] }) as unknown as MediaStream;

let getUserMedia: jest.Mock;

class MockAnalyser {
  fftSize = 1024;
  smoothingTimeConstant = 0.8;
  get frequencyBinCount() {
    return this.fftSize / 2;
  }
  connect = jest.fn();
  getByteFrequencyData = (arr: Uint8Array) => arr.fill(0);
}

class MockAudioContext {
  destination = {};
  state = 'running';
  createMediaStreamSource = jest.fn(() => ({ connect: jest.fn() }));
  createAnalyser = jest.fn(() => new MockAnalyser());
  resume = jest.fn(() => Promise.resolve());
  close = jest.fn(() => Promise.resolve());
}

class MockMediaRecorder {
  state = 'inactive';
  mimeType = 'audio/webm';
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  start = jest.fn(() => {
    this.state = 'recording';
  });
  stop = jest.fn(() => {
    this.state = 'inactive';
    this.ondataavailable?.({
      data: new Blob(['audio'], { type: 'audio/webm' }),
    });
    this.onstop?.();
  });
}

const originals = {
  AudioContext: window.AudioContext,
  raf: window.requestAnimationFrame,
  caf: window.cancelAnimationFrame,
  createObjectURL: URL.createObjectURL,
  mediaDevices: Object.getOwnPropertyDescriptor(navigator, 'mediaDevices'),
};

const setMediaDevices = (value: unknown) =>
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    writable: true,
    value,
  });

beforeEach(() => {
  trackStop.mockClear();
  getUserMedia = jest.fn(() => Promise.resolve(makeStream()));
  setMediaDevices({ getUserMedia });

  (window as unknown as { AudioContext: unknown }).AudioContext =
    MockAudioContext;
  (window as unknown as { MediaRecorder: unknown }).MediaRecorder =
    MockMediaRecorder;
  window.requestAnimationFrame = (() =>
    1) as typeof window.requestAnimationFrame;
  window.cancelAnimationFrame =
    (() => {}) as typeof window.cancelAnimationFrame;
  URL.createObjectURL = jest.fn(
    () => 'blob:mock-url'
  ) as typeof URL.createObjectURL;
});

afterEach(() => {
  window.AudioContext = originals.AudioContext;
  window.requestAnimationFrame = originals.raf;
  window.cancelAnimationFrame = originals.caf;
  URL.createObjectURL = originals.createObjectURL;
  if (originals.mediaDevices) {
    Object.defineProperty(navigator, 'mediaDevices', originals.mediaDevices);
  } else {
    setMediaDevices(undefined);
  }
});

it('renders the idle button and the equalizer bars', () => {
  const { container } = render(<AudioRecorderPapole barCount={13} />);

  expect(screen.getByRole('button', { name: /gravar/i })).toBeInTheDocument();
  expect(container.querySelectorAll('span.w-1\\.5')).toHaveLength(13);
});

it('starts recording on click: opens the mic, starts the recorder, flips the label', async () => {
  const onRecordingChange = jest.fn();
  render(<AudioRecorderPapole onRecordingChange={onRecordingChange} />);

  fireEvent.click(screen.getByRole('button', { name: /gravar/i }));

  expect(
    await screen.findByRole('button', { name: /parar/i })
  ).toBeInTheDocument();
  expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
  expect(onRecordingChange).toHaveBeenCalledWith(true);
});

it('stops recording: emits the blob, stops the mic and resets the label', async () => {
  const onRecordingComplete = jest.fn();
  const onRecordingChange = jest.fn();
  render(
    <AudioRecorderPapole
      onRecordingComplete={onRecordingComplete}
      onRecordingChange={onRecordingChange}
    />
  );

  fireEvent.click(screen.getByRole('button', { name: /gravar/i }));
  const stopButton = await screen.findByRole('button', { name: /parar/i });
  fireEvent.click(stopButton);

  expect(onRecordingComplete).toHaveBeenCalledTimes(1);
  const [blob, url] = onRecordingComplete.mock.calls[0];
  expect(blob).toBeInstanceOf(Blob);
  expect(url).toBe('blob:mock-url');
  expect(trackStop).toHaveBeenCalled();
  expect(onRecordingChange).toHaveBeenLastCalledWith(false);
  expect(
    await screen.findByRole('button', { name: /gravar/i })
  ).toBeInTheDocument();
});

it('reports an error and stays idle when the mic is denied', async () => {
  getUserMedia.mockRejectedValueOnce(new Error('NotAllowedError'));
  const onError = jest.fn();
  render(<AudioRecorderPapole onError={onError} />);

  fireEvent.click(screen.getByRole('button', { name: /gravar/i }));

  await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
  expect(screen.getByRole('button', { name: /gravar/i })).toBeInTheDocument();
});

it('reports an error when getUserMedia is unavailable', async () => {
  setMediaDevices(undefined);
  const onError = jest.fn();
  render(<AudioRecorderPapole onError={onError} />);

  fireEvent.click(screen.getByRole('button', { name: /gravar/i }));

  await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
});
