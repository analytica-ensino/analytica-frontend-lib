import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmojiPicker, RICH_EDITOR_EMOJIS } from './EmojiPicker';

const renderPicker = (open = true) => {
  const onClose = jest.fn();
  const onSelect = jest.fn();
  render(
    <div>
      <EmojiPicker open={open} onClose={onClose} onSelect={onSelect}>
        <button type="button">abrir</button>
      </EmojiPicker>
      <span>fora</span>
    </div>
  );
  return { onClose, onSelect };
};

describe('EmojiPicker', () => {
  it('lists 48 single emojis', () => {
    expect(RICH_EDITOR_EMOJIS).toHaveLength(48);
    expect(RICH_EDITOR_EMOJIS).not.toContain('');
  });

  it('renders only the trigger while closed', () => {
    renderPicker(false);
    expect(screen.getByText('abrir')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('inserts the picked emoji and closes', () => {
    const { onClose, onSelect } = renderPicker();
    fireEvent.click(screen.getByRole('button', { name: 'Inserir 💡' }));
    expect(onSelect).toHaveBeenCalledWith('💡');
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on Escape and on a click outside, not inside', () => {
    const { onClose } = renderPicker();
    fireEvent.mouseDown(screen.getByRole('dialog'));
    fireEvent.keyDown(document, { key: 'a' });
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.mouseDown(screen.getByText('fora'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
