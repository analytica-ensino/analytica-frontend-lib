import type { Story } from '@ladle/react';
import { useState } from 'react';
import { AudioRecorderPapole } from './AudioRecorderPapole';

/**
 * Gravador ao vivo: clique em "Gravar", fale, e as barras acompanham o
 * microfone. Requer permissão de microfone do navegador.
 */
export const Recorder: Story = () => (
  <div
    data-theme="papole-light"
    className="flex min-h-[280px] items-center justify-center bg-[#CBC7F2] p-8"
  >
    <AudioRecorderPapole showTime />
  </div>
);

/**
 * Grava e, ao parar, toca de volta o áudio capturado (via `onRecordingComplete`).
 */
export const RecorderComPlayback: Story = () => {
  const [url, setUrl] = useState<string>();

  return (
    <div
      data-theme="papole-light"
      className="flex min-h-[280px] flex-col items-center justify-center gap-6 bg-[#CBC7F2] p-8"
    >
      <AudioRecorderPapole
        showTime
        onRecordingComplete={(_blob, recordedUrl) => setUrl(recordedUrl)}
      />
      {url && (
        <audio src={url} controls>
          <track kind="captions" />
        </audio>
      )}
    </div>
  );
};
