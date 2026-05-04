import { useEffect } from 'react';
import {
  useAccessibilityStore,
  type AccessibilityPreferences,
  type ContrastMode,
  type SaturationMode,
  type SpacingLevel,
} from '../store/accessibilityStore';

/**
 * Mapeia cada preferência para a classe que deve ser aplicada no
 * `documentElement`. Valores no estado padrão (`normal` ou 0) não
 * adicionam classe alguma — assim a página fica intacta quando o
 * usuário não ativou nada.
 */
type ClassMap = Partial<Record<keyof AccessibilityPreferences, string>>;

const CONTRAST_CLASS: Record<ContrastMode, string | null> = {
  normal: null,
  high: 'a11y-contrast-high',
  inverted: 'a11y-contrast-inverted',
};

const SATURATION_CLASS: Record<SaturationMode, string | null> = {
  normal: null,
  grayscale: 'a11y-saturation-grayscale',
  low: 'a11y-saturation-low',
};

const LEVEL_PREFIX: Record<
  'fontSize' | 'letterSpacing' | 'lineSpacing',
  string
> = {
  fontSize: 'a11y-font-',
  letterSpacing: 'a11y-letter-spacing-',
  lineSpacing: 'a11y-line-spacing-',
};

/** Lista de todas as classes que o widget pode aplicar — usada para limpar */
const ALL_A11Y_CLASSES: readonly string[] = [
  'a11y-contrast-high',
  'a11y-contrast-inverted',
  'a11y-saturation-grayscale',
  'a11y-saturation-low',
  'a11y-font-1',
  'a11y-font-2',
  'a11y-font-3',
  'a11y-letter-spacing-1',
  'a11y-letter-spacing-2',
  'a11y-letter-spacing-3',
  'a11y-line-spacing-1',
  'a11y-line-spacing-2',
  'a11y-line-spacing-3',
  'a11y-highlight-links',
  'a11y-no-animations',
  'a11y-big-cursor',
];

const buildLevelClass = (
  prefix: string,
  level: SpacingLevel
): string | null => {
  if (level === 0) return null;
  return `${prefix}${level}`;
};

const buildClassMap = (prefs: AccessibilityPreferences): ClassMap => ({
  contrastMode: CONTRAST_CLASS[prefs.contrastMode] ?? undefined,
  saturationMode: SATURATION_CLASS[prefs.saturationMode] ?? undefined,
  fontSize: buildLevelClass(LEVEL_PREFIX.fontSize, prefs.fontSize) ?? undefined,
  letterSpacing:
    buildLevelClass(LEVEL_PREFIX.letterSpacing, prefs.letterSpacing) ??
    undefined,
  lineSpacing:
    buildLevelClass(LEVEL_PREFIX.lineSpacing, prefs.lineSpacing) ?? undefined,
  highlightLinks: prefs.highlightLinks ? 'a11y-highlight-links' : undefined,
  pauseAnimations: prefs.pauseAnimations ? 'a11y-no-animations' : undefined,
  bigCursor: prefs.bigCursor ? 'a11y-big-cursor' : undefined,
});

/**
 * Aplica/remove as classes de acessibilidade no `documentElement`
 * conforme as preferências atuais. Limpa tudo antes de aplicar para
 * garantir um estado consistente mesmo se prefs forem alteradas
 * fora do fluxo normal.
 */
const syncDom = (prefs: AccessibilityPreferences) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  ALL_A11Y_CLASSES.forEach((cls) => root.classList.remove(cls));

  const classMap = buildClassMap(prefs);
  Object.values(classMap).forEach((cls) => {
    if (cls) root.classList.add(cls);
  });
};

/**
 * Hook que sincroniza o store de acessibilidade com o DOM.
 *
 * Deve ser chamado uma vez no nível raiz da aplicação (o
 * componente `AccessibilityWidget` já faz isso). Cada vez que
 * uma preferência muda, as classes correspondentes são aplicadas
 * no `<html>`, sem `!important` no nível do hook — a especificidade
 * é controlada pelo CSS.
 */
export const useA11yPreferences = () => {
  const contrastMode = useAccessibilityStore((s) => s.contrastMode);
  const saturationMode = useAccessibilityStore((s) => s.saturationMode);
  const fontSize = useAccessibilityStore((s) => s.fontSize);
  const letterSpacing = useAccessibilityStore((s) => s.letterSpacing);
  const lineSpacing = useAccessibilityStore((s) => s.lineSpacing);
  const highlightLinks = useAccessibilityStore((s) => s.highlightLinks);
  const pauseAnimations = useAccessibilityStore((s) => s.pauseAnimations);
  const bigCursor = useAccessibilityStore((s) => s.bigCursor);

  useEffect(() => {
    syncDom({
      contrastMode,
      saturationMode,
      fontSize,
      letterSpacing,
      lineSpacing,
      highlightLinks,
      pauseAnimations,
      bigCursor,
    });
  }, [
    contrastMode,
    saturationMode,
    fontSize,
    letterSpacing,
    lineSpacing,
    highlightLinks,
    pauseAnimations,
    bigCursor,
  ]);
};

export const __testing = {
  buildClassMap,
  syncDom,
  ALL_A11Y_CLASSES,
};
