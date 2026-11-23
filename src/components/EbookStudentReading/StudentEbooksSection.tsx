import Button from '../Button/Button';
import ProgressBar from '../ProgressBar/ProgressBar';
import Text from '../Text/Text';
import { EbookCover } from '../EbookAttachment/EbookCover';
import { ebookKicker } from '../EbookAttachment/ebookAttachment.utils';
import type { StudentAttachedEbook } from '../../types/ebookAttachment';

export interface StudentEbooksSectionProps {
  /** The attached books, with the student's reading of each */
  ebooks: StudentAttachedEbook[];
  /** "Ver detalhes"; without it the cards have no button */
  onOpen?: (ebook: StudentAttachedEbook) => void;
}

/**
 * "Leitura do livro" of a student's modal (AE-3327): each book attached to
 * the activity or the recommended class, with how much of it the student has
 * seen. "Ver detalhes" opens where the student stopped and what they saw.
 */
export const StudentEbooksSection = ({
  ebooks,
  onOpen,
}: Readonly<StudentEbooksSectionProps>) => (
  <section className="flex flex-col gap-3" data-testid="student-ebooks-section">
    <Text as="h3" size="md" weight="bold" className="text-text-950">
      Leitura do livro
    </Text>
    <ul className="flex flex-col gap-2">
      {ebooks.map((ebook) => {
        const kicker = ebookKicker(ebook);
        const percent = Math.round(ebook.percent);
        return (
          <li
            key={ebook.id}
            className="flex items-center gap-3 rounded-xl border border-border-100 bg-background p-3"
            data-testid="student-ebook-card"
          >
            <div className="aspect-[2/3] w-12 shrink-0 overflow-hidden rounded">
              <EbookCover coverUrl={ebook.coverUrl} iconSize={20} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
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
                size="sm"
                weight="bold"
                className="line-clamp-2 text-text-950"
              >
                {ebook.title}
              </Text>
              <div className="flex items-center gap-2">
                <ProgressBar
                  value={percent}
                  size="small"
                  decorative
                  className="flex-1"
                />
                <Text size="xs" className="shrink-0 text-text-700">
                  {percent}% lido
                </Text>
              </div>
            </div>
            {onOpen && (
              <Button
                variant="outline"
                size="small"
                className="shrink-0"
                onClick={() => onOpen(ebook)}
                aria-label={`Ver detalhes da leitura de ${ebook.title}`}
              >
                Ver detalhes
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  </section>
);
