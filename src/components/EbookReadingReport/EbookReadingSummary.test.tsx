import { render, screen } from '@testing-library/react';
import { EbookReadingSummary, buildSummaryCards } from './EbookReadingSummary';
import type { EbookReadingMetrics } from './types';

const METRICS: EbookReadingMetrics = {
  totalStudents: 16778,
  readers: 48,
  readerRate: 40.5,
  accesses: 9,
  effectiveReadings: 2,
  totalTimeSeconds: 7200,
  averageTimeSeconds: 1500,
  averageProgress: 55,
};

describe('EbookReadingSummary', () => {
  it('builds one card per measure, in the order of the Figma', () => {
    const cards = buildSummaryCards(METRICS);

    expect(cards.map((card) => [card.label, card.value])).toEqual([
      ['Leituras realizadas', '2'],
      ['Total de estudantes', '16.778'],
      ['Estudantes leitores', '48'],
      ['Acessos', '9'],
      ['Tempo em leitura', '2h'],
      ['Progresso médio', '55%'],
    ]);
    expect(cards[2].subtitle).toBe('40,5% dos estudantes');
    expect(cards[4].subtitle).toBe('25min por leitor');
  });

  it('holds the place of the cards while they load', () => {
    const { container } = render(<EbookReadingSummary data={null} loading />);

    expect(screen.queryByText('Acessos')).toBeNull();
    expect(container.querySelectorAll('.h-\\[104px\\]')).toHaveLength(6);
  });

  it('keeps the last cards while new ones load', () => {
    render(<EbookReadingSummary data={METRICS} loading />);

    expect(screen.getByText('16.778')).toBeInTheDocument();
  });
});
