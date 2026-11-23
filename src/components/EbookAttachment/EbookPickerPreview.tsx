import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';
import Button from '../Button/Button';
import type { BaseApiClient } from '../../types/api';
import { EbookPreview } from './EbookPreview';

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
 * A book of the selection opened in preview (`EbookPreview`). The header
 * button adds the student book to the selection, or takes it out, whichever
 * material is on screen.
 */
export const EbookPickerPreview = ({
  apiClient,
  ebookId,
  selected,
  canAdd,
  addLabel,
  onToggle,
  onBack,
}: Readonly<EbookPickerPreviewProps>) => (
  <EbookPreview
    apiClient={apiClient}
    ebookId={ebookId}
    onBack={onBack}
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
