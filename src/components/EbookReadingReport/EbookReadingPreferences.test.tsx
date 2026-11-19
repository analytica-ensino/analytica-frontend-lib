import { render, screen } from '@testing-library/react';
import { EbookReadingPreferences } from './EbookReadingPreferences';
import type { EbookRankingDimension } from './types';

describe('EbookReadingPreferences', () => {
  it('holds the place of the two cards while the ranking loads', () => {
    const { container } = render(
      <EbookReadingPreferences
        dimension="EBOOK"
        onDimensionChange={jest.fn()}
        data={null}
        loading
      />
    );

    expect(screen.queryByText('Livros mais lidos')).toBeNull();
    expect(container.querySelectorAll('.h-\\[220px\\]')).toHaveLength(2);
  });

  it('falls back to the books tab for a dimension it has no tab for', () => {
    render(
      <EbookReadingPreferences
        dimension={'SECTION' as EbookRankingDimension}
        onDimensionChange={jest.fn()}
        data={{ mostRead: [], leastRead: [] }}
        loading={false}
      />
    );

    expect(screen.getByText('Livros mais lidos')).toBeInTheDocument();
    expect(screen.getAllByText('Nenhuma leitura no período.')).toHaveLength(2);
  });
});
