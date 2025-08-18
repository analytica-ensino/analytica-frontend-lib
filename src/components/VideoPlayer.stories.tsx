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
 * Video player with title and subtitle
 */
export const WithTitleAndSubtitle: Story = () => (
  <VideoPlayer
    src="https://www.w3schools.com/html/mov_bbb.mp4"
    poster="https://via.placeholder.com/800x450/2271C4/FFFFFF?text=Movimento+Uniforme"
    title="Movimento uniforme"
    subtitle="Função horária"
  />
);

/**
 * Video player with speed controls
 */
export const WithSpeedControls: Story = () => (
  <VideoPlayer
    src="https://www.w3schools.com/html/mov_bbb.mp4"
    poster="https://via.placeholder.com/800x450/2271C4/FFFFFF?text=Speed+Controls"
    title="Controle de velocidade"
    subtitle="Clique no menu de três pontos para alterar a velocidade"
  />
);

/**
 * Video player with initial time
 */
export const WithInitialTime: Story = () => (
  <VideoPlayer
    src="https://www.w3schools.com/html/mov_bbb.mp4"
    poster="https://via.placeholder.com/800x450/2271C4/FFFFFF?text=Start+at+5s"
    title="Vídeo com tempo inicial"
    subtitle="Este vídeo começa aos 5 segundos"
    initialTime={5}
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
 * Video player with localStorage disabled
 */
export const WithoutAutoSave: Story = () => (
  <VideoPlayer
    src="https://www.w3schools.com/html/mov_bbb.mp4"
    poster="https://via.placeholder.com/800x450/2271C4/FFFFFF?text=No+AutoSave"
    title="Sem salvamento automático"
    subtitle="O progresso não será salvo no localStorage"
    autoSave={false}
  />
);

/**
 * Video player with custom storage key
 */
export const WithCustomStorageKey: Story = () => (
  <VideoPlayer
    src="https://www.w3schools.com/html/mov_bbb.mp4"
    poster="https://via.placeholder.com/800x450/2271C4/FFFFFF?text=Custom+Storage"
    title="Chave personalizada"
    subtitle="Usa uma chave específica para salvar o progresso"
    storageKey="lesson-123-video"
  />
);

/**
 * Video player with custom className
 */
export const WithCustomClassName: Story = () => (
  <VideoPlayer
    src="https://www.w3schools.com/html/mov_bbb.mp4"
    poster="https://via.placeholder.com/800x450/2271C4/FFFFFF?text=Custom+Style"
    title="Estilo personalizado"
    subtitle="Com classe CSS customizada"
    className="max-w-4xl mx-auto shadow-2xl"
  />
);

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

/**
 * Multiple video players
 */
export const MultipleVideos: Story = () => (
  <div className="space-y-8">
    <VideoPlayer
      src="https://www.w3schools.com/html/mov_bbb.mp4"
      poster="https://via.placeholder.com/800x450/2271C4/FFFFFF?text=Video+1"
      title="Vídeo 1: Introdução"
      subtitle="Primeira parte da aula"
      storageKey="video-1"
    />
    <VideoPlayer
      src="https://www.w3schools.com/html/mov_bbb.mp4"
      poster="https://via.placeholder.com/800x450/10B981/FFFFFF?text=Video+2"
      title="Vídeo 2: Desenvolvimento"
      subtitle="Segunda parte da aula"
      storageKey="video-2"
    />
    <VideoPlayer
      src="https://www.w3schools.com/html/mov_bbb.mp4"
      poster="https://via.placeholder.com/800x450/EF4444/FFFFFF?text=Video+3"
      title="Vídeo 3: Conclusão"
      subtitle="Parte final da aula"
      storageKey="video-3"
    />
  </div>
);

/**
 * Video player simulating lesson progress integration
 */
export const LessonIntegration: Story = () => {
  const handleTimeUpdate = (seconds: number) => {
    // Convert seconds to minutes for backend
    const minutes = Math.floor(seconds / 60);
    console.log(`Time spent: ${minutes} minutes`);
  };

  const handleProgress = (percentage: number) => {
    console.log(`Lesson progress: ${percentage.toFixed(0)}%`);
  };

  const handleVideoComplete = () => {
    console.log('Mark video as watched in backend (video: true)');
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-bold text-blue-900 mb-2">Integração com Backend</h3>
        <p className="text-sm text-blue-700">
          Este exemplo simula a integração com o modelo de progresso de aulas do
          backend. Abra o console para ver os eventos que seriam enviados para a
          API.
        </p>
      </div>
      <VideoPlayer
        src="https://www.w3schools.com/html/mov_bbb.mp4"
        poster="https://via.placeholder.com/800x450/2271C4/FFFFFF?text=Lesson+Video"
        title="Física - Movimento Uniforme"
        subtitle="Aula 1: Introdução à cinemática"
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onVideoComplete={handleVideoComplete}
        storageKey="lesson-physics-001"
      />
    </div>
  );
};
