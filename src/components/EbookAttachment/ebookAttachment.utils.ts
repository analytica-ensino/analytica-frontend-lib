import type {
  AttachableEbook,
  EbookAttachmentTarget,
  EbookLibraryItem,
} from '../../types/ebookAttachment';

/**
 * "EB01 • EDUCAÇÃO FINANCEIRA": the code and the category above the title,
 * whichever of them the book has (shown in uppercase by the card).
 *
 * @param ebook - The book
 * @returns The line, empty when the book has neither
 */
export const ebookKicker = ({
  code,
  category,
}: Pick<AttachableEbook, 'code' | 'category'>): string =>
  [code, category].filter(Boolean).join(' • ');

/**
 * "4º ano • Ensino Fundamental, Anos Iniciais": the school years and the
 * segment under the title, whichever of them the book has.
 *
 * @param ebook - The book
 * @returns The line, empty when the book has neither
 */
export const ebookAudience = ({
  schoolYears,
  segment,
}: Pick<AttachableEbook, 'schoolYears' | 'segment'>): string =>
  [(schoolYears ?? []).join(', '), segment].filter(Boolean).join(' • ');

/**
 * "1 livro adicionado" / "2 livros adicionados".
 *
 * @param count - How many books are attached
 * @returns The label
 */
export const attachedEbooksLabel = (count: number): string =>
  count === 1 ? '1 livro adicionado' : `${count} livros adicionados`;

/**
 * "1 livro na estante" / "39 livros na estante".
 *
 * @param count - How many books match
 * @returns The label
 */
export const shelfCountLabel = (count: number): string =>
  count === 1 ? '1 livro na estante' : `${count} livros na estante`;

/** "Adicionar à aula" or "Adicionar à atividade", by where the books go. */
export const ADD_TO_TARGET_LABEL: Record<EbookAttachmentTarget, string> = {
  lesson: 'Adicionar à aula',
  activity: 'Adicionar à atividade',
};

/** Title of the selection page, by where the books go. */
export const PICKER_TITLE: Record<EbookAttachmentTarget, string> = {
  lesson: 'Adicionar livro à aula',
  activity: 'Adicionar livro à atividade',
};

/**
 * A library book as the attachment keeps it.
 *
 * @param item - The library book
 * @returns The attachable book
 */
export const toAttachableEbook = (item: EbookLibraryItem): AttachableEbook => ({
  id: item.id,
  code: item.code,
  title: item.title,
  subtitle: item.subtitle,
  coverUrl: item.coverUrl,
  category: item.category,
  segment: item.segment,
  schoolYears: item.schoolYears,
});

/**
 * Whether two lists attach the same books in the same order.
 *
 * @param a - One list
 * @param b - The other
 * @returns True when the ids match, position by position
 */
export const sameEbookIds = (
  a: readonly AttachableEbook[],
  b: readonly AttachableEbook[]
): boolean =>
  a.length === b.length && a.every((ebook, index) => ebook.id === b[index].id);
