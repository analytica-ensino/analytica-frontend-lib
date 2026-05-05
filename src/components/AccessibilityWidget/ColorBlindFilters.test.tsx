import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ColorBlindFilters from './ColorBlindFilters';
import {
  ColorBlindMode,
  getColorBlindFilterId,
} from '../../store/accessibilityStore';

describe('ColorBlindFilters', () => {
  it('renders the hidden SVG with the colorblind testid', () => {
    const { container } = render(<ColorBlindFilters />);
    expect(
      container.querySelector('[data-testid="a11y-colorblind-filters"]')
    ).toBeInTheDocument();
  });

  it.each<Exclude<ColorBlindMode, ColorBlindMode.None>>([
    ColorBlindMode.Protanopia,
    ColorBlindMode.Deuteranopia,
    ColorBlindMode.Tritanopia,
  ])('exposes a <filter> definition for %s with feColorMatrix', (mode) => {
    const { container } = render(<ColorBlindFilters />);
    const id = getColorBlindFilterId(mode);
    const filter = container.querySelector(`#${id}`);
    expect(filter).toBeInTheDocument();
    // Cada filter precisa ter ao menos uma matriz de cor
    expect(filter?.querySelector('feColorMatrix')).toBeInTheDocument();
  });

  it('renders the SVG aria-hidden so it does not pollute screen readers', () => {
    const { container } = render(<ColorBlindFilters />);
    const svg = container.querySelector(
      '[data-testid="a11y-colorblind-filters"]'
    );
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
