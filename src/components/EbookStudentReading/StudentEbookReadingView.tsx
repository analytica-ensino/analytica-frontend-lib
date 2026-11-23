import { useState } from 'react';
import { CaretLeftIcon } from '@phosphor-icons/react/dist/csr/CaretLeft';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle';
import { XCircleIcon } from '@phosphor-icons/react/dist/csr/XCircle';
import Badge from '../Badge/Badge';
import Button from '../Button/Button';
import ProgressBar from '../ProgressBar/ProgressBar';
import { SkeletonRounded } from '../Skeleton/Skeleton';
import Text from '../Text/Text';
import EbookReader from '../EbookReader/EbookReader';
import { ebookKicker } from '../EbookAttachment/ebookAttachment.utils';
import { useEbookPreview } from '../EbookAttachment/useEbookPreview';
import type { BaseApiClient } from '../../types/api';
import type { StudentAttachedEbook } from '../../types/ebookAttachment';
import {
  STUDENT_READING_STATUS_BADGE,
  chaptersSeenLabel,
  stoppedAtTitle,
  studentReadingStatus,
} from './studentEbookReading.utils';
import { useStudentEbookReading } from './useStudentEbookReading';

/**
 * The title of a student's modal while a book's reading is open: "Leitura do
 * livro", with the arrow back to the modal's content.
 */
export const StudentEbookReadingTitle = ({
  onBack,
}: Readonly<{ onBack: () => void }>) => (
  <span className="flex items-center gap-2">
    <button
      type="button"
      onClick={onBack}
      aria-label="Voltar"
      className="flex items-center rounded text-text-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-info"
    >
      <CaretLeftIcon size={20} aria-hidden="true" />
    </button>
    Leitura do livro
  </span>
);

/**
 * The book in preview, one page at a time, boxed in the reading screen. "Ir
 * para onde parou" reopens it at the section the student stopped at.
 */
const ReadingPreview = ({
  apiClient,
  ebookId,
  lastSection,
}: Readonly<{
  apiClient: BaseApiClient;
  ebookId: string;
  lastSection: string | null;
}>) => {
  const { preview, content, error } = useEbookPreview(apiClient, ebookId);
  // Each jump remounts the reader at the student's section
  const [jumps, setJumps] = useState(0);

  let body;
  if (error) {
    body = (
      <Text size="sm" className="text-error-600" role="alert">
        Não foi possível abrir o livro.
      </Text>
    );
  } else if (!preview || !content) {
    body = (
      <SkeletonRounded
        className="h-full w-full rounded-lg"
        data-testid="student-ebook-preview-loading"
      />
    );
  } else {
    body = (
      <EbookReader
        key={jumps}
        content={content}
        title={preview.title}
        mode="preview"
        variant="compact"
        material={preview.materialType}
        initialSection={jumps > 0 ? (lastSection ?? undefined) : undefined}
        className="h-full"
      />
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3 bg-background-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <Text as="h4" size="md" weight="bold" className="text-text-950">
          Prévia do livro
        </Text>
        {lastSection && (
          <Button
            variant="link"
            size="small"
            onClick={() => setJumps((value) => value + 1)}
            disabled={!content}
          >
            Ir para onde parou
          </Button>
        )}
      </div>
      <div className="h-[420px]" data-testid="student-ebook-preview">
        {body}
      </div>
    </div>
  );
};

export interface StudentEbookReadingViewProps {
  apiClient: BaseApiClient;
  /** The book, as the "Leitura do livro" card shows it */
  ebook: StudentAttachedEbook;
  /** The student's enrollment */
  userInstitutionId: string;
}

/**
 * "Acompanhamento de leitura" (AE-3327): where the student stopped in an
 * attached book, how many of its chapters they saw, the book in preview
 * (nothing is recorded) with "Ir para onde parou", and each chapter as read
 * or not.
 */
export const StudentEbookReadingView = ({
  apiClient,
  ebook,
  userInstitutionId,
}: Readonly<StudentEbookReadingViewProps>) => {
  const { reading, error, retry } = useStudentEbookReading(
    apiClient,
    ebook.id,
    userInstitutionId
  );
  const kicker = ebookKicker(ebook);

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3" role="alert">
        <Text size="sm" className="text-error-600">
          Não foi possível carregar a leitura do estudante.
        </Text>
        <Button variant="outline" size="small" onClick={retry}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!reading) {
    return (
      <SkeletonRounded
        className="h-[480px] w-full rounded-xl"
        data-testid="student-ebook-reading-loading"
      />
    );
  }

  const badge =
    STUDENT_READING_STATUS_BADGE[studentReadingStatus(reading.progress)];
  const stoppedAt = stoppedAtTitle(reading);
  const total = reading.sections.length;
  const seen = reading.sections.filter((entry) => entry.seenAt).length;

  return (
    <div className="flex flex-col gap-6" data-testid="student-ebook-reading">
      <section className="flex flex-col gap-3">
        <Text as="h3" size="md" weight="bold" className="text-text-950">
          Acompanhamento de leitura
        </Text>
        <div className="flex flex-col overflow-hidden rounded-xl border border-border-100 md:flex-row">
          <div className="flex flex-col justify-between gap-6 p-4 md:w-2/5">
            <div className="flex flex-col items-start gap-2">
              {kicker && (
                <Text
                  size="2xs"
                  weight="semibold"
                  className="uppercase text-text-600"
                >
                  {kicker}
                </Text>
              )}
              <Text size="lg" weight="bold" className="text-text-950">
                {ebook.title}
              </Text>
              <Badge variant="solid" action={badge.action}>
                {badge.label}
              </Badge>
            </div>
            <div className="flex flex-col gap-1">
              <Text size="xs" className="text-text-600">
                O estudante parou em
              </Text>
              <Text size="md" weight="bold" className="text-text-950">
                {stoppedAt ?? '-'}
              </Text>
              <div className="flex items-center gap-2">
                <ProgressBar
                  value={seen}
                  max={Math.max(total, 1)}
                  size="small"
                  decorative
                  className="flex-1"
                />
                <Text size="xs" className="shrink-0 text-text-700">
                  {chaptersSeenLabel(seen, total)}
                </Text>
              </div>
            </div>
          </div>
          <ReadingPreview
            apiClient={apiClient}
            ebookId={ebook.id}
            lastSection={reading.progress?.lastSection ?? null}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Text as="h3" size="md" weight="bold" className="text-text-950">
          Capítulos
        </Text>
        <ol className="flex flex-col gap-2">
          {reading.sections.map((entry) => (
            <li
              key={entry.section}
              className="flex items-center justify-between gap-3 rounded-lg border border-border-100 bg-background px-4 py-3"
              data-testid="student-ebook-chapter"
            >
              <Text size="sm" weight="medium" className="text-text-950">
                {entry.title}
              </Text>
              {entry.seenAt ? (
                <Badge
                  variant="solid"
                  action="success"
                  iconLeft={<CheckCircleIcon aria-hidden="true" />}
                >
                  Leu
                </Badge>
              ) : (
                <Badge
                  variant="solid"
                  action="error"
                  iconLeft={<XCircleIcon aria-hidden="true" />}
                >
                  Não leu
                </Badge>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};
