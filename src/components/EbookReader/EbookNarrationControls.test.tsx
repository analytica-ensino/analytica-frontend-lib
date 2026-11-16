import { fireEvent, render, screen } from '@testing-library/react';
import { EbookNarrationControls } from './EbookNarrationControls';

const renderControls = (
  props: Partial<Parameters<typeof EbookNarrationControls>[0]> = {}
) => {
  const onToggle = jest.fn();
  const onToggleAudioDescription = jest.fn();
  render(
    <EbookNarrationControls
      isPlaying={false}
      onToggle={onToggle}
      hasAudioDescription
      withAudioDescription
      onToggleAudioDescription={onToggleAudioDescription}
      {...props}
    />
  );
  return { onToggle, onToggleAudioDescription };
};

describe('EbookNarrationControls', () => {
  it('starts listening with "Ouvir"', () => {
    const { onToggle } = renderControls();

    const listen = screen.getByRole('button', { name: 'Ouvir' });
    expect(listen).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(listen);
    expect(onToggle).toHaveBeenCalled();
  });

  it('turns into "Parar" while the narration plays', () => {
    renderControls({ isPlaying: true });

    expect(screen.getByRole('button', { name: 'Parar' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('switches the audio description and tells whether it is on', () => {
    const { onToggleAudioDescription } = renderControls({
      withAudioDescription: false,
    });

    const switchButton = screen.getByRole('button', {
      name: 'Audiodescrição (AD)',
    });
    expect(switchButton).toHaveAttribute('aria-pressed', 'false');
    expect(switchButton).toHaveAttribute(
      'title',
      'Audiodescrição desligada: a narração pula a descrição das imagens'
    );
    fireEvent.click(switchButton);
    expect(onToggleAudioDescription).toHaveBeenCalled();
  });

  it('has no audio description switch when no image is described', () => {
    renderControls({ hasAudioDescription: false });

    expect(
      screen.queryByRole('button', { name: 'Audiodescrição (AD)' })
    ).toBeNull();
  });
});
