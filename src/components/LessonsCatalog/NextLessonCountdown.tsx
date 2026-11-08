import { useEffect, useRef, useState } from 'react';
import { Button, Text } from '../../index';

/** Parâmetro inicial da AE-3296, ainda a validar. */
export const NEXT_LESSON_COUNTDOWN_SECONDS = 5;

export interface NextLessonCountdownProps {
  /** Título da próxima aula da fila. */
  readonly title: string;
  /** Chamado uma vez, quando a contagem chega a zero. */
  readonly onComplete: () => void;
  /** Interrompe o avanço; a aula atual continua na tela. */
  readonly onCancel: () => void;
}

/**
 * Contagem sobre o player antes de avançar para a próxima aula da fila.
 *
 * Visual provisório: aguarda a definição de UX/UI da AE-3307.
 */
export function NextLessonCountdown({
  title,
  onComplete,
  onCancel,
}: NextLessonCountdownProps) {
  const [remaining, setRemaining] = useState(NEXT_LESSON_COUNTDOWN_SECONDS);

  // Lido por ref para que um novo render do pai não reinicie o segundo atual.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (remaining === 0) {
      onCompleteRef.current();
      return;
    }
    const timer = setTimeout(() => setRemaining(remaining - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/80 p-4 text-center">
      <Text size="sm" color="text-white" aria-live="polite">
        Próxima aula em {remaining}s
      </Text>
      <Text size="lg" weight="bold" color="text-white">
        {title}
      </Text>
      <Button variant="outline" action="primary" onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  );
}
