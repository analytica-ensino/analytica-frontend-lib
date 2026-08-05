import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import {
  DROPDOWN_GAP,
  DROPDOWN_MAX_HEIGHT,
  DROPDOWN_MIN_HEIGHT,
} from './constants';

interface UseDropdownPositionParams {
  open: boolean;
  triggerRef: RefObject<HTMLElement | null>;
}

interface UseDropdownPosition {
  /** Null until the trigger has been measured; the dropdown waits for it. */
  triggerRect: DOMRect | null;
  /** Re-measures the trigger, called when the dropdown is about to open. */
  measureTrigger: () => void;
  /** Fixed-position styles that keep the dropdown glued to the trigger. */
  dropdownStyles: CSSProperties;
}

/**
 * Positions a portalled dropdown against its trigger.
 *
 * The dropdown renders into `document.body`, so it cannot rely on the trigger's
 * layout. It is measured on open and re-measured on scroll and resize, and it
 * flips above the trigger when there is not enough room below.
 */
export function useDropdownPosition({
  open,
  triggerRef,
}: UseDropdownPositionParams): UseDropdownPosition {
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const measureTrigger = useCallback(() => {
    if (!triggerRef.current) return;
    setTriggerRect(triggerRef.current.getBoundingClientRect());
  }, [triggerRef]);

  useEffect(() => {
    if (!open) return;

    const handleUpdate = () => measureTrigger();
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [open, measureTrigger]);

  const dropdownStyles = buildDropdownStyles(triggerRect);

  return { triggerRect, measureTrigger, dropdownStyles };
}

/**
 * Turns a trigger rect into fixed-position styles, flipping the dropdown above
 * the trigger when the space below is too tight and the space above is larger.
 *
 * The available space is clamped to `DROPDOWN_MIN_HEIGHT`: a trigger scrolled
 * past either viewport edge yields a negative measurement, which would produce
 * an invalid `maxHeight` and collapse the dropdown.
 */
function buildDropdownStyles(triggerRect: DOMRect | null): CSSProperties {
  if (!triggerRect) return {};

  const viewportHeight = window.innerHeight;
  const spaceBelow = viewportHeight - triggerRect.bottom - DROPDOWN_GAP;
  const spaceAbove = triggerRect.top - DROPDOWN_GAP;
  const openAbove = spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow;
  const availableSpace = openAbove ? spaceAbove : spaceBelow;

  const placement: CSSProperties = openAbove
    ? { bottom: viewportHeight - triggerRect.top + DROPDOWN_GAP }
    : { top: triggerRect.bottom + DROPDOWN_GAP };

  return {
    position: 'fixed',
    left: triggerRect.left,
    width: triggerRect.width,
    zIndex: 9999,
    maxHeight: clampDropdownHeight(availableSpace),
    ...placement,
  };
}

/** Keeps the dropdown between a usable floor and its documented ceiling. */
function clampDropdownHeight(availableSpace: number): number {
  const usableSpace = Math.max(availableSpace, DROPDOWN_MIN_HEIGHT);
  return Math.min(usableSpace, DROPDOWN_MAX_HEIGHT);
}
