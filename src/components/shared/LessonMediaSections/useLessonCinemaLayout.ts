import { useLayoutEffect, useState, type CSSProperties } from 'react';
import { useMediaPreferencesStore } from '../../../store/mediaPreferencesStore';

/** Abaixo de `lg` a lista já fica sob o player e o modo não se aplica. */
const CINEMA_MIN_WIDTH = 1024;
/**
 * Espaço acima do player: cabeçalho e menu do `AppLayout` (120px) mais a
 * faixa do título da aula (~80px). Sem descontar a faixa, os controles do
 * vídeo saíam da tela.
 */
const PLAYER_TOP_OFFSET = '200px';

/**
 * Layout das páginas de aula com modo cinema (Figma da AE-3309).
 *
 * No modo cinema, a faixa do título e o player ocupam a largura toda; abaixo,
 * o conteúdo da aula fica na coluna esquerda e a lista de aulas na direita.
 *
 * A página monta sempre a mesma árvore:
 *
 * ```
 * grid (gridClassName)
 * ├─ section (mainClassName)
 * │  ├─ div (stageClassName + stageStyle): faixa do título e player
 * │  │  └─ quadro do player (playerFrameStyle)
 * │  └─ div (contentClassName): podcast, questionário, quadros
 * └─ section (listClassName): lista de aulas
 * ```
 *
 * Muda só classes e estilo: mover o player na árvore do React remontaria o
 * `<video>` e reiniciaria a reprodução. No modo cinema a `section` principal
 * vira `display: contents`, e seus filhos passam a ser itens da grade. A
 * largura vem do `<main>` medido, e não de `100vw`, que inclui a barra de
 * rolagem e criaria rolagem horizontal.
 *
 * @returns Estado do modo e as classes e estilos de cada parte do layout
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

  const isActive = isCinemaMode && mainWidth >= CINEMA_MIN_WIDTH;

  return {
    isCinemaMode,
    toggleCinemaMode: () => setCinemaMode(!isCinemaMode),
    gridClassName:
      'w-full h-full grid grid-cols-[1fr_430px] not-lg:grid-cols-1 gap-3',
    mainClassName: isActive ? 'contents' : undefined,
    stageClassName: isActive ? 'col-span-full' : undefined,
    stageStyle: isActive
      ? ({
          width: mainWidth,
          marginLeft: `calc(50% - ${mainWidth / 2}px)`,
        } satisfies CSSProperties)
      : undefined,
    // Fixa a lista na coluna direita mesmo quando a página não tem conteúdo
    // abaixo do player.
    listClassName: isActive ? 'col-start-2' : undefined,
    contentClassName: isActive
      ? 'bg-background rounded-xl pb-2 self-start'
      : undefined,
    playerFrameStyle: isActive
      ? ({
          height: `min(calc(100dvh - ${PLAYER_TOP_OFFSET}), ${(mainWidth * 9) / 16}px)`,
          backgroundColor: 'black',
        } satisfies CSSProperties)
      : undefined,
  };
};
