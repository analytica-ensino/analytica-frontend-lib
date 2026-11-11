import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, CardProgress, Text } from '../../index';

/** Parâmetro inicial da AE-3296, ainda a validar. */
export const NEXT_LESSON_COUNTDOWN_SECONDS = 5;

export interface NextLessonCountdownProps {
  /** Título da próxima aula da fila. */
  readonly title: string;
  /** Frame inicial da próxima aula; sem ele, a imagem não aparece. */
  readonly imageUrl?: string;
  /** Ícone da matéria, exibido no card. */
  readonly icon: ReactNode;
  /** Cor de fundo do ícone (classe `bg-*` ou hex). */
  readonly color?: string;
  /** Progresso da próxima aula, de 0 a 100. */
  readonly progress?: number;
  /** Chamado uma vez: ao zerar a contagem ou em "Assistir agora". */
  readonly onComplete: () => void;
  /** Interrompe o avanço; a aula atual continua na tela, pausada. */
  readonly onCancel: () => void;
}

/**
 * Contagem sobre o player antes de avançar para a próxima aula da fila.
 */
export function NextLessonCountdown({
  title,
  imageUrl,
  icon,
  color,
  progress = 0,
  onComplete,
  onCancel,
}: NextLessonCountdownProps) {
  const [remaining, setRemaining] = useState(NEXT_LESSON_COUNTDOWN_SECONDS);
  const hasCompletedRef = useRef(false);

  // Lido por ref para que um novo render do pai não reinicie o segundo atual.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const complete = () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    onCompleteRef.current();
  };

  useEffect(() => {
    if (remaining === 0) {
      complete();
      return;
    }
    const timer = setTimeout(() => setRemaining(remaining - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center overflow-y-auto bg-black p-4">
      <div className="flex w-full max-w-sm flex-col gap-3">
        <Text size="md" weight="bold" color="text-white" aria-live="polite">
          Próxima aula em {remaining}s
        </Text>

        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            className="aspect-video w-full rounded-lg object-cover"
          />
        )}

        <CardProgress
          header={title}
          icon={icon}
          color={color}
          progress={progress}
          showDates={false}
          onClick={complete}
        />

        <div className="flex gap-3 border-t border-white/30 pt-3">
          <Button
            variant="outline"
            action="secondary"
            size="small"
            onClick={onCancel}
            className="!border-white !text-white hover:!bg-white/10"
          >
            Cancelar
          </Button>
          <Button
            variant="solid"
            action="primary"
            size="small"
            onClick={complete}
            className="flex-1"
          >
            Assistir agora
          </Button>
        </div>
      </div>
    </div>
  );
}
