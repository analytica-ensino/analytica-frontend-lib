import { useLayoutEffect, useState, type CSSProperties } from 'react';
import { useMediaPreferencesStore } from '../../../store/mediaPreferencesStore';

/** Abaixo de `lg` a lista já fica sob o player e o modo não se aplica. */
const CINEMA_MIN_WIDTH = 1024;
/** Altura do cabeçalho e do menu acima do `<main>` no `AppLayout`. */
const LAYOUT_OFFSET = '120px';

/**
 * Layout das páginas de aula com modo cinema.
 *
 * Muda só classes e estilo: mover o player na árvore do React remontaria o
 * `<video>` e reiniciaria a reprodução. A largura vem do `<main>` medido, e não
 * de `100vw`, que inclui a barra de rolagem e criaria rolagem horizontal.
 *
 * Layout provisório: aguarda a definição de UX/UI da AE-3309.
 *
 * @returns Estado do modo, classe da grade e estilo do quadro do player
 */
export const useLessonCinemaLayout = () => {
  const isCinemaMode = useMediaPreferencesStore((s) => s.cinemaMode);
  const setCinemaMode = useMediaPreferencesStore((s) => s.setCinemaMode);
  const [mainWidth, setMainWidth] = useState(0);

  useLayoutEffect(() => {
    if (!isCinemaMode) return;
    const main = document.querySelector('main');
    if (!main) return;

    const measure = () => setMainWidth(main.clientWidth);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(main);
    return () => observer.disconnect();
  }, [isCinemaMode]);

  const playerFrameStyle: CSSProperties | undefined =
    isCinemaMode && mainWidth >= CINEMA_MIN_WIDTH
      ? {
          width: mainWidth,
          marginLeft: `calc(50% - ${mainWidth / 2}px)`,
          height: `min(calc(100dvh - ${LAYOUT_OFFSET}), ${(mainWidth * 9) / 16}px)`,
        }
      : undefined;

  return {
    isCinemaMode,
    toggleCinemaMode: () => setCinemaMode(!isCinemaMode),
    gridClassName: isCinemaMode
      ? 'w-full h-full grid grid-cols-1 gap-3'
      : 'w-full h-full grid grid-cols-[1fr_430px] not-lg:grid-cols-1 gap-3',
    playerFrameStyle,
  };
};
