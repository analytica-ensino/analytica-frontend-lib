import { render, screen, within } from '@testing-library/react';
import {
  EbookReadingMunicipalities,
  rankMunicipalities,
} from './EbookReadingMunicipalities';
import type { EbookReadingGroupRow } from './types';

/** A municipality with its share of readers. */
const municipality = (
  name: string,
  readerRate: number,
  readers = 10
): EbookReadingGroupRow => ({
  id: `PR:${name}`,
  name,
  schoolYearName: null,
  municipality: null,
  state: 'PR',
  totalStudents: 20,
  readers,
  readerRate,
  accesses: 30,
  effectiveReadings: 5,
  totalTimeSeconds: 600,
  averageTimeSeconds: 60,
  averageProgress: 40,
});

const ROWS = [
  municipality('Curitiba', 90),
  municipality('Londrina', 50),
  municipality('Maringá', 70),
  municipality('Cascavel', 10),
  municipality('Toledo', 20),
  municipality('Ponta Grossa', 30),
  municipality('Foz do Iguaçu', 60),
];

/** The names in a list. */
const names = (rows: EbookReadingGroupRow[]) => rows.map((row) => row.name);

describe('rankMunicipalities', () => {
  it('takes the three highest and the three lowest shares of readers', () => {
    const { highlight, attention } = rankMunicipalities(ROWS);

    expect(names(highlight)).toEqual(['Curitiba', 'Maringá', 'Foz do Iguaçu']);
    expect(names(attention)).toEqual(['Cascavel', 'Toledo', 'Ponta Grossa']);
  });

  it('puts a municipality in one card only when there are few', () => {
    const { highlight, attention } = rankMunicipalities(ROWS.slice(0, 4));

    expect(names(highlight)).toEqual(['Curitiba', 'Maringá', 'Londrina']);
    expect(names(attention)).toEqual(['Cascavel']);
  });

  it('breaks a tie by readers, then by name', () => {
    const { highlight } = rankMunicipalities([
      municipality('Toledo', 50, 5),
      municipality('Cascavel', 50, 5),
      municipality('Londrina', 50, 9),
    ]);

    expect(names(highlight)).toEqual(['Londrina', 'Cascavel', 'Toledo']);
  });
});

describe('EbookReadingMunicipalities', () => {
  it('shows the municipalities in highlight and needing attention', () => {
    render(<EbookReadingMunicipalities rows={ROWS} loading={false} />);

    const highlight = screen
      .getByText('Municípios em destaque')
      .closest('div[class*="rounded"]') as HTMLElement;
    expect(within(highlight).getByText('Curitiba')).toBeInTheDocument();
    expect(within(highlight).getByText('90% de leitura')).toBeInTheDocument();
    expect(
      screen.getByText('Municípios precisando de atenção')
    ).toBeInTheDocument();
    expect(screen.getByText('10% de leitura')).toBeInTheDocument();
  });

  it('holds its place while it loads', () => {
    const { container } = render(
      <EbookReadingMunicipalities rows={null} loading />
    );

    expect(container.querySelectorAll('.h-\\[220px\\]')).toHaveLength(2);
  });

  it('says when there is no municipality', () => {
    render(<EbookReadingMunicipalities rows={[]} loading={false} />);

    expect(
      screen.getByText('Nenhum município no período.')
    ).toBeInTheDocument();
  });
});
