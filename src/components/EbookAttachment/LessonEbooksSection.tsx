import { BookOpenTextIcon } from '@phosphor-icons/react/dist/csr/BookOpenText';
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash';
import Button from '../Button/Button';
import Divider from '../Divider/Divider';
import Text from '../Text/Text';
import { EbookCover } from './EbookCover';
import {
  attachedEbooksLabel,
  ebookAudience,
  ebookKicker,
} from './ebookAttachment.utils';
import type { AttachableEbook } from '../../types/ebookAttachment';

export interface LessonEbooksSectionProps {
  /** The attached books, in order */
  ebooks: AttachableEbook[];
  /** Opens the selection page */
  onAdd: () => void;
  onRemove: (ebookId: string) => void;
  onRemoveAll: () => void;
}

/**
 * "Livro da aula" (AE-3325): the books attached to the activity or the
 * recommended class being built, below its preview. Empty, only the button to
 * add; with books, their count, "Remover tudo", one card per book with its
 * own trash button, and the button to add more.
 */
export const LessonEbooksSection = ({
  ebooks,
  onAdd,
  onRemove,
  onRemoveAll,
}: Readonly<LessonEbooksSectionProps>) => (
  <section
    aria-labelledby="lesson-ebooks-title"
    className="flex flex-col gap-4"
    data-testid="lesson-ebooks-section"
  >
    <Divider />
    <div className="flex flex-row items-center gap-2 text-text-950">
      <BookOpenTextIcon size={24} aria-hidden="true" />
      <Text as="h3" id="lesson-ebooks-title" size="lg" weight="bold">
        Livro da aula
      </Text>
    </div>

    {ebooks.length > 0 && (
      <>
        <div className="flex flex-row items-center justify-between gap-2">
          <Text
            size="sm"
            className="rounded-full bg-background-100 px-3 py-1 text-text-800"
          >
            {attachedEbooksLabel(ebooks.length)}
          </Text>
          <Button
            variant="link"
            action="negative"
            size="small"
            iconLeft={<TrashIcon />}
            onClick={onRemoveAll}
          >
            Remover tudo
          </Button>
        </div>

        <ul className="flex flex-col gap-3">
          {ebooks.map((ebook) => {
            const kicker = ebookKicker(ebook);
            const audience = ebookAudience(ebook);
            return (
              <li
                key={ebook.id}
                className="flex flex-row items-center gap-3 rounded-lg border border-border-100 bg-background p-3"
                data-testid="lesson-ebook-card"
              >
                <div className="h-16 w-12 shrink-0 overflow-hidden rounded">
                  <EbookCover coverUrl={ebook.coverUrl} iconSize={20} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  {kicker && (
                    <Text
                      size="2xs"
                      weight="semibold"
                      className="truncate uppercase text-text-600"
                    >
                      {kicker}
                    </Text>
                  )}
                  <Text
                    size="md"
                    weight="bold"
                    className="line-clamp-2 text-text-950"
                  >
                    {ebook.title}
                  </Text>
                  {audience && (
                    <Text size="xs" className="truncate text-text-700">
                      {audience}
                    </Text>
                  )}
                </div>
                <Button
                  variant="link"
                  action="secondary"
                  onClick={() => onRemove(ebook.id)}
                  aria-label={`Remover o livro ${ebook.title}`}
                  className="shrink-0 px-0"
                >
                  <TrashIcon size={24} color="currentColor" />
                </Button>
              </li>
            );
          })}
        </ul>
      </>
    )}

    <Button
      variant="outline"
      action="primary"
      onClick={onAdd}
      className="w-full"
    >
      Adicionar livro
    </Button>
  </section>
);
