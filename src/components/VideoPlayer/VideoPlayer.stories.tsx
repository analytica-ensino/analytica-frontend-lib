import type { Story } from '@ladle/react';
import VideoPlayer from './VideoPlayer';

export default {
  title: 'VideoPlayer',
};

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
    subtitles="data:text/vtt;charset=utf-8,WEBVTT%0A%0A00%3A00%3A00.000%20--%3E%2000%3A00%3A05.000%0AEste%20é%20um%20exemplo%20de%20legenda%20de%20teste.%0A%0A00%3A00%3A05.000%20--%3E%2000%3A00%3A10.000%0AVocê%20pode%20ativar%20ou%20desativar%20as%20legendas%20clicando%20no%20ícone%20CC.%0A%0A00%3A00%3A10.000%20--%3E%2000%3A00%3A15.000%0AAs%20legendas%20ajudam%20na%20acessibilidade%20do%20conteúdo.%0A%0A00%3A00%3A15.000%20--%3E%2000%3A00%3A20.000%0AEste%20é%20o%20VideoPlayer%20da%20Analytica%20Frontend%20Lib."
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
    />
  </div>
);
