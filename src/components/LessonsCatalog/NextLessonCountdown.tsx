import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, Text } from '../../index';

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
  /** Linha de contexto acima do título, como "Matéria • Subtema". */
  readonly subtitle?: string;
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
  subtitle,
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
    <div className="absolute inset-0 z-10 flex items-center justify-center overflow-y-auto bg-neutral-900 p-4">
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

        {/* Mesmo bloco do card "Continuar aula" do painel. */}
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-white ${color?.startsWith('bg-') ? color : ''}`}
            style={
              color && !color.startsWith('bg-')
                ? { backgroundColor: color }
                : undefined
            }
          >
            {icon}
          </span>
          <span className="flex min-w-0 flex-col gap-1">
            {subtitle && (
              <Text size="2xs" color="text-white/70" className="truncate">
                {subtitle}
              </Text>
            )}
            <Text
              size="xs"
              weight="bold"
              color="text-white"
              className="truncate"
            >
              {title}
            </Text>
          </span>
        </div>

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
