import { detailRows, readingLabel } from './EbookReaderDetails';

describe('readingLabel', () => {
  it.each([
    [{ words: 1128, readingMinutes: 17 }, '1.128 palavras, cerca de 17 min'],
    [{ words: 884 }, '884 palavras'],
    [{ readingMinutes: 13 }, 'cerca de 13 min'],
    [{}, undefined],
  ])('reads %j as %s', (details, expected) => {
    expect(readingLabel(details)).toBe(expected);
  });
});

describe('detailRows', () => {
  it('keeps the design order and leaves the empty rows out', () => {
    expect(
      detailRows({ code: 'EB40', authors: ['A', 'B'], bncc: [], words: 10 })
    ).toEqual([
      ['Código', 'EB40'],
      ['Autoria', 'A, B'],
      ['Leitura', '10 palavras'],
    ]);
  });
});
