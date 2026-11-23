import { useState } from 'react';
import Button from '../Button/Button';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';

/** Emoji category shown as a tab of the picker */
export interface SupportChatEmojiCategory {
  id: string;
  label: string;
  emojis: string[];
}

/** Common emojis for support replies, no extra dependency */
export const SUPPORT_CHAT_EMOJI_CATEGORIES: SupportChatEmojiCategory[] = [
  {
    id: 'smileys',
    label: 'Carinhas',
    emojis: [
      '😀',
      '😃',
      '😄',
      '😁',
      '😆',
      '😅',
      '😂',
      '🙂',
      '😉',
      '😊',
      '😇',
      '🥰',
      '😍',
      '🤩',
      '😘',
      '😋',
      '😎',
      '🤗',
      '🤔',
      '🤨',
      '😐',
      '😶',
      '🙄',
      '😏',
      '😌',
      '😔',
      '😢',
      '😭',
      '😤',
      '😮',
      '😱',
      '🥺',
      '😴',
      '🤯',
      '🥳',
      '😬',
    ],
  },
  {
    id: 'gestures',
    label: 'Gestos',
    emojis: [
      '👍',
      '👎',
      '👌',
      '🤞',
      '✌️',
      '🤙',
      '👋',
      '👏',
      '🙌',
      '🙏',
      '💪',
      '👀',
      '🤝',
      '☝️',
      '👇',
      '👉',
    ],
  },
  {
    id: 'symbols',
    label: 'Símbolos',
    emojis: [
      '❤️',
      '💙',
      '💚',
      '💛',
      '💜',
      '✨',
      '⭐',
      '🔥',
      '🎉',
      '✅',
      '❌',
      '⚠️',
      '❓',
      '❗',
      '💡',
      '📌',
      '📎',
      '📚',
      '📝',
      '⏰',
      '📅',
      '💻',
      '📱',
      '🔒',
    ],
  },
];

/**
 * Props of the SupportChatEmojiPicker component
 */
export interface SupportChatEmojiPickerProps {
  /** Called with the picked emoji */
  onSelect: (emoji: string) => void;
  /** Categories shown as tabs (default: SUPPORT_CHAT_EMOJI_CATEGORIES) */
  categories?: SupportChatEmojiCategory[];
  /** Extra classes for the root */
  className?: string;
}

/**
 * Grid of emojis split in categories, used by the support composer to
 * insert an emoji in the text.
 *
 * @example
 * <SupportChatEmojiPicker onSelect={(emoji) => insert(emoji)} />
 */
const SupportChatEmojiPicker = ({
  onSelect,
  categories = SUPPORT_CHAT_EMOJI_CATEGORIES,
  className,
}: SupportChatEmojiPickerProps) => {
  const [activeId, setActiveId] = useState(categories[0]?.id);
  const active =
    categories.find((category) => category.id === activeId) ?? categories[0];

  return (
    <div
      role="dialog"
      aria-label="Emojis"
      data-testid="support-chat-emoji-picker"
      className={cn(
        'flex w-72 flex-col gap-2 rounded-lg border border-border-100 bg-background p-2 shadow-lg',
        className
      )}
    >
      <div role="tablist" className="flex gap-1">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant="raw"
            role="tab"
            aria-selected={category.id === active?.id}
            onClick={() => setActiveId(category.id)}
            className={cn(
              'rounded-md px-2 py-1',
              category.id === active?.id
                ? 'bg-primary-50'
                : 'hover:bg-background-50'
            )}
          >
            <Text
              as="span"
              size="xs"
              weight="medium"
              color={
                category.id === active?.id
                  ? 'text-primary-800'
                  : 'text-text-600'
              }
            >
              {category.label}
            </Text>
          </Button>
        ))}
      </div>
      <div
        role="tabpanel"
        className="grid max-h-48 grid-cols-8 gap-1 overflow-y-auto"
      >
        {active?.emojis.map((emoji) => (
          <Button
            key={emoji}
            variant="raw"
            aria-label={`Inserir ${emoji}`}
            onClick={() => onSelect(emoji)}
            className="flex size-8 items-center justify-center rounded-md text-lg hover:bg-background-50"
          >
            {emoji}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SupportChatEmojiPicker;
