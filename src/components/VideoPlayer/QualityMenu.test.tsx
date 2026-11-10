import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QualityMenu, { type QualityMenuProps } from './QualityMenu';
import { formatQualityLabel } from './videoQuality';

const renderMenu = (props: Partial<QualityMenuProps> = {}) => {
  const onSelect = jest.fn();
  const view = render(
    <div data-testid="controls">
      <QualityMenu
        qualities={[720, 480, 360]}
        selected="auto"
        onSelect={onSelect}
        isFullscreen={false}
        {...props}
      />
    </div>
  );
  return { ...view, onSelect };
};

const openMenu = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Qualidade' }));
  return screen.getByRole('menu', { name: 'Qualidade' });
};

describe('formatQualityLabel', () => {
  it('names the automatic choice and the renditions by height', () => {
    expect(formatQualityLabel('auto')).toBe('Automático');
    expect(formatQualityLabel(1080)).toBe('1080p');
  });
});

describe('QualityMenu', () => {
  it('renders nothing with fewer than two renditions', () => {
    const { container } = renderMenu({ qualities: [360] });
    expect(container.querySelector('button')).toBeNull();
  });

  it('opens with Automático first and checked, then the renditions', async () => {
    renderMenu();
    const button = screen.getByRole('button', { name: 'Qualidade' });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    openMenu();

    expect(button).toHaveAttribute('aria-expanded', 'true');
    const items = screen.getAllByRole('menuitemradio');
    expect(items.map((item) => item.textContent)).toEqual([
      'Automático',
      '720p',
      '480p',
      '360p',
    ]);
    expect(items[0]).toHaveAttribute('aria-checked', 'true');
    expect(items[1]).toHaveAttribute('aria-checked', 'false');
    // Focus goes to the current choice so it is announced.
    await waitFor(() => expect(items[0]).toHaveFocus());
  });

  it('marks the rendition in use', () => {
    renderMenu({ selected: 480 });
    openMenu();
    expect(screen.getByRole('menuitemradio', { name: '480p' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });

  it('selects a quality, closes and returns focus to the button', () => {
    const { onSelect } = renderMenu();
    openMenu();

    fireEvent.click(screen.getByRole('menuitemradio', { name: '360p' }));

    expect(onSelect).toHaveBeenCalledWith(360);
    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.getByRole('button', { name: 'Qualidade' })).toHaveFocus();
  });

  it('opens in a portal on <body> and inside the player in fullscreen', () => {
    const { rerender, onSelect } = renderMenu();
    const menu = openMenu();
    expect(screen.getByTestId('controls')).not.toContainElement(menu);
    expect(menu.style.bottom).not.toBe('');

    fireEvent.click(screen.getByRole('button', { name: 'Qualidade' }));
    rerender(
      <div data-testid="controls">
        <QualityMenu
          qualities={[720, 480, 360]}
          selected="auto"
          onSelect={onSelect}
          isFullscreen
        />
      </div>
    );
    const inlineMenu = openMenu();
    expect(screen.getByTestId('controls')).toContainElement(inlineMenu);
    expect(inlineMenu.style.bottom).toBe('');
  });

  it('moves between options with the arrows, Home and End', () => {
    renderMenu();
    const menu = openMenu();
    const items = screen.getAllByRole('menuitemradio');
    items[0].focus();

    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(items[1]).toHaveFocus();
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(items[3]).toHaveFocus();
    fireEvent.keyDown(menu, { key: 'Home' });
    expect(items[0]).toHaveFocus();
    fireEvent.keyDown(menu, { key: 'End' });
    expect(items[3]).toHaveFocus();
    fireEvent.keyDown(menu, { key: 'a' });
    expect(items[3]).toHaveFocus();
  });

  it('does not let handled keys reach the player shortcuts', () => {
    const onKeyDown = jest.fn();
    render(
      <div onKeyDown={onKeyDown}>
        <QualityMenu
          qualities={[720, 360]}
          selected="auto"
          onSelect={jest.fn()}
          isFullscreen
        />
      </div>
    );
    const menu = openMenu();

    fireEvent.keyDown(menu, { key: 'ArrowDown' });

    expect(onKeyDown).not.toHaveBeenCalled();
  });

  it('closes with Escape and returns focus to the button', () => {
    renderMenu();
    const menu = openMenu();

    fireEvent.keyDown(menu, { key: 'Escape' });

    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.getByRole('button', { name: 'Qualidade' })).toHaveFocus();
  });

  it('closes when Tab leaves the menu', () => {
    renderMenu();
    const menu = openMenu();

    fireEvent.keyDown(menu, { key: 'Tab' });

    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.getByRole('button', { name: 'Qualidade' })).toHaveFocus();
  });

  it('closes on a click outside, but not on a click inside', () => {
    renderMenu();
    const menu = openMenu();

    fireEvent.mouseDown(menu);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('toggles closed from its button', () => {
    renderMenu();
    openMenu();

    fireEvent.click(screen.getByRole('button', { name: 'Qualidade' }));

    expect(screen.queryByRole('menu')).toBeNull();
  });
});
