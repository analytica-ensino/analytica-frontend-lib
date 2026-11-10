import { useEffect, useState } from 'react';
import type { Story } from '@ladle/react';
import { LessonVideoSection } from './LessonMediaSections';
import { useModulesStore } from '../../../store/modulesStore';
import { DEFAULT_MODULES } from '../../../types/modulesConfig';

export default {
  title: 'LessonMediaSections',
};

/**
 * Vídeo de teste servido pelo próprio Ladle (`public/fixtures/video`): 10 s,
 * HLS em 360p, 480p e 720p, mais o MP4 — que é o `urlVideo` da aula e o
 * fallback do HLS.
 */
const FIXTURE_MP4 = 'fixtures/video/sample.mp4';
const FIXTURE_HLS = 'fixtures/video/hls/master.m3u8';

/** Player da aula como as páginas montam, sem guardar posição. */
const LessonVideo = ({ hlsSrc }: Readonly<{ hlsSrc: string | null }>) => (
  <div className="max-w-3xl">
    <LessonVideoSection
      video={{ src: FIXTURE_MP4, hlsSrc }}
      persistProgress={false}
      className="w-full rounded-xl"
    />
  </div>
);

/**
 * Aula convertida (`urlVideoHls` preenchido): toca o HLS, com o seletor de
 * qualidade em Automático.
 */
export const VideoHls: Story = () => <LessonVideo hlsSrc={FIXTURE_HLS} />;

/**
 * Aula ainda não convertida (`urlVideoHls: null`): toca o MP4, sem seletor,
 * exatamente como antes do HLS.
 */
export const VideoMp4: Story = () => <LessonVideo hlsSrc={null} />;

/**
 * Aula convertida numa instituição com `MODULES.lessonVideoMp4Only` ligado (a
 * volta ao MP4 sem deploy): toca o MP4, sem seletor.
 */
export const VideoHlsComVoltaAoMp4: Story = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    useModulesStore.setState({
      modules: { ...DEFAULT_MODULES, lessonVideoMp4Only: true },
    });
    setReady(true);
    return () => {
      useModulesStore.setState({ modules: DEFAULT_MODULES });
    };
  }, []);

  return ready ? <LessonVideo hlsSrc={FIXTURE_HLS} /> : null;
};

/**
 * Aula convertida com a volta ao MP4 trocada com a página aberta, como quando a
 * revalidação de `/me/modules` traz `lessonVideoMp4Only` diferente do que
 * estava salvo: o botão liga e desliga a chave no store de módulos.
 */
export const VideoHlsComTrocaDaChave: Story = () => {
  const mp4Only = useModulesStore(
    (state) => state.modules.lessonVideoMp4Only === true
  );

  useEffect(
    () => () => {
      useModulesStore.setState({ modules: DEFAULT_MODULES });
    },
    []
  );

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        className="self-start rounded border px-3 py-1"
        onClick={() =>
          useModulesStore.setState((state) => ({
            modules: { ...state.modules, lessonVideoMp4Only: !mp4Only },
          }))
        }
      >
        {mp4Only ? 'Desligar volta ao MP4' : 'Ligar volta ao MP4'}
      </button>
      <LessonVideo hlsSrc={FIXTURE_HLS} />
    </div>
  );
};
