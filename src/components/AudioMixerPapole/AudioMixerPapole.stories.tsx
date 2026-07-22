import type { Story } from '@ladle/react';
import { useMemo } from 'react';
import { AudioMixerPapole } from './AudioMixerPapole';

// Áudio SAME-ORIGIN embutido (data URI WAV) só pra demo: um áudio externo sem
// CORS ficaria mudo ao passar pelo Web Audio. Aqui toca e as barras reagem.
function makePapoleDemoAudio(): string {
  const sampleRate = 22050;
  const duration = 10; // segundos
  const total = sampleRate * duration;
  const buffer = new Uint8Array(44 + total * 2);
  const view = new DataView(buffer.buffer);

  const writeString = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };

  // Cabeçalho WAV (PCM 16-bit mono)
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + total * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, total * 2, true);

  // Acordes + harmônicos + envelope: espalha o espectro entre as barras.
  const chords = [
    [261.63, 329.63, 392.0], // C
    [392.0, 493.88, 587.33], // G
    [220.0, 261.63, 329.63], // Am
    [349.23, 440.0, 523.25], // F
  ];
  const chordDur = 0.7;
  for (let i = 0; i < total; i += 1) {
    const t = i / sampleRate;
    const chord = chords[Math.floor(t / chordDur) % chords.length];
    const local = (t % chordDur) / chordDur;
    const env = Math.sin(Math.PI * local); // sobe e desce (evita cliques)
    let sample = 0;
    for (const freq of chord) {
      sample +=
        Math.sin(2 * Math.PI * freq * t) +
        0.4 * Math.sin(2 * Math.PI * 2 * freq * t) +
        0.2 * Math.sin(2 * Math.PI * 3 * freq * t);
    }
    sample = (sample / chord.length) * env * 0.18;
    view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, sample)) * 0x7fff, true);
  }

  // Base64 (em blocos, pra não estourar o stack)
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < buffer.length; i += chunkSize) {
    binary += String.fromCharCode(...buffer.subarray(i, i + chunkSize));
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

/**
 * O áudio já vem embutido (como viria do backend/consumidor) e toca sozinho —
 * sem upload nem botão. As barras reagem ao áudio; o tempo sobe do 00:00:00.
 *
 * Obs.: navegadores exigem UM gesto na página antes de liberar áudio; o
 * `autoPlay` do componente cobre isso (começa no 1º clique/tecla, sem botão).
 */
export const AudioMixer: Story = () => {
  const demoSrc = useMemo(() => makePapoleDemoAudio(), []);

  return (
    <div
      data-theme="papole-light"
      className="flex min-h-[420px] items-center justify-center bg-secondary-100 p-6"
    >
      <div className="rounded-2xl bg-background px-6 py-4 shadow-hard-shadow-2">
        <AudioMixerPapole src={demoSrc} autoPlay loop showTime />
      </div>
    </div>
  );
};
