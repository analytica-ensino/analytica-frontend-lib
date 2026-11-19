import { render, screen } from '@testing-library/react';
import { ReadingTierBadge } from './ReadingTierBadge';
import { READING_TIER } from './types';

describe('ReadingTierBadge', () => {
  it.each([
    [READING_TIER.HIGHLIGHT, 'Destaque', '--color-map-highlight'],
    [READING_TIER.ABOVE_AVERAGE, 'Acima da média', '--color-map-above-avg'],
    [READING_TIER.BELOW_AVERAGE, 'Abaixo da média', '--color-map-below-avg'],
    [READING_TIER.ATTENTION, 'Ponto de atenção', '--color-map-attention'],
    [READING_TIER.NONE, 'Sem leitura', '--color-map-no-access'],
  ])('draws the %s tier in the access map color', (tier, label, token) => {
    render(<ReadingTierBadge tier={tier} />);

    const badge = screen.getByTestId(`reading-tier-${tier}`);
    expect(badge).toHaveTextContent(label);
    expect(badge.getAttribute('style')).toContain(`var(${token}`);
  });
});
