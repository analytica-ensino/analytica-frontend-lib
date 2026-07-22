import motionBird from '../../assets/gifs/Motion mouth and eyes.gif';
import { cn } from '../../utils/utils';

export interface ReadAloudPromptPapoleProps {
  /** Texto a ser lido em voz alta (renderizado em MAIÚSCULAS). */
  text: string;
  /** Rótulo acima do texto. Default: "Leia em voz alta:". */
  label?: string;
  /** Classes extras no container. */
  className?: string;
}

/**
 * Prompt Papolê de "leia em voz alta": o passarinho animado ao lado de um card
 * com o rótulo e o texto a ser lido (via prop `text`), dentro de uma caixa de
 * borda verde. Puramente apresentacional.
 *
 * Obs.: o gif é 102×128 nativo e aqui aparece a 203×254 (~2× upscale) — pode
 * ficar suave/pixelado; trocável por um asset em maior resolução depois.
 */
export const ReadAloudPromptPapole = ({
  text,
  label = 'Leia em voz alta:',
  className,
}: ReadAloudPromptPapoleProps) => (
  <div className={cn('font-quicksand flex items-center gap-6', className)}>
    <img
      src={motionBird}
      alt="Papolê"
      className="h-[254px] w-[203px] flex-shrink-0 select-none object-contain"
      draggable={false}
    />

    <div className="relative flex w-full min-w-0 max-w-[878px] flex-col gap-2 rounded-[20px] bg-background-100 p-4 [box-shadow:0px_8px_8px_-8px_#0000001a,0px_32px_64px_-8px_#00000033]">
      {/* Cauda do balão apontando para o passarinho (à esquerda). */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-full top-1/2 -mr-0.5 size-4 -translate-y-1/2 bg-background-100 [clip-path:polygon(100%_0,100%_100%,0_50%)]"
      />

      <span className="text-[14px] font-semibold uppercase text-text-700">
        {label}
      </span>

      <div className="flex flex-col gap-2 rounded-[12px] border border-secondary-500 p-4">
        <p className="text-[24px] font-bold uppercase text-text-900">{text}</p>
      </div>
    </div>
  </div>
);
ReadAloudPromptPapole.displayName = 'ReadAloudPromptPapole';
