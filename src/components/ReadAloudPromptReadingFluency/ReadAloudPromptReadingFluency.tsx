import motionBird from '../../assets/gifs/motionMouthAndEyes.gif';
import { cn } from '../../utils/utils';
import Text from '../Text/Text';

export interface ReadAloudPromptReadingFluencyProps {
  /** Texto a ser lido em voz alta (renderizado em MAIÚSCULAS). */
  text: string;
  /** Rótulo acima do texto. Default: "Leia em voz alta:". */
  label?: string;
  /** Classes extras no container. */
  className?: string;
  /**
   * Fonte da imagem do passarinho. Default: o gif Reading Fluency empacotado na lib.
   * Passe uma URL pelo cliente caso o asset da lib não seja resolvido no bundle.
   */
  imageSrc?: string;
  /**
   * Exibe o balão de conversa (fundo, sombra e a cauda apontando pro passarinho).
   * Default: `true`. Com `false`, o rótulo + a caixa de leitura aparecem sem a
   * aparência de balão.
   */
  showBalloon?: boolean;
}

/**
 * Prompt Reading Fluency de "leia em voz alta": o passarinho animado ao lado de um card
 * com o rótulo e o texto a ser lido (via prop `text`), dentro de uma caixa de
 * borda verde. Puramente apresentacional. O balão de conversa (fundo + cauda)
 * pode ser desligado com `showBalloon={false}`.
 *
 * Obs.: o gif é 102×128 nativo e aqui aparece a 203×254 (~2× upscale) — pode
 * ficar suave/pixelado; trocável por um asset em maior resolução depois.
 */
export const ReadAloudPromptReadingFluency = ({
  text,
  label = 'Leia em voz alta:',
  className,
  imageSrc = motionBird,
  showBalloon = true,
}: ReadAloudPromptReadingFluencyProps) => (
  <div className={cn('font-quicksand flex items-center gap-6', className)}>
    <img
      src={imageSrc}
      alt="Reading Fluency"
      className="h-[254px] w-[203px] flex-shrink-0 select-none object-contain"
      draggable={false}
    />

    <div
      className={cn(
        'relative flex w-full min-w-0 max-w-[878px] flex-col gap-2',
        showBalloon &&
          'rounded-[20px] bg-background-100 p-4 [box-shadow:0px_8px_8px_-8px_#0000001a,0px_32px_64px_-8px_#00000033]'
      )}
    >
      {/* Cauda do balão apontando para o passarinho (à esquerda). */}
      {showBalloon && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-full top-1/2 -mr-0.5 size-4 -translate-y-1/2 bg-background-100 [clip-path:polygon(100%_0,100%_100%,0_50%)]"
        />
      )}

      <Text size='sm' className="font-semibold uppercase text-text-700">
        {label}
      </Text>

      <div className="flex flex-col gap-2 rounded-xl border border-secondary-500 p-4">
        <Text size='2xl' className="font-bold uppercase text-text-900">{text}</Text>
      </div>
    </div>
  </div>
);
ReadAloudPromptReadingFluency.displayName = 'ReadAloudPromptReadingFluency';
