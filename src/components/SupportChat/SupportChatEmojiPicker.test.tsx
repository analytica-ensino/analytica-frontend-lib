import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupportChatEmojiPicker, {
  SUPPORT_CHAT_EMOJI_CATEGORIES,
} from './SupportChatEmojiPicker';

describe('SupportChatEmojiPicker', () => {
  it('shows the first category and picks an emoji', () => {
    const onSelect = jest.fn();
    render(<SupportChatEmojiPicker onSelect={onSelect} />);

    const first = SUPPORT_CHAT_EMOJI_CATEGORIES[0];
    expect(screen.getByRole('tab', { name: first.label })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    fireEvent.click(
      screen.getByRole('button', { name: `Inserir ${first.emojis[0]}` })
    );
    expect(onSelect).toHaveBeenCalledWith(first.emojis[0]);
  });

  it('switches category', () => {
    render(<SupportChatEmojiPicker onSelect={jest.fn()} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Gestos' }));
    expect(screen.getByRole('tab', { name: 'Gestos' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(
      screen.getByRole('button', { name: 'Inserir 👍' })
    ).toBeInTheDocument();
  });

  it('falls back to the first category for an unknown active id', () => {
    render(
      <SupportChatEmojiPicker
        onSelect={jest.fn()}
        categories={[{ id: 'a', label: 'A', emojis: ['🙂'] }]}
      />
    );
    expect(
      screen.getByRole('button', { name: 'Inserir 🙂' })
    ).toBeInTheDocument();
  });
});
