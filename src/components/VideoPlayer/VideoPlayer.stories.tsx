import { useState } from 'react';
import type { Story } from '@ladle/react';
import VideoPlayer from './VideoPlayer';

export default {
  title: 'VideoPlayer',
};

/**
 * Legenda de teste embutida como data URI — o player trata `data:` como válido
 * sem fetch, então as stories funcionam offline.
 */
const SAMPLE_SUBTITLES =
  'data:text/vtt;charset=utf-8,WEBVTT%0A%0A00%3A00%3A00.000%20--%3E%2000%3A00%3A05.000%0AEste%20é%20um%20exemplo%20de%20legenda%20de%20teste.%0A%0A00%3A00%3A05.000%20--%3E%2000%3A00%3A10.000%0AVocê%20pode%20ativar%20ou%20desativar%20as%20legendas%20clicando%20no%20ícone%20CC.%0A%0A00%3A00%3A10.000%20--%3E%2000%3A00%3A15.000%0AAs%20legendas%20ajudam%20na%20acessibilidade%20do%20conteúdo.%0A%0A00%3A00%3A15.000%20--%3E%2000%3A00%3A20.000%0AEste%20é%20o%20VideoPlayer%20da%20Analytica%20Frontend%20Lib.';

/**
 * Default video player with all controls
 */
export const Default: Story = () => (
  <VideoPlayer
    src="https://www.w3schools.com/html/mov_bbb.mp4"
    poster="https://via.placeholder.com/800x450/2271C4/FFFFFF?text=Video+Placeholder"
  />
);

/**
 * Video player with subtitles
 */
export const WithSubtitles: Story = () => (
  <VideoPlayer
    src="https://www.w3schools.com/html/mov_bbb.mp4"
    poster="https://via.placeholder.com/800x450/2271C4/FFFFFF?text=With+Subtitles"
    title="Vídeo com legendas"
    subtitle="Este vídeo possui legendas de teste - clique no ícone CC para ativar"
    subtitles={SAMPLE_SUBTITLES}
  />
);

/**
 * Video player with callbacks
 */
export const WithCallbacks: Story = () => {
  const handleTimeUpdate = (seconds: number) => {
    console.log(`Current time: ${seconds} seconds`);
  };

  const handleProgress = (percentage: number) => {
    console.log(`Progress: ${percentage.toFixed(2)}%`);
  };

  const handleVideoComplete = () => {
    console.log('Video completed (watched 95% or more)');
  };

  return (
    <VideoPlayer
      src="https://www.w3schools.com/html/mov_bbb.mp4"
      poster="https://via.placeholder.com/800x450/2271C4/FFFFFF?text=With+Callbacks"
      title="Vídeo com callbacks"
      subtitle="Abra o console para ver os eventos"
      onTimeUpdate={handleTimeUpdate}
      onProgress={handleProgress}
      onVideoComplete={handleVideoComplete}
    />
  );
};

/**
 * Video player in mobile view
 */
export const MobileView: Story = () => (
  <div className="max-w-sm mx-auto">
    <VideoPlayer
      src="https://www.w3schools.com/html/mov_bbb.mp4"
      poster="https://via.placeholder.com/400x225/2271C4/FFFFFF?text=Mobile+View"
      title="Visualização mobile"
      subtitle="Responsivo para telas pequenas"
      subtitles={SAMPLE_SUBTITLES}
    />
  </div>
);

/**
 * Vídeo de teste servido pelo próprio Ladle (`public/fixtures/video`, gerado
 * por `scripts/video-fixtures/generate.sh`): 10 s, HLS em 360p, 480p e 720p,
 * mais o MP4 de fallback. Caminhos relativos funcionam no `ladle serve` e no
 * Ladle publicado.
 */
const FIXTURE_MP4 = 'fixtures/video/sample.mp4';
const FIXTURE_HLS = 'fixtures/video/hls/master.m3u8';
const FIXTURE_CAPTIONS = 'fixtures/video/captions.vtt';
/** Stream de teste da conversão no CDN (60 s, 360p a 1080p). */
const CDN_TEST_HLS =
  'https://cdn.analyticaensino.com.br/hls/_test/ae-3284/master.m3u8';

/** Player HLS com o estado dos callbacks visível, como a página da aula usa. */
const HlsPlayerWithStatus = ({ hlsSrc }: Readonly<{ hlsSrc: string }>) => {
  const [seconds, setSeconds] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <VideoPlayer
        src={FIXTURE_MP4}
        hlsSrc={hlsSrc}
        subtitles={FIXTURE_CAPTIONS}
        title="Vídeo em HLS"
        subtitle="A engrenagem escolhe a qualidade; Automático é o padrão"
        onTimeUpdate={setSeconds}
        onProgress={setProgress}
        onVideoComplete={() => setCompleted(true)}
      />
      <p role="status" className="text-sm text-text-700">
        Tempo: {Math.floor(seconds)} s · Progresso: {Math.floor(progress)}% ·
        Concluído: {completed ? 'sim' : 'não'}
      </p>
    </div>
  );
};

/**
 * HLS com seletor de qualidade. Chrome e Firefox tocam via hls.js; Safari
 * (macOS e iOS) toca nativo. Se o HLS falhar, cai para o MP4 na mesma posição.
 */
export const Hls: Story = () => <HlsPlayerWithStatus hlsSrc={FIXTURE_HLS} />;

/**
 * Stream de teste real do CDN, para conferência manual em navegador e iPhone.
 */
export const HlsCdnTestStream: Story = () => (
  <HlsPlayerWithStatus hlsSrc={CDN_TEST_HLS} />
);
