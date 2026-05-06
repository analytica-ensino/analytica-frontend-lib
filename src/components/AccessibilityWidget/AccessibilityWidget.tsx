import AccessibilityFab, {
  type AccessibilityFabPosition,
} from './AccessibilityFab';
import AccessibilityPanel from './AccessibilityPanel';
import LibrasFab from './LibrasFab';
import ReadingAid from './ReadingAid';
import ColorBlindFilters from './ColorBlindFilters';
import TTSController from './TTSController';
import VLibrasLoader from './VLibrasLoader';
import { useAccessibilityStore } from '../../store/accessibilityStore';
import { useA11yPreferences } from '../../hooks/useA11yPreferences';
import { useA11yKeyboardShortcut } from '../../hooks/useA11yKeyboardShortcut';
import './accessibility.css';

export interface AccessibilityWidgetProps {
  /** Lado da viewport onde o botão fica colado (default: 'right') */
  position?: AccessibilityFabPosition;
  /** Classes extras para o botão flutuante */
  fabClassName?: string;
  /** Classes extras para o painel */
  panelClassName?: string;
  /**
   * Mostra o botão de Libras empilhado abaixo do botão de
   * acessibilidade (default: true). Plataformas que já injetam o
   * VLibras de forma própria podem desabilitar passando `false`.
   */
  showLibras?: boolean;
}

/**
 * Widget de acessibilidade — botão flutuante que abre um painel
 * com controles de contraste, fonte, espaçamento e outras
 * preferências visuais. As preferências são persistidas em
 * localStorage e aplicadas via classes no `<html>`.
 *
 * Renderize uma única instância no shell da aplicação. Tudo fica
 * dentro de `.a11y-widget-root` para que o próprio widget não
 * sofra com os filtros que aplica na página.
 *
 * @example
 * ```tsx
 * <AccessibilityWidget position="left" />
 * ```
 */
export default function AccessibilityWidget({
  position = 'right',
  fabClassName,
  panelClassName,
  showLibras = true,
}: Readonly<AccessibilityWidgetProps>) {
  useA11yPreferences();
  useA11yKeyboardShortcut();

  const isPanelOpen = useAccessibilityStore((s) => s.isPanelOpen);
  const togglePanel = useAccessibilityStore((s) => s.togglePanel);
  const closePanel = useAccessibilityStore((s) => s.closePanel);
  const librasEnabled = useAccessibilityStore((s) => s.librasEnabled);
  const setLibrasEnabled = useAccessibilityStore((s) => s.setLibrasEnabled);

  // Quando o Libras é exibido, os dois FABs ficam empilhados
  // (acessibilidade acima do meio, libras abaixo). Sem Libras,
  // o de acessibilidade ocupa o centro como antes.
  const accessibilityVerticalAlign = showLibras ? 'above-center' : 'center';

  /**
   * Clique no FAB de Libras:
   * - Primeira vez (não ativado): ativa o widget VLibras (que se
   *   auto-abre no painel pela primeira vez).
   * - Demais vezes: dispara o click no botão de acesso nativo do
   *   VLibras, que abre/fecha o painel sem precisar reinjetar o widget.
   *   Isso evita o ciclo de remoção/reinjeção que deixava o VLibras
   *   em estado inconsistente após fechá-lo.
   */
  const handleLibrasClick = () => {
    if (!librasEnabled) {
      setLibrasEnabled(true);
      return;
    }
    document.querySelector<HTMLElement>('[vw-access-button]')?.click();
  };

  return (
    <>
      {!isPanelOpen && (
        <AccessibilityFab
          onClick={togglePanel}
          isOpen={isPanelOpen}
          position={position}
          verticalAlign={accessibilityVerticalAlign}
          className={fabClassName}
        />
      )}
      {!isPanelOpen && showLibras && (
        <LibrasFab onClick={handleLibrasClick} position={position} />
      )}
      <AccessibilityPanel
        isOpen={isPanelOpen}
        onClose={closePanel}
        position={position}
        className={panelClassName}
      />
      <ReadingAid />
      <ColorBlindFilters />
      <TTSController />
      {showLibras && <VLibrasLoader />}
    </>
  );
}
