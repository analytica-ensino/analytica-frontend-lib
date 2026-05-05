import { useEffect, useState } from 'react';
import { useAccessibilityStore } from '../../store/accessibilityStore';

const RULER_HEIGHT_PX = 32;
const MASK_GAP_PX = 80; // metade da altura da janela visível

/**
 * Renderiza auxiliares de leitura (régua ou máscara) que acompanham
 * a posição vertical do mouse. Só monta listener de `mousemove` quando
 * algum auxiliar está ativo, para não pagar custo quando desligado.
 */
export default function ReadingAid() {
  const readingAid = useAccessibilityStore((s) => s.readingAid);
  const [mouseY, setMouseY] = useState<number | null>(null);

  useEffect(() => {
    if (readingAid === 'none') {
      setMouseY(null);
      return;
    }

    let frame = 0;
    const handleMouseMove = (event: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setMouseY(event.clientY));
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [readingAid]);

  if (readingAid === 'none' || mouseY === null) return null;

  if (readingAid === 'ruler') {
    return (
      <div
        aria-hidden="true"
        data-testid="a11y-reading-ruler"
        className="a11y-widget-shield pointer-events-none fixed left-0 right-0 z-30"
        style={{
          top: mouseY - RULER_HEIGHT_PX / 2,
          height: RULER_HEIGHT_PX,
          background: 'rgba(255, 235, 59, 0.25)',
          borderTop: '2px solid #facc15',
          borderBottom: '2px solid #facc15',
        }}
      />
    );
  }

  // Máscara: dois retângulos escurecendo acima e abaixo do cursor
  return (
    <>
      <div
        aria-hidden="true"
        data-testid="a11y-reading-mask-top"
        className="a11y-widget-shield pointer-events-none fixed left-0 right-0 top-0 z-30 bg-black/65"
        style={{ height: Math.max(0, mouseY - MASK_GAP_PX) }}
      />
      <div
        aria-hidden="true"
        data-testid="a11y-reading-mask-bottom"
        className="a11y-widget-shield pointer-events-none fixed left-0 right-0 bottom-0 z-30 bg-black/65"
        style={{ top: mouseY + MASK_GAP_PX }}
      />
    </>
  );
}
