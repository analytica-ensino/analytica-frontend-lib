import { RefObject, useEffect, useRef } from 'react';

export interface UseAudioSpectrumOptions {
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
   * enquanto `isActive`. **Escreva direto no DOM aqui** (via refs) para não
   * re-renderizar a 60fps.
   */
  onFrame: (values: number[]) => void;
}

/**
 * Liga um elemento `<audio>` a um `AnalyserNode` (Web Audio API) e emite, a cada
 * frame, o espectro de frequência agregado em `barCount` barras (valores 0..1).
 * Serve pra desenhar uma waveform/equalizador que reage ao áudio enquanto toca.
 *
 * O grafo (`AudioContext` → `MediaElementSource` → `Analyser` → destino) é criado
 * de forma preguiçosa quando `isActive` fica `true` e reconstruído se o elemento
 * `<audio>` mudar. É desligado ao desmontar.
 *
 * ⚠️ **CORS**: rotear o áudio pelo Web Audio faz um `src` de outra origem **sem
 * CORS ficar MUDO** (o navegador silencia por segurança, e o analyser lê zeros).
 * Pra cross-origin: servidor com CORS **e** `crossOrigin="anonymous"` no `<audio>`.
 * Áudio same-origin (blob/data URI — ex.: gravação do `getUserMedia`) funciona
 * sempre.
 *
 * ⚠️ Um elemento `<audio>` só pode virar `MediaElementSource` **uma vez**; por isso
 * o grafo é reconstruído por identidade do elemento e erros são silenciados.
 */
export function useAudioSpectrum(
  audioRef: RefObject<HTMLAudioElement | null>,
  isActive: boolean,
  {
    barCount,
    fftSize = 1024,
    smoothing = 0.8,
    gain = 1.6,
    onFrame,
  }: UseAudioSpectrumOptions
) {
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const builtForRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number | null>(null);

  // Mantém a última `onFrame` sem re-disparar o efeito (evita rebuild do grafo).
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    const audio = audioRef.current;

    const stopLoop = () => {
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };

    if (!audio || !isActive) {
      stopLoop();
      return;
    }

    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtor) return;

    // (Re)constrói o grafo se ainda não existe ou se o <audio> mudou de identidade.
    if (!contextRef.current || builtForRef.current !== audio) {
      try {
        contextRef.current?.close();
        const context = new AudioCtor();
        const source = context.createMediaElementSource(audio);
        const analyser = context.createAnalyser();
        analyser.fftSize = fftSize;
        analyser.smoothingTimeConstant = smoothing;
        source.connect(analyser);
        analyser.connect(context.destination);

        contextRef.current = context;
        sourceRef.current = source;
        analyserRef.current = analyser;
        builtForRef.current = audio;
      } catch {
        // Ex.: o elemento já foi usado por outro MediaElementSource. Sem waveform,
        // mas o áudio continua tocando normalmente.
        return;
      }
    }

    const context = contextRef.current;
    const analyser = analyserRef.current;
    if (!context || !analyser) return;

    // O AudioContext nasce suspenso até um gesto do usuário; o clique no play resolve.
    context.resume?.().catch(() => {});

    const bins = new Uint8Array(analyser.frequencyBinCount);
    const binCount = bins.length;

    // Bandas LOGARÍTMICAS: graves ocupam poucas barras e agudos, várias. Sem isso
    // (binning linear) toda a energia empilha nos graves e sobra "barra morta"
    // virando pontinho — o log espalha a energia e dá o formato de onda vertical.
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
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);

    return stopLoop;
  }, [isActive, audioRef, barCount, fftSize, smoothing, gain]);

  // Desliga o grafo ao desmontar.
  useEffect(() => {
    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
      contextRef.current?.close();
      contextRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
      builtForRef.current = null;
    };
  }, []);
}
