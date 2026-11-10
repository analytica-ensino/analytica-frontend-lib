import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { GearSixIcon } from '@phosphor-icons/react/dist/csr/GearSix';
import IconButton from '../IconButton/IconButton';
import { cn } from '../../utils/utils';
import {
  AUTO_QUALITY,
  formatQualityLabel,
  type QualitySelection,
} from './videoQuality';

/** Gap between the button and the menu that opens above it, in px. */
const MENU_GAP = 8;

export interface QualityMenuProps {
  /** Rendition heights, tallest first. Fewer than two hides the menu. */
  qualities: number[];
  /** Current choice. */
  selected: QualitySelection;
  /** Called with the chosen quality. */
  onSelect: (quality: QualitySelection) => void;
  /**
   * In fullscreen only the player's container is visible, so the menu opens
   * inside it instead of in a portal on `<body>`.
   */
  isFullscreen: boolean;
  /** Icon size, following the other controls. */
  iconSize?: number;
  /**
   * Told when the menu opens and closes, so the player keeps its controls on
   * screen while the menu is open (as it does for the speed menu).
   */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Quality menu of the video player: "Automático" (the default) followed by
 * the renditions the video has, tallest first.
 *
 * Keyboard: arrows, Home and End move between options, Escape closes and
 * returns focus to the button, Tab leaves.
 *
 * @param props - Component props
 * @returns The menu button and, when open, the menu; null with one quality
 */
const QualityMenu = ({
  qualities,
  selected,
  onSelect,
  isFullscreen,
  iconSize = 24,
  onOpenChange,
}: Readonly<QualityMenuProps>) => {
  const [isOpenState, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasMenu = qualities.length >= 2;
  const isOpen = isOpenState && hasMenu;

  // The menu goes away with the renditions (MP4 fallback, another lesson):
  // it must not pop back open when a new list arrives.
  useEffect(() => {
    if (!hasMenu) setIsOpen(false);
  }, [hasMenu]);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  // Unmounting while open must not leave the player believing it still is.
  useEffect(() => () => onOpenChange?.(false), [onOpenChange]);

  // Closes on a click outside both the button and the (portaled) menu.
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleMouseDown = (event: Event) => {
      const target = event.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen]);

  // On open, focus goes to the checked option so screen readers announce the
  // current choice. The timeout waits for the portaled menu to mount.
  useEffect(() => {
    if (!isOpen) return undefined;
    const timer = setTimeout(() => {
      menuRef.current
        ?.querySelector<HTMLElement>('[aria-checked="true"]')
        ?.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!hasMenu) return null;

  const options: QualitySelection[] = [AUTO_QUALITY, ...qualities];

  const close = () => {
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitemradio"]'
      ) ?? []
    );
    const current = items.indexOf(document.activeElement as HTMLElement);
    const nextIndexByKey: Record<string, number> = {
      ArrowDown: (current + 1) % items.length,
      ArrowUp: (current - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    };

    if (event.key in nextIndexByKey) {
      // Handled keys stop here so they do not reach the player's shortcuts.
      event.preventDefault();
      event.stopPropagation();
      items[nextIndexByKey[event.key]]?.focus();
    } else if (event.key === 'Escape') {
      // preventDefault keeps a surrounding Modal open.
      event.preventDefault();
      event.stopPropagation();
      close();
    } else if (event.key === 'Tab') {
      // Focus the button first, without preventDefault: the native Tab then
      // continues from it instead of from the end of <body>.
      buttonRef.current?.focus();
      setIsOpen(false);
    }
  };

  // Measured only while open: `getBoundingClientRect` forces a layout, and
  // the player re-renders as the video time advances.
  const rect = isOpen ? buttonRef.current?.getBoundingClientRect() : undefined;
  const portalPosition = rect
    ? {
        bottom: `${globalThis.innerHeight - rect.top + MENU_GAP}px`,
        right: `${Math.max(MENU_GAP, globalThis.innerWidth - rect.right)}px`,
      }
    : undefined;

  const menu = (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Qualidade"
      tabIndex={-1}
      onKeyDown={handleMenuKeyDown}
      className={cn(
        'bg-background border border-border-100 rounded-lg shadow-lg p-2 min-w-32 z-[9999]',
        isFullscreen ? 'absolute bottom-12 right-0' : 'fixed'
      )}
      style={isFullscreen ? undefined : portalPosition}
    >
      {options.map((option) => {
        const isChecked = option === selected;
        return (
          <button
            key={option}
            type="button"
            role="menuitemradio"
            aria-checked={isChecked}
            // Roving tabindex: arrows move between options, Tab leaves.
            tabIndex={-1}
            onClick={() => {
              onSelect(option);
              close();
            }}
            className={cn(
              'block w-full text-left px-3 py-1 text-sm rounded hover:bg-border-50 transition-colors',
              isChecked
                ? 'bg-primary-950 text-secondary-100 font-medium'
                : 'text-text-950'
            )}
          >
            {formatQualityLabel(option)}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="relative" ref={containerRef}>
      <IconButton
        ref={buttonRef}
        icon={<GearSixIcon size={iconSize} />}
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Qualidade"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="!bg-transparent !text-white hover:!bg-white/20"
      />
      {isOpen && (isFullscreen ? menu : createPortal(menu, document.body))}
    </div>
  );
};

export default QualityMenu;
