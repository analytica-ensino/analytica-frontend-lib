import { useEffect, useRef, type ReactNode } from 'react';
import {
  ArrowCounterClockwiseIcon,
  XIcon,
  TextAaIcon,
  TextTIcon,
  CursorIcon,
  CircleHalfIcon,
  DropIcon,
  BookOpenTextIcon,
  KeyboardIcon,
  PaletteIcon,
} from '@phosphor-icons/react';
import Text from '../Text/Text';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import { cn } from '../../utils/utils';
import {
  useAccessibilityStore,
  ColorBlindMode,
  type ContrastMode,
  type SaturationMode,
  type ReadingAid,
} from '../../store/accessibilityStore';
import type { AccessibilityFabPosition } from './AccessibilityFab';

const CONTRAST_OPTIONS: { value: ContrastMode; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Alto' },
  { value: 'inverted', label: 'Invertido' },
];

const SATURATION_OPTIONS: { value: SaturationMode; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Baixa' },
  { value: 'grayscale', label: 'Tons de cinza' },
];

const READING_AID_OPTIONS: { value: ReadingAid; label: string }[] = [
  { value: 'none', label: 'Nenhum' },
  { value: 'ruler', label: 'Régua' },
  { value: 'mask', label: 'Máscara' },
];

const COLOR_BLIND_OPTIONS: { value: ColorBlindMode; label: string }[] = [
  { value: ColorBlindMode.None, label: 'Nenhum' },
  { value: ColorBlindMode.Protanopia, label: 'Protanopia' },
  { value: ColorBlindMode.Deuteranopia, label: 'Deuteranopia' },
  { value: ColorBlindMode.Tritanopia, label: 'Tritanopia' },
];

const LEVEL_LABELS = ['Padrão', 'Pequeno', 'Médio', 'Grande'] as const;

/**
 * `<dialog open>` aplica `left: 0; right: 0` como user-agent style. Sem
 * resetar o lado oposto para `auto`, o painel acaba grudando no lado
 * errado mesmo com `right-6` ou `left-6` aplicado.
 */
const PANEL_EDGE_CLASSES: Record<AccessibilityFabPosition, string> = {
  right: 'right-6 left-auto',
  left: 'left-6 right-auto',
};

interface SectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

const Section = ({ title, icon, children }: Readonly<SectionProps>) => (
  <section className="flex flex-col gap-2 border-b border-background-200 px-4 py-3 last:border-b-0">
    <header className="flex items-center gap-2">
      <span className="text-text-700" aria-hidden="true">
        {icon}
      </span>
      <Text size="sm" weight="semibold" className="text-text-900">
        {title}
      </Text>
    </header>
    {children}
  </section>
);

interface SegmentedProps<T extends string | number> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  ariaLabel: string;
}

const Segmented = <T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
}: Readonly<SegmentedProps<T>>) => (
  <div
    role="radiogroup"
    aria-label={ariaLabel}
    className="flex flex-wrap gap-1 rounded-lg bg-background-100 p-1"
  >
    {options.map((opt) => {
      const isActive = opt.value === value;
      return (
        <button
          key={String(opt.value)}
          type="button"
          role="radio"
          aria-checked={isActive}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium',
            'transition-all duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-info-500',
            isActive
              ? 'bg-white text-text-900 shadow-sm hover:bg-background-50'
              : 'text-text-700 hover:bg-white/70 hover:text-text-900 hover:shadow-sm'
          )}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
  testId?: string;
}

const ToggleRow = ({
  label,
  description,
  checked,
  onChange,
  testId,
}: Readonly<ToggleRowProps>) => (
  <div
    role="switch"
    tabIndex={0}
    aria-checked={checked}
    aria-label={label}
    className={cn(
      '-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-1.5',
      'cursor-pointer transition-colors duration-150 hover:bg-background-100',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-info-500'
    )}
    onClick={onChange}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onChange();
      }
    }}
  >
    <div className="flex flex-col">
      <Text size="sm" className="text-text-900">
        {label}
      </Text>
      {description && (
        <Text size="2xs" className="text-text-600">
          {description}
        </Text>
      )}
    </div>
    <ToggleSwitch
      checked={checked}
      onChange={() => undefined}
      checkedColor="bg-info-600"
      data-testid={testId}
      tabIndex={-1}
      aria-hidden
    />
  </div>
);

export interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Lado da viewport onde o painel aparece (default: 'right') */
  position?: AccessibilityFabPosition;
  className?: string;
}

/**
 * Painel lateral com todos os controles de acessibilidade. As
 * preferências são lidas/escritas no `useAccessibilityStore`. O
 * próprio painel fica dentro do wrapper `.a11y-widget-root`, então
 * filtros aplicados no `<html>` (alto contraste, etc.) não afetam
 * sua legibilidade.
 */
export default function AccessibilityPanel({
  isOpen,
  onClose,
  position = 'right',
  className,
}: Readonly<AccessibilityPanelProps>) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<Element | null>(null);

  const {
    contrastMode,
    saturationMode,
    fontSize,
    letterSpacing,
    lineSpacing,
    highlightLinks,
    pauseAnimations,
    bigCursor,
    dyslexiaFont,
    readingAid,
    keyboardShortcut,
    colorBlindMode,
    setContrastMode,
    setSaturationMode,
    setFontSize,
    setLetterSpacing,
    setLineSpacing,
    setHighlightLinks,
    setPauseAnimations,
    setBigCursor,
    setDyslexiaFont,
    setReadingAid,
    setKeyboardShortcut,
    setColorBlindMode,
    resetPreferences,
  } = useAccessibilityStore();

  // Foco e Escape: ao abrir, lembra o elemento anteriormente focado,
  // move o foco para o botão de fechar e escuta a tecla Esc. Restaura
  // o foco anterior ao fechar.
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocusedRef.current = document.activeElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    globalThis.addEventListener('keydown', handleKeyDown);

    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown);
      const previous = previouslyFocusedRef.current as HTMLElement | null;
      if (previous && typeof previous.focus === 'function') {
        previous.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const levelOptions = LEVEL_LABELS.map((label, index) => ({
    value: index as 0 | 1 | 2 | 3,
    label,
  }));

  return (
    <dialog
      open
      aria-label="Opções de acessibilidade"
      data-testid="accessibility-panel"
      style={{ height: 'min(720px, calc(100vh - 3rem))' }}
      className={cn(
        'a11y-widget-shield',
        'fixed bottom-6 z-40 m-0',
        PANEL_EDGE_CLASSES[position],
        'flex w-[calc(100vw-3rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl p-0',
        'border border-background-200 bg-background shadow-2xl',
        className
      )}
    >
      <header className="flex items-center justify-between gap-2 bg-info-600 px-4 py-3 text-white">
        <div className="flex min-w-0 flex-col">
          <Text
            size="md"
            weight="semibold"
            className="leading-tight text-white"
          >
            Acessibilidade
          </Text>
          <Text size="2xs" className="leading-tight text-white/80">
            Personalize a leitura e a navegação
          </Text>
        </div>
        <IconButton
          ref={closeButtonRef}
          size="sm"
          aria-label="Fechar opções de acessibilidade"
          onClick={onClose}
          icon={<XIcon size={18} />}
          className="text-white! hover:bg-white/15! hover:text-white! focus-visible:ring-white/60!"
        />
      </header>

      <div className="flex-1 overflow-y-auto">
        <Section
          title="Contraste"
          icon={<CircleHalfIcon size={18} weight="fill" />}
        >
          <Segmented
            ariaLabel="Modo de contraste"
            value={contrastMode}
            options={CONTRAST_OPTIONS}
            onChange={setContrastMode}
          />
        </Section>

        <Section title="Saturação" icon={<DropIcon size={18} weight="fill" />}>
          <Segmented
            ariaLabel="Modo de saturação"
            value={saturationMode}
            options={SATURATION_OPTIONS}
            onChange={setSaturationMode}
          />
        </Section>

        <Section
          title="Tamanho da fonte"
          icon={<TextAaIcon size={18} weight="bold" />}
        >
          <Segmented
            ariaLabel="Tamanho da fonte"
            value={fontSize}
            options={levelOptions}
            onChange={setFontSize}
          />
        </Section>

        <Section
          title="Espaçamento entre letras"
          icon={<TextTIcon size={18} weight="bold" />}
        >
          <Segmented
            ariaLabel="Espaçamento entre letras"
            value={letterSpacing}
            options={levelOptions}
            onChange={setLetterSpacing}
          />
        </Section>

        <Section
          title="Espaçamento entre linhas"
          icon={<TextTIcon size={18} weight="bold" />}
        >
          <Segmented
            ariaLabel="Espaçamento entre linhas"
            value={lineSpacing}
            options={levelOptions}
            onChange={setLineSpacing}
          />
        </Section>

        <Section
          title="Auxiliar de leitura"
          icon={<BookOpenTextIcon size={18} weight="fill" />}
        >
          <Segmented
            ariaLabel="Auxiliar de leitura"
            value={readingAid}
            options={READING_AID_OPTIONS}
            onChange={setReadingAid}
          />
        </Section>

        <Section
          title="Daltonismo"
          icon={<PaletteIcon size={18} weight="fill" />}
        >
          <Segmented
            ariaLabel="Modo de daltonismo"
            value={colorBlindMode}
            options={COLOR_BLIND_OPTIONS}
            onChange={setColorBlindMode}
          />
        </Section>

        <Section
          title="Outras opções"
          icon={<CursorIcon size={18} weight="fill" />}
        >
          <div className="flex flex-col gap-3">
            <ToggleRow
              label="Destacar links e botões"
              description="Adiciona contorno e sublinhado em elementos clicáveis"
              checked={highlightLinks}
              onChange={() => setHighlightLinks(!highlightLinks)}
              testId="a11y-toggle-highlight-links"
            />
            <ToggleRow
              label="Pausar animações"
              description="Reduz movimentos para conforto visual"
              checked={pauseAnimations}
              onChange={() => setPauseAnimations(!pauseAnimations)}
              testId="a11y-toggle-pause-animations"
            />
            <ToggleRow
              label="Cursor aumentado"
              description="Cursor maior e de alto contraste"
              checked={bigCursor}
              onChange={() => setBigCursor(!bigCursor)}
              testId="a11y-toggle-big-cursor"
            />
            <ToggleRow
              label="Fonte para dislexia"
              description="OpenDyslexic com fallback para Comic Sans MS"
              checked={dyslexiaFont}
              onChange={() => setDyslexiaFont(!dyslexiaFont)}
              testId="a11y-toggle-dyslexia-font"
            />
          </div>
        </Section>

        <Section
          title="Atalho de teclado"
          icon={<KeyboardIcon size={18} weight="fill" />}
        >
          <ToggleRow
            label="Alt + A para abrir o painel"
            description="Atalho global, ignorado durante digitação em campos"
            checked={keyboardShortcut}
            onChange={() => setKeyboardShortcut(!keyboardShortcut)}
            testId="a11y-toggle-keyboard-shortcut"
          />
        </Section>
      </div>

      <footer className="flex items-center justify-between gap-2 border-t border-background-200 px-4 py-3">
        <Text size="2xs" className="text-text-600">
          As preferências são salvas neste dispositivo.
        </Text>
        <Button
          variant="outline"
          action="secondary"
          size="small"
          onClick={resetPreferences}
          data-testid="a11y-reset"
        >
          <ArrowCounterClockwiseIcon
            size={14}
            weight="bold"
            aria-hidden="true"
          />
          <span className="ml-1">Redefinir</span>
        </Button>
      </footer>
    </dialog>
  );
}
