import { useState, type ReactNode } from 'react';
import Button from '../Button/Button';
import Text from '../Text/Text';
import { SkeletonRounded } from '../Skeleton/Skeleton';
import EbookReader, {
  type EbookMaterialType,
} from '../EbookReader/EbookReader';
import type { BaseApiClient } from '../../types/api';
import { useEbookPreview } from './useEbookPreview';

export interface EbookPreviewProps {
  apiClient: BaseApiClient;
  /** The book to open, student book or Guia do Professor */
  ebookId: string;
  onBack: () => void;
  /** Extra actions in the reader's header, whichever material is on screen */
  headerActions?: ReactNode;
  className?: string;
}

/**
 * A book of the staff library opened in the EBOOK 07 reader, in preview:
 * nothing is recorded. The "Livro do estudante" and "Guia do professor" tabs
 * switch to the other material of the title and back, when it has one.
 */
export const EbookPreview = ({
  apiClient,
  ebookId,
  onBack,
  headerActions,
  className,
}: Readonly<EbookPreviewProps>) => {
  const [shownId, setShownId] = useState(ebookId);
  const { preview, content, error } = useEbookPreview(apiClient, shownId);

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3 p-6">
        <Text size="sm" className="text-error-600" role="alert">
          Não foi possível abrir o livro.
        </Text>
        <Button variant="outline" size="small" onClick={onBack}>
          Voltar
        </Button>
      </div>
    );
  }

  if (!preview || !content) {
    return (
      <SkeletonRounded
        className="h-[70vh] w-full rounded-xl"
        data-testid="ebook-preview-loading"
      />
    );
  }

  const { details } = preview;
  const goToMaterial = (material: EbookMaterialType) => {
    if (material !== preview.materialType && preview.pairEbookId) {
      setShownId(preview.pairEbookId);
    }
  };

  return (
    <EbookReader
      content={content}
      title={preview.title}
      subtitle={[details.schoolYears.join(', '), details.theme]
        .filter(Boolean)
        .join(' · ')}
      mode="preview"
      material={preview.materialType}
      onMaterialChange={preview.pairEbookId ? goToMaterial : undefined}
      onBack={onBack}
      details={{
        code: details.code ?? undefined,
        theme: details.theme ?? undefined,
        audience: details.audience.join(', ') || undefined,
        authors: details.authors,
        bncc: details.bncc,
        words: details.words ?? undefined,
        readingMinutes: details.readingMinutes ?? undefined,
      }}
      headerActions={headerActions}
      className={className}
    />
  );
};
