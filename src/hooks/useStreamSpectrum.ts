import { useEffect, useRef } from 'react';

export interface UseStreamSpectrumOptions {
  /** Número de barras (bins de frequência agregados). */
  barCount: number;
  /** Tamanho da FFT (potência de 2 entre 32 e 32768). Default: 1024. */
  fftSize?: number;
  /** Suavização temporal do analyser (0..1). Maior = mais suave. Default: 0.8. */
  smoothing?: number;
  /** Ganho aplicado às amplitudes antes de normalizar (0..1). Default: 1.6. */
  gain?: number;
  /**
   * Chamado a cada frame (rAF) com as amplitudes normalizadas (0..1) por barra
   * enquanto `active`. **Escreva direto no DOM aqui** (via refs) para não
   * re-renderizar a 60fps.
   */
  onFrame: (values: number[]) => void;
}

/**
 * Liga um `MediaStream` ao vivo (ex.: microfone via `getUserMedia`) a um
 * `AnalyserNode` (Web Audio) e emite, a cada frame, o espectro agregado em
 * `barCount` barras (valores 0..1). É a versão "ao vivo" do `useAudioSpectrum`
 * (que analisa um `<audio>`): a fonte aqui é `createMediaStreamSource`.
 *
 * ⚠️ Diferente do `useAudioSpectrum`, o analyser **não** é conectado ao
 * `destination` — senão o navegador tocaria o próprio microfone de volta (eco).
 *
 * O grafo é criado enquanto houver `stream` e `active` for `true`, e é desligado
 * (analyser desconectado + `AudioContext` fechado) ao parar/desmontar.
 */
export function useStreamSpectrum(
  stream: MediaStream | null,
  active: boolean,
  {
    barCount,
    fftSize = 1024,
    smoothing = 0.8,
    gain = 1.6,
    onFrame,
  }: UseStreamSpectrumOptions
) {
  // Mantém a última `onFrame` sem re-disparar o efeito (evita rebuild do grafo).
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    if (!stream || !active) return;

    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtor) return;

    let frame: number | null = null;
    let context: AudioContext | null = null;

    try {
      context = new AudioCtor();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = smoothing;
      source.connect(analyser);
      // Sem `analyser.connect(context.destination)`: não queremos ouvir o mic.

      // O AudioContext pode nascer suspenso; resume é resolvido pelo gesto do clique.
      context.resume?.().catch(() => {});

      const bins = new Uint8Array(analyser.frequencyBinCount);
      const binCount = bins.length;

      // Bandas LOGARÍTMICAS (mesma lógica do `useAudioSpectrum`): graves ocupam
      // poucas barras e agudos, várias — espalha a energia numa onda vertical.
      const minBin = 1; // pula o DC (bin 0)
      const edges = new Array<number>(barCount + 1);
      for (let i = 0; i <= barCount; i += 1) {
        edges[i] = Math.min(
          binCount,
          Math.max(
            minBin,
            Math.round(minBin * Math.pow(binCount / minBin, i / barCount))
          )
        );
      }

      const values = new Array<number>(barCount).fill(0);

      const tick = () => {
        analyser.getByteFrequencyData(bins);
        for (let i = 0; i < barCount; i += 1) {
          const lo = edges[i];
          const hi = Math.max(lo + 1, edges[i + 1]);
          let sum = 0;
          for (let b = lo; b < hi; b += 1) {
            sum += bins[b] ?? 0;
          }
          const avg = sum / (hi - lo) / 255;
          values[i] = Math.min(1, avg * gain);
        }
        onFrameRef.current(values);
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    } catch {
      // Sem visualização (ex.: Web Audio indisponível) — a gravação segue.
    }

    return () => {
      if (frame != null) cancelAnimationFrame(frame);
      if (context) {
        context.close().catch(() => {});
      }
    };
  }, [stream, active, barCount, fftSize, smoothing, gain]);
}
