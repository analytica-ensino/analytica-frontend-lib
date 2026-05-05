import AccessibilityFab, {
  type AccessibilityFabPosition,
} from './AccessibilityFab';
import AccessibilityPanel from './AccessibilityPanel';
import ReadingAid from './ReadingAid';
import ColorBlindFilters from './ColorBlindFilters';
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
}: Readonly<AccessibilityWidgetProps>) {
  useA11yPreferences();
  useA11yKeyboardShortcut();

  const isPanelOpen = useAccessibilityStore((s) => s.isPanelOpen);
  const togglePanel = useAccessibilityStore((s) => s.togglePanel);
  const closePanel = useAccessibilityStore((s) => s.closePanel);

  return (
    <>
      {!isPanelOpen && (
        <AccessibilityFab
          onClick={togglePanel}
          isOpen={isPanelOpen}
          position={position}
          className={fabClassName}
        />
      )}
      <AccessibilityPanel
        isOpen={isPanelOpen}
        onClose={closePanel}
        position={position}
        className={panelClassName}
      />
      <ReadingAid />
      <ColorBlindFilters />
    </>
  );
}
