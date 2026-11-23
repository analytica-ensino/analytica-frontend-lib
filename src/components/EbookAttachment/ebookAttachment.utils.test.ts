import {
  attachedEbooksLabel,
  ebookAudience,
  ebookKicker,
  sameEbookIds,
  shelfCountLabel,
  toAttachableEbook,
} from './ebookAttachment.utils';
import type { EbookLibraryItem } from '../../types/ebookAttachment';

const item: EbookLibraryItem = {
  id: 'eb-1',
  code: 'EB01',
  title: 'Meu pé de laranja lima',
  subtitle: null,
  authors: ['Ana Autora'],
  coverUrl: 'https://cdn.test/eb-1.png',
  category: 'Educação Financeira',
  theme: { code: 'I', name: 'Educação 4.0 e 5.0' },
  segment: 'Anos Iniciais',
  schoolYears: ['4º ano'],
};

describe('ebookAttachment utils', () => {
  it('joins the code and the category, whichever the book has', () => {
    expect(ebookKicker(item)).toBe('EB01 • Educação Financeira');
    expect(ebookKicker({ code: null, category: 'Leitura' })).toBe('Leitura');
    expect(ebookKicker({ code: null, category: null })).toBe('');
  });

  it('joins the school years and the segment, whichever the book has', () => {
    expect(ebookAudience(item)).toBe('4º ano • Anos Iniciais');
    expect(
      ebookAudience({ schoolYears: ['4º ano', '5º ano'], segment: null })
    ).toBe('4º ano, 5º ano');
    // A draft saved before the backend sent them
    expect(ebookAudience({})).toBe('');
  });

  it('counts in the singular and the plural', () => {
    expect(attachedEbooksLabel(1)).toBe('1 livro adicionado');
    expect(attachedEbooksLabel(2)).toBe('2 livros adicionados');
    expect(shelfCountLabel(1)).toBe('1 livro na estante');
    expect(shelfCountLabel(39)).toBe('39 livros na estante');
  });

  it('keeps what the card shows of a library book', () => {
    expect(toAttachableEbook(item)).toEqual({
      id: 'eb-1',
      code: 'EB01',
      title: 'Meu pé de laranja lima',
      subtitle: null,
      coverUrl: 'https://cdn.test/eb-1.png',
      category: 'Educação Financeira',
      segment: 'Anos Iniciais',
      schoolYears: ['4º ano'],
    });
  });

  it('compares the attached books by id and order', () => {
    const a = toAttachableEbook(item);
    const b = toAttachableEbook({ ...item, id: 'eb-2' });

    expect(sameEbookIds([a, b], [{ ...a, title: 'Outro' }, b])).toBe(true);
    expect(sameEbookIds([a, b], [b, a])).toBe(false);
    expect(sameEbookIds([a], [a, b])).toBe(false);
    expect(sameEbookIds([], [])).toBe(true);
  });
});
