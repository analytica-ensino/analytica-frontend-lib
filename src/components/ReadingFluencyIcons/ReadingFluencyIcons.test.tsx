import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { FC } from 'react';
import {
  MicIconReadingFluency,
  MicOffIconReadingFluency,
  StopIconReadingFluency,
  PlayIconReadingFluency,
  PauseIconReadingFluency,
  CloseIconReadingFluency,
  BookIconReadingFluency,
  MathIconReadingFluency,
  MathCoverIconReadingFluency,
  NextIconReadingFluency,
  TicoVoiceIconReadingFluency,
} from './index';
import type { ReadingFluencyIconProps } from './types';

const getSvg = (container: HTMLElement): SVGSVGElement =>
  container.querySelector('svg') as SVGSVGElement;

/**
 * Every Reading Fluency icon shares the same contract (ReadingFluencyIconProps): a single
 * decorative `<svg>` that maps `size` → width/height and forwards `className`.
 * Only the native default size differs.
 */
const ICONS: Array<{
  name: string;
  Icon: FC<ReadingFluencyIconProps>;
  defaultSize: number;
}> = [
  {
    name: 'MicIconReadingFluency',
    Icon: MicIconReadingFluency,
    defaultSize: 24,
  },
  {
    name: 'MicOffIconReadingFluency',
    Icon: MicOffIconReadingFluency,
    defaultSize: 24,
  },
  {
    name: 'StopIconReadingFluency',
    Icon: StopIconReadingFluency,
    defaultSize: 24,
  },
  {
    name: 'PlayIconReadingFluency',
    Icon: PlayIconReadingFluency,
    defaultSize: 30,
  },
  {
    name: 'PauseIconReadingFluency',
    Icon: PauseIconReadingFluency,
    defaultSize: 30,
  },
  {
    name: 'CloseIconReadingFluency',
    Icon: CloseIconReadingFluency,
    defaultSize: 37,
  },
  {
    name: 'BookIconReadingFluency',
    Icon: BookIconReadingFluency,
    defaultSize: 32,
  },
  {
    name: 'MathIconReadingFluency',
    Icon: MathIconReadingFluency,
    defaultSize: 32,
  },
  {
    name: 'NextIconReadingFluency',
    Icon: NextIconReadingFluency,
    defaultSize: 24,
  },
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

describe('PauseIconReadingFluency mask ids', () => {
  it('references its mask via a colon-free unique id', () => {
    const { container } = render(<PauseIconReadingFluency />);

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
        <PauseIconReadingFluency />
        <PauseIconReadingFluency />
      </div>
    );

    const ids = Array.from(container.querySelectorAll('mask')).map((mask) =>
      mask.getAttribute('id')
    );

    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });
});

describe('CloseIconReadingFluency shadow filter ids', () => {
  it('references its drop-shadow filter via a colon-free unique id', () => {
    const { container } = render(<CloseIconReadingFluency />);

    const filter = container.querySelector('filter') as SVGFilterElement;
    const filterId = filter.getAttribute('id') as string;

    expect(filterId).not.toContain(':');

    const group = container.querySelector('g[filter]') as SVGGElement;
    expect(group.getAttribute('filter')).toBe(`url(#${filterId})`);
  });

  it('gives each instance a distinct filter id (no collision)', () => {
    const { container } = render(
      <div>
        <CloseIconReadingFluency />
        <CloseIconReadingFluency />
      </div>
    );

    const ids = Array.from(container.querySelectorAll('filter')).map((filter) =>
      filter.getAttribute('id')
    );

    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });
});

/**
 * Ilustrações que não são quadradas: `size` define a largura e a altura sai
 * proporcional ao viewBox nativo.
 */
const NON_SQUARE_ICONS: Array<{
  name: string;
  Icon: FC<ReadingFluencyIconProps>;
  width: number;
  height: number;
}> = [
  {
    name: 'MathCoverIconReadingFluency',
    Icon: MathCoverIconReadingFluency,
    width: 76,
    height: 95,
  },
  {
    name: 'TicoVoiceIconReadingFluency',
    Icon: TicoVoiceIconReadingFluency,
    width: 61,
    height: 50,
  },
];

describe.each(NON_SQUARE_ICONS)('$name', ({ name, Icon, width, height }) => {
  it('uses the native size and viewBox by default', () => {
    const { container } = render(<Icon />);
    const svg = getSvg(container);
    expect(svg).toHaveAttribute('width', String(width));
    expect(svg).toHaveAttribute('height', String(height));
    expect(svg).toHaveAttribute('viewBox', `0 0 ${width} ${height}`);
  });

  it('treats size as the width and keeps the aspect ratio', () => {
    const { container } = render(<Icon size={width * 2} />);
    const svg = getSvg(container);
    expect(svg).toHaveAttribute('width', String(width * 2));
    expect(svg).toHaveAttribute('height', String(height * 2));
  });

  it('forwards className and is decorative', () => {
    const { container } = render(<Icon className="h-full w-full" />);
    const svg = getSvg(container);
    expect(svg).toHaveClass('h-full', 'w-full');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('exposes the correct displayName', () => {
    expect((Icon as FC & { displayName?: string }).displayName).toBe(name);
  });
});

describe('NextIconReadingFluency', () => {
  it('paints with currentColor so it follows the button text color', () => {
    const { container } = render(<NextIconReadingFluency />);
    expect(container.querySelector('path')).toHaveAttribute(
      'fill',
      'currentColor'
    );
  });
});

describe.each([
  { name: 'MathCoverIconReadingFluency', Icon: MathCoverIconReadingFluency },
  { name: 'MathIconReadingFluency', Icon: MathIconReadingFluency },
  { name: 'BookIconReadingFluency', Icon: BookIconReadingFluency },
])('$name ids', ({ Icon }) => {
  it('references its defs through colon-free ids that exist in the svg', () => {
    const { container } = render(<Icon />);

    const ids = Array.from(container.querySelectorAll('[id]')).map(
      (node) => node.getAttribute('id') as string
    );
    expect(ids.length).toBeGreaterThan(0);
    ids.forEach((id) => expect(id).not.toMatch(/[^a-zA-Z0-9_-]/));

    const refs = Array.from(
      container.querySelectorAll('[filter], [clip-path]')
    ).map(
      (node) =>
        (node.getAttribute('filter') ??
          node.getAttribute('clip-path')) as string
    );
    expect(refs.length).toBeGreaterThan(0);
    refs.forEach((ref) => {
      const id = /url\(#(.+)\)/.exec(ref)?.[1];
      expect(ids).toContain(id);
    });
  });

  it('gives each instance distinct ids (no collision between cards)', () => {
    const { container } = render(
      <div>
        <Icon />
        <Icon />
      </div>
    );
    const [first, second] = Array.from(container.querySelectorAll('svg'));
    const firstIds = Array.from(first.querySelectorAll('[id]')).map((node) =>
      node.getAttribute('id')
    );
    const secondIds = Array.from(second.querySelectorAll('[id]')).map((node) =>
      node.getAttribute('id')
    );
    firstIds.forEach((id) => expect(secondIds).not.toContain(id));
  });
});
