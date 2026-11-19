import { render, screen } from '@testing-library/react';
import {
  EbookReadingPeriodChart,
  readingsLabel,
} from './EbookReadingPeriodChart';

describe('EbookReadingPeriodChart', () => {
  it('draws the effective readings of each part of the period', () => {
    render(
      <EbookReadingPeriodChart
        data={{
          periods: [
            { label: 'JAN', effectiveReadings: 1 },
            { label: 'FEV', effectiveReadings: 1200 },
          ],
        }}
        loading={false}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Leituras realizadas por período' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('label-JAN')).toBeInTheDocument();
    expect(screen.getByText('FEV: 1.200 leituras')).toBeInTheDocument();
  });

  it('holds its place while it loads', () => {
    const { container } = render(
      <EbookReadingPeriodChart data={null} loading />
    );

    expect(container.querySelector('.h-\\[260px\\]')).toBeInTheDocument();
  });

  it('keeps the last series while a new one loads', () => {
    render(
      <EbookReadingPeriodChart
        data={{ periods: [{ label: 'Seg', effectiveReadings: 0 }] }}
        loading
      />
    );

    expect(screen.getByTestId('label-Seg')).toBeInTheDocument();
  });
});

describe('readingsLabel', () => {
  it('says "leitura" for one and "leituras" for the rest', () => {
    expect(readingsLabel(1)).toBe('1 leitura');
    expect(readingsLabel(0)).toBe('0 leituras');
    expect(readingsLabel(1234)).toBe('1.234 leituras');
  });
});
