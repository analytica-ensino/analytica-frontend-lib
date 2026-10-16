import { useEffect, useRef, type ReactNode } from 'react';

/** Emojis offered by the picker, in display order */
export const RICH_EDITOR_EMOJIS = [
  '😀 😃 😄 😁 😊 🙂 😉 😍',
  '🤩 😎 🤔 😅 😢 😮 🙏 👏',
  '👍 👎 👋 💪 ✅ ❌ ⚠️ ❗',
  '❓ ℹ️ 💡 📌 📎 📝 📚 📖',
  '🎓 🏫 📅 ⏰ 🔒 🔑 📱 💻',
  '🖥️ 📧 🔗 🎥 ▶️ ⭐ 🎉 🚀',
]
  .join(' ')
  .split(' ');

interface EmojiPickerProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSelect: (emoji: string) => void;
  /** The toolbar button; the popover anchors to it */
  readonly children: ReactNode;
}

/**
 * Toolbar popover with a grid of common emojis. Closes on pick, on Escape and
 * on a click outside.
 */
export function EmojiPicker({
  open,
  onClose,
  onSelect,
  children,
}: EmojiPickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onClose();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  return (
    <div ref={rootRef} className="relative">
      {children}
      {open && (
        <div
          role="dialog"
          aria-label="Emojis"
          className="absolute left-0 top-full z-20 mt-1 grid w-72 grid-cols-8 gap-1 rounded-lg border border-border-200 bg-background p-2 shadow-lg"
        >
          {RICH_EDITOR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-label={`Inserir ${emoji}`}
              onClick={() => {
                onSelect(emoji);
                onClose();
              }}
              className="flex h-8 w-8 items-center justify-center rounded text-lg hover:bg-background-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-info"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
