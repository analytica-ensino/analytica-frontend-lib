import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { FC } from 'react';
import {
  MicIconPapole,
  MicOffIconPapole,
  StopIconPapole,
  PlayIconPapole,
  PauseIconPapole,
} from './index';
import type { PapoleIconProps } from './types';

const getSvg = (container: HTMLElement): SVGSVGElement =>
  container.querySelector('svg') as SVGSVGElement;

/**
 * Every Papolê icon shares the same contract (PapoleIconProps): a single
 * decorative `<svg>` that maps `size` → width/height and forwards `className`.
 * Only the native default size differs.
 */
const ICONS: Array<{
  name: string;
  Icon: FC<PapoleIconProps>;
  defaultSize: number;
}> = [
  { name: 'MicIconPapole', Icon: MicIconPapole, defaultSize: 24 },
  { name: 'MicOffIconPapole', Icon: MicOffIconPapole, defaultSize: 24 },
  { name: 'StopIconPapole', Icon: StopIconPapole, defaultSize: 24 },
  { name: 'PlayIconPapole', Icon: PlayIconPapole, defaultSize: 30 },
  { name: 'PauseIconPapole', Icon: PauseIconPapole, defaultSize: 30 },
];

describe.each(ICONS)('$name', ({ name, Icon, defaultSize }) => {
  it('renders a single svg', () => {
    const { container } = render(<Icon />);
    expect(container.querySelectorAll('svg')).toHaveLength(1);
  });

  it('uses the native default size', () => {
    const { container } = render(<Icon />);
    const svg = getSvg(container);
    expect(svg).toHaveAttribute('width', String(defaultSize));
    expect(svg).toHaveAttribute('height', String(defaultSize));
  });

  it('applies a custom size to both width and height', () => {
    const { container } = render(<Icon size={48} />);
    const svg = getSvg(container);
    expect(svg).toHaveAttribute('width', '48');
    expect(svg).toHaveAttribute('height', '48');
  });

  it('forwards className to the root svg', () => {
    const { container } = render(<Icon className="text-primary" />);
    expect(getSvg(container)).toHaveClass('text-primary');
  });

  it('is decorative (aria-hidden)', () => {
    const { container } = render(<Icon />);
    expect(getSvg(container)).toHaveAttribute('aria-hidden', 'true');
  });

  it('exposes the correct displayName', () => {
    expect((Icon as FC & { displayName?: string }).displayName).toBe(name);
  });
});

describe('PauseIconPapole mask ids', () => {
  it('references its mask via a colon-free unique id', () => {
    const { container } = render(<PauseIconPapole />);

    const mask = container.querySelector('mask') as SVGMaskElement;
    const maskId = mask.getAttribute('id') as string;

    // useId() yields ":r0:"-style values; the component strips the colons so the
    // id is a valid selector.
    expect(maskId).not.toContain(':');

    const maskedPath = container.querySelector('path[mask]') as SVGPathElement;
    expect(maskedPath.getAttribute('mask')).toBe(`url(#${maskId})`);
  });

  it('gives each instance a distinct mask id (no collision)', () => {
    const { container } = render(
      <div>
        <PauseIconPapole />
        <PauseIconPapole />
      </div>
    );

    const ids = Array.from(container.querySelectorAll('mask')).map((mask) =>
      mask.getAttribute('id')
    );

    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });
});
