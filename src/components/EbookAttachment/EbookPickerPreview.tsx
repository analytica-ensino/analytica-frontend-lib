import { useState } from 'react';
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';
import Button from '../Button/Button';
import Text from '../Text/Text';
import { SkeletonRounded } from '../Skeleton/Skeleton';
import EbookReader, {
  type EbookMaterialType,
} from '../EbookReader/EbookReader';
import type { BaseApiClient } from '../../types/api';
import { useEbookPreview } from './useEbookPreview';

export interface EbookPickerPreviewProps {
  apiClient: BaseApiClient;
  /** The student book opened from the grid */
  ebookId: string;
  selected: boolean;
  /** No more books fit; a selected one can still be removed */
  canAdd: boolean;
  /** "Adicionar à aula" or "Adicionar à atividade" */
  addLabel: string;
  onToggle: () => void;
  onBack: () => void;
}

/**
 * A book of the selection opened in the EBOOK 07 reader, in preview (nothing
 * is recorded). The tabs switch to its Guia do Professor and back; the
 * header button adds the student book to the selection, or takes it out,
 * whichever material is on screen.
 */
export const EbookPickerPreview = ({
  apiClient,
  ebookId,
  selected,
  canAdd,
  addLabel,
  onToggle,
  onBack,
}: Readonly<EbookPickerPreviewProps>) => {
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
      headerActions={
        selected ? (
          <Button size="small" onClick={onToggle}>
            Remover da seleção
          </Button>
        ) : (
          <Button
            size="small"
            iconLeft={<PlusIcon />}
            disabled={!canAdd}
            onClick={onToggle}
          >
            {addLabel}
          </Button>
        )
      }
    />
  );
};
