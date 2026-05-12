import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowCounterClockwiseIcon,
  CaretDownIcon,
  EyeIcon,
  FilmReelIcon,
  KeyboardIcon,
  NavigationArrowIcon,
  SpeakerHighIcon,
  TextTIcon,
  XIcon,
} from '@phosphor-icons/react';
import accessibilityIcon from '../../assets/img/accessibility.png';
import Text from '../Text/Text';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';
import AccessibilityToggleRow from './AccessibilityToggleRow';
import TTSSection from './TTSSection';
import { cn } from '../../utils/utils';
import {
  useAccessibilityStore,
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

const LEVEL_LABELS = ['Padrão', 'Pequeno', 'Médio', 'Grande'] as const;

/** Tamanho de fonte do preview "Aa" em cada botão (Padrão → Grande). */
const FONT_SIZE_PREVIEW_CLASSES = [
  'text-base', // Padrão
  'text-lg', // Pequeno (= maior que Padrão, segue a escala incremental do widget)
  'text-2xl', // Médio
  'text-4xl', // Grande
] as const;

/** Letter-spacing do preview "Aa" em cada botão. */
const LETTER_SPACING_PREVIEW_CLASSES = [
  'tracking-tighter', // Padrão (junto)
  'tracking-normal',
  'tracking-wider',
  'tracking-widest',
] as const;

/** Gap vertical entre as 3 barras do preview de espaçamento entre linhas. */
const LINE_SPACING_PREVIEW_GAPS = [
  'gap-0.5', // Padrão (2px) — linhas próximas
  'gap-1.5', // Pequeno (6px)
  'gap-2.5', // Médio (10px)
  'gap-3.5', // Grande (14px)
] as const;

/**
 * `<dialog open>` aplica `left: 0; right: 0` como user-agent style. Sem
 * resetar o lado oposto para `auto`, o painel acaba grudando no lado
 * errado mesmo com `right-6` ou `left-6` aplicado.
 */
const PANEL_EDGE_CLASSES: Record<AccessibilityFabPosition, string> = {
  right: 'right-10 left-auto',
  left: 'left-10 right-auto',
};

interface AccordionSectionProps {
  title: string;
  icon: ReactNode;
  defaultExpanded?: boolean;
  testId?: string;
  children: ReactNode;
}

/**
 * Item de accordion estilo lista (sem cantos arredondados nem card),
 * com ícone + título à esquerda e caret à direita. Cada item separado
 * do próximo por uma linha fina. Mantém a estrutura visual do design
 * do Figma sem usar o `CardAccordation` da lib (que tem visual de card).
 */
const AccordionSection = ({
  title,
  icon,
  defaultExpanded = false,
  testId,
  children,
}: Readonly<AccordionSectionProps>) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <section className="border-b border-background-200 last:border-b-0">
      <Button
        variant="raw"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        data-testid={testId}
        className={cn(
          'flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-3',
          'text-left transition-colors hover:bg-background-50',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-info-500 focus-visible:ring-inset'
        )}
      >
        <span className="flex items-center gap-2">
          <span className="text-text-800" aria-hidden="true">
            {icon}
          </span>
          <Text
            size="md"
            weight="semibold"
            className="leading-none text-text-800"
          >
            {title}
          </Text>
        </span>
        <CaretDownIcon
          size={16}
          weight="bold"
          aria-hidden="true"
          className={cn(
            'text-text-700 transition-transform duration-200',
            expanded ? 'rotate-180' : 'rotate-0'
          )}
        />
      </Button>
      {expanded && (
        <div className="flex flex-col gap-6 px-4 pb-4 pt-2">{children}</div>
      )}
    </section>
  );
};

interface SubControlProps {
  label: string;
  children: ReactNode;
}

/**
 * Wrapper para uma control (segmented/toggle) com título dentro do
 * accordion. Tipografia do label segue o Figma: Roboto 12px/500/100%
 * uppercase, cor `text-text-600` (#737373).
 */
const SubControl = ({ label, children }: Readonly<SubControlProps>) => (
  <div className="flex flex-col gap-2">
    <Text
      size="xs"
      weight="medium"
      className="uppercase leading-none text-text-600"
    >
      {label}
    </Text>
    {children}
  </div>
);

interface SegmentedProps<T extends string | number> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  ariaLabel: string;
}

/**
 * Estilo de segmented baseado no `SelectionButton` da lib: cada opção é
 * um botão independente com `border` + `bg-background`, e o selecionado
 * ganha `ring-primary-950` (mesma identidade visual do componente da lib,
 * sem o overhead de ícone obrigatório do SelectionButton).
 */
const Segmented = <T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
}: Readonly<SegmentedProps<T>>) => (
  <div
    role="radiogroup"
    aria-label={ariaLabel}
    className="flex flex-wrap gap-2"
  >
    {options.map((opt) => {
      const isActive = opt.value === value;
      return (
        <Button
          key={String(opt.value)}
          variant="raw"
          role="radio"
          aria-checked={isActive}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 cursor-pointer rounded-xl border border-border-50 bg-background',
            // Texto segue spec do Figma: Roboto 14px/700/100%/0.2px, cor
            // #525252 (text-700). Quando ativo, troca pra primary-950
            // (azul escuro), mas mantém a mesma typography.
            'px-4 py-4 text-sm font-bold leading-none tracking-[0.2px] text-text-700',
            'shadow-soft-shadow-1 transition-all duration-150',
            'hover:bg-background-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-info',
            isActive &&
              'ring-2 ring-primary-950 ring-offset-0 shadow-none text-primary-950'
          )}
        >
          {opt.label}
        </Button>
      );
    })}
  </div>
);

interface PreviewSegmentedOption<T extends string | number> {
  value: T;
  label: string;
  /** Conteúdo visual exibido DENTRO do botão (preview do efeito). */
  preview: ReactNode;
}

interface PreviewSegmentedProps<T extends string | number> {
  value: T;
  options: PreviewSegmentedOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
}

/**
 * Variante do Segmented onde o botão mostra um preview visual do efeito
 * (ex.: "Aa" em tamanhos diferentes para "Tamanho da fonte") e o label
 * textual fica abaixo do botão como legenda.
 */
const PreviewSegmented = <T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
}: Readonly<PreviewSegmentedProps<T>>) => (
  <div role="radiogroup" aria-label={ariaLabel} className="flex gap-2">
    {options.map((opt) => {
      const isActive = opt.value === value;
      return (
        <div
          key={String(opt.value)}
          className="flex flex-1 flex-col items-center gap-2"
        >
          <Button
            variant="raw"
            role="radio"
            aria-checked={isActive}
            aria-label={opt.label}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex aspect-square w-full items-center justify-center',
              'cursor-pointer rounded-xl border border-border-50 bg-background',
              'text-text-700 shadow-soft-shadow-1 transition-all duration-150',
              'hover:bg-background-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-info',
              isActive &&
                'ring-2 ring-primary-950 ring-offset-0 shadow-none text-primary-950'
            )}
          >
            {opt.preview}
          </Button>
          <Text
            size="xs"
            weight="normal"
            className="leading-none text-text-700"
          >
            {opt.label}
          </Text>
        </div>
      );
    })}
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
 * Painel lateral com os controles de acessibilidade organizados em
 * accordions colapsáveis (Visão, Leitura, Leitor de texto, Animação,
 * Navegação, Atalho de teclado).
 *
 * O próprio painel fica dentro de `.a11y-widget-shield`, então
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
      // `<dialog>` não estica automaticamente com `top` + `bottom`, por
      // isso a altura fica explícita: `100vh - 5rem` (80px de respiro do
      // topo). Combinado com `bottom-0` no className, o painel encosta
      // na base da viewport como no Figma.
      style={{ height: 'calc(100vh - 5rem)' }}
      className={cn(
        'a11y-widget-shield',
        'fixed bottom-0 z-40 m-0',
        PANEL_EDGE_CLASSES[position],
        'flex w-[calc(100vw-3rem)] max-w-110 flex-col overflow-hidden rounded-2xl p-0',
        'border border-background-200 bg-background shadow-2xl',
        className
      )}
    >
      {/* Header — visual do Figma: bg azul-claro (Paraná) / rosa-claro
          (Paraíba) usando `primary-50`. Preferido em vez de `map-attention`
          porque `primary-50` flipa corretamente no dark mode em todos os
          temas (ex.: Paraná dark = #27344a), enquanto `map-attention`
          ficou idêntico em light/dark no theme do Paraná, deixando o
          texto branco invisível sobre o azul-claro no dark. */}
      <header className="flex items-center justify-between gap-3 bg-primary-50 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={accessibilityIcon}
            alt=""
            aria-hidden="true"
            className="h-10 w-10 shrink-0"
          />
          <div className="flex min-w-0 flex-col gap-1">
            <Text
              size="md"
              weight="bold"
              className="leading-none tracking-[0.2px] text-text-950"
            >
              Acessibilidade
            </Text>
            <Text
              size="xs"
              weight="normal"
              className="leading-none text-text-800"
            >
              Personalize a leitura e navegação
            </Text>
          </div>
        </div>
        <IconButton
          ref={closeButtonRef}
          size="sm"
          aria-label="Fechar opções de acessibilidade"
          onClick={onClose}
          icon={<XIcon size={18} />}
        />
      </header>

      <div className="flex-1 overflow-y-auto">
        <AccordionSection
          title="Visão"
          icon={<EyeIcon size={18} />}
          testId="a11y-section-vision"
        >
          <SubControl label="Contraste">
            <Segmented
              ariaLabel="Modo de contraste"
              value={contrastMode}
              options={CONTRAST_OPTIONS}
              onChange={setContrastMode}
            />
          </SubControl>
          <SubControl label="Saturação">
            <Segmented
              ariaLabel="Modo de saturação"
              value={saturationMode}
              options={SATURATION_OPTIONS}
              onChange={setSaturationMode}
            />
          </SubControl>
          {/* Daltonismo removido por enquanto — store/store actions
              mantidos para reativação futura sem refactor. */}
        </AccordionSection>

        <AccordionSection
          title="Leitura"
          icon={<TextTIcon size={18} />}
          testId="a11y-section-reading"
        >
          <SubControl label="Fonte para dislexia">
            <AccessibilityToggleRow
              ariaLabel="Trocar para Comic Sans MS"
              rowTestId="a11y-toggle-dyslexia-font-row"
              switchTestId="a11y-toggle-dyslexia-font"
              checked={dyslexiaFont}
              onChange={() => setDyslexiaFont(!dyslexiaFont)}
              label={
                <>
                  Trocar para{' '}
                  <span style={{ fontFamily: '"Comic Sans MS", cursive' }}>
                    Comic Sans MS
                  </span>
                </>
              }
            />
          </SubControl>

          <SubControl label="Tamanho da fonte">
            <PreviewSegmented
              ariaLabel="Tamanho da fonte"
              value={fontSize}
              options={levelOptions.map((opt) => ({
                ...opt,
                preview: (
                  <span
                    className={cn(
                      'font-semibold leading-none',
                      FONT_SIZE_PREVIEW_CLASSES[opt.value]
                    )}
                  >
                    Aa
                  </span>
                ),
              }))}
              onChange={setFontSize}
            />
          </SubControl>

          <SubControl label="Espaçamento entre letras">
            <PreviewSegmented
              ariaLabel="Espaçamento entre letras"
              value={letterSpacing}
              options={levelOptions.map((opt) => ({
                ...opt,
                preview: (
                  <span
                    className={cn(
                      // Mesmo tamanho do "Aa" no botão Padrão de "Tamanho
                      // da fonte" (text-base), pra que essa scale visualize
                      // só a variação de letter-spacing.
                      'text-base font-semibold leading-none',
                      LETTER_SPACING_PREVIEW_CLASSES[opt.value]
                    )}
                  >
                    Aa
                  </span>
                ),
              }))}
              onChange={setLetterSpacing}
            />
          </SubControl>

          <SubControl label="Espaçamento entre linhas">
            <PreviewSegmented
              ariaLabel="Espaçamento entre linhas"
              value={lineSpacing}
              options={levelOptions.map((opt) => ({
                ...opt,
                preview: (
                  <span
                    className={cn(
                      'flex flex-col items-stretch',
                      LINE_SPACING_PREVIEW_GAPS[opt.value]
                    )}
                  >
                    <span className="h-0.5 w-7 rounded-full bg-current" />
                    <span className="h-0.5 w-7 rounded-full bg-current" />
                    <span className="h-0.5 w-7 rounded-full bg-current" />
                  </span>
                ),
              }))}
              onChange={setLineSpacing}
            />
          </SubControl>

          <SubControl label="Auxiliar de leitura">
            <Segmented
              ariaLabel="Auxiliar de leitura"
              value={readingAid}
              options={READING_AID_OPTIONS}
              onChange={setReadingAid}
            />
          </SubControl>
        </AccordionSection>

        <AccordionSection
          title="Leitor de texto"
          icon={<SpeakerHighIcon size={18} />}
          testId="a11y-section-tts"
        >
          <TTSSection PreviewSegmented={PreviewSegmented} />
        </AccordionSection>

        <AccordionSection
          title="Animação"
          icon={<FilmReelIcon size={18} />}
          testId="a11y-section-animation"
        >
          <AccessibilityToggleRow
            label="Pausar animações para conforto visual"
            checked={pauseAnimations}
            onChange={() => setPauseAnimations(!pauseAnimations)}
            switchTestId="a11y-toggle-pause-animations"
          />
        </AccordionSection>

        <AccordionSection
          title="Navegação"
          icon={<NavigationArrowIcon size={18} />}
          testId="a11y-section-navigation"
        >
          <SubControl label="Destacar links e botões">
            <AccessibilityToggleRow
              label="Adicionar contorno em elementos clicáveis"
              checked={highlightLinks}
              onChange={() => setHighlightLinks(!highlightLinks)}
              switchTestId="a11y-toggle-highlight-links"
            />
          </SubControl>
          <SubControl label="Cursor maior">
            <AccessibilityToggleRow
              label="Aumentar e escurecer cursor"
              checked={bigCursor}
              onChange={() => setBigCursor(!bigCursor)}
              switchTestId="a11y-toggle-big-cursor"
            />
          </SubControl>
        </AccordionSection>

        <AccordionSection
          title="Atalho de teclado"
          icon={<KeyboardIcon size={18} />}
          testId="a11y-section-shortcut"
        >
          <AccessibilityToggleRow
            label="Alt+A para abrir o painel"
            checked={keyboardShortcut}
            onChange={() => setKeyboardShortcut(!keyboardShortcut)}
            switchTestId="a11y-toggle-keyboard-shortcut"
          />
        </AccordionSection>
      </div>

      <footer className="border-t border-background-200 px-4 py-3">
        <Button
          variant="outline"
          action="primary"
          size="medium"
          iconLeft={
            <ArrowCounterClockwiseIcon
              size={16}
              weight="bold"
              aria-hidden="true"
            />
          }
          onClick={resetPreferences}
          data-testid="a11y-reset"
          className="w-full justify-center"
        >
          Redefinir ajustes
        </Button>
      </footer>
    </dialog>
  );
}
