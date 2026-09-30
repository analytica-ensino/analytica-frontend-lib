import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {
  ENEM_MOMENT_PERFORMANCE_LABELS,
  ENEM_MOMENT_PERFORMANCE_ORDER,
  EnemMomentPerformanceBadge,
  EnemMomentTierBadge,
  ParticipationBadge,
  readableTextColor,
} from './PerformanceBadge';
import type { EnemMomentPerformance } from './types';

const mockTheme = { isDark: false };

jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({ isDark: mockTheme.isDark }),
}));

describe('ENEM_MOMENT_PERFORMANCE_ORDER', () => {
  it('lists the tiers best first, "Não participou" last', () => {
    expect(ENEM_MOMENT_PERFORMANCE_ORDER).toEqual([
      'HIGHLIGHT',
      'ABOVE_AVERAGE',
      'BELOW_AVERAGE',
      'ATTENTION_POINT',
      'NO_EXAM',
    ]);
  });
});

describe('readableTextColor', () => {
  it('writes near-black on a light fill, the yellow tier included', () => {
    expect(readableTextColor('#ffffff')).toBe('#171717');
    expect(readableTextColor('#f8cc2e')).toBe('#171717');
    expect(readableTextColor('#e5e5e5')).toBe('#171717');
  });

  it('writes white on a darker fill', () => {
    expect(readableTextColor('#000000')).toBe('#ffffff');
    expect(readableTextColor('#66b584')).toBe('#ffffff');
    expect(readableTextColor('#fb954b')).toBe('#ffffff');
    expect(readableTextColor('#b91c1c')).toBe('#ffffff');
  });

  it('reads a color without the hash', () => {
    expect(readableTextColor('ffffff')).toBe('#171717');
  });
});

describe('EnemMomentPerformanceBadge', () => {
  beforeEach(() => {
    mockTheme.isDark = false;
  });

  it.each<[EnemMomentPerformance, string, string, string]>([
    ['HIGHLIGHT', 'DESTAQUE', '#66b584', '#ffffff'],
    ['ABOVE_AVERAGE', 'ACIMA DA MÉDIA', '#f8cc2e', '#171717'],
    ['BELOW_AVERAGE', 'ABAIXO DA MÉDIA', '#fb954b', '#ffffff'],
    ['ATTENTION_POINT', 'PONTO DE ATENÇÃO', '#b91c1c', '#ffffff'],
    ['NO_EXAM', 'NÃO PARTICIPOU', '#2f2f2f', '#ffffff'],
  ])(
    '%s reads "%s" in the fill of its pie slice',
    (performance, label, backgroundColor, color) => {
      render(<EnemMomentPerformanceBadge performance={performance} />);

      expect(ENEM_MOMENT_PERFORMANCE_LABELS[performance]).toBe(label);
      expect(screen.getByText(label)).toHaveStyle({ backgroundColor, color });
    }
  );

  it('flips "Não participou" to a light neutral in the dark theme', () => {
    mockTheme.isDark = true;
    render(<EnemMomentPerformanceBadge performance="NO_EXAM" />);

    expect(screen.getByText('NÃO PARTICIPOU')).toHaveStyle({
      backgroundColor: '#e5e5e5',
      color: '#171717',
    });
  });

  it('keeps the tier colors in the dark theme: they are the map’s', () => {
    mockTheme.isDark = true;
    render(<EnemMomentPerformanceBadge performance="HIGHLIGHT" />);

    expect(screen.getByText('DESTAQUE')).toHaveStyle({
      backgroundColor: '#66b584',
    });
  });
});

describe('EnemMomentTierBadge', () => {
  it('writes whatever it is given in the color of the tier', () => {
    render(
      <EnemMomentTierBadge performance="ATTENTION_POINT">
        3 estudantes
      </EnemMomentTierBadge>
    );

    expect(screen.getByText('3 estudantes')).toHaveStyle({
      backgroundColor: '#b91c1c',
    });
  });
});

describe('ParticipationBadge', () => {
  beforeEach(() => {
    mockTheme.isDark = false;
  });

  it('reads "Participou" in the green of Destaque, with no hint', () => {
    render(<ParticipationBadge participation="PARTICIPATED" />);

    expect(screen.getByText('PARTICIPOU')).toHaveStyle({
      backgroundColor: '#66b584',
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('reads "Não participou" in the neutral of who took nothing', () => {
    render(<ParticipationBadge participation="NOT_PARTICIPATED" />);

    expect(screen.getByText('NÃO PARTICIPOU')).toHaveStyle({
      backgroundColor: '#2f2f2f',
    });
  });

  it('explains, on hover, a student who took one moment only', async () => {
    const user = userEvent.setup();
    render(<ParticipationBadge participation="PARTIAL" />);

    const label = screen.getByText('PARTICIPOU');
    expect(label.parentElement).toHaveStyle({ backgroundColor: '#66b584' });
    expect(
      screen.getByLabelText('Participou em somente 1 momento')
    ).toBeInTheDocument();

    await user.hover(label);
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Participou em somente 1 momento'
    );
  });

  it('puts the hint in a portal, out of the cell that would clip it', async () => {
    const user = userEvent.setup();
    render(<ParticipationBadge participation="PARTIAL" />);

    await user.hover(screen.getByText('PARTICIPOU'));

    expect(screen.getByRole('tooltip').parentElement).toBe(document.body);
  });
});
