import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import Modal from '../Modal/Modal';
import Input from '../Input/Input';
import Button from '../Button/Button';

const TITLE_MAX_LENGTH = 255;

/**
 * SaveActivityModelModal component props
 */
export interface SaveActivityModelModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal without saving */
  onClose: () => void;
  /** Callback called with the validated title when the user confirms */
  onConfirm: (title: string) => void;
  /** Disables actions and shows loading state on confirm button */
  isLoading?: boolean;
  /** Optional initial title value (used when editing an existing draft) */
  initialTitle?: string;
}

/**
 * Modal that prompts the user for the activity model title before saving it
 * as a reusable template (ActivityType.MODELO).
 *
 * Validates the title locally with the same constraints as the backend schema
 * (1–255 characters after trimming).
 */
export const SaveActivityModelModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  initialTitle = '',
}: SaveActivityModelModalProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [error, setError] = useState<string | undefined>(undefined);

  // Reset internal state every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setError(undefined);
    }
  }, [isOpen, initialTitle]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
    setError(undefined);
  }, []);

  const handleConfirm = useCallback(() => {
    const trimmed = title.trim();

    if (trimmed.length === 0) {
      setError('Informe um título para o modelo');
      return;
    }

    if (trimmed.length > TITLE_MAX_LENGTH) {
      setError(`O título deve ter no máximo ${TITLE_MAX_LENGTH} caracteres`);
      return;
    }

    onConfirm(trimmed);
  }, [title, onConfirm]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Salvar modelo"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="solid" onClick={handleConfirm} disabled={isLoading}>
            Salvar modelo
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Título"
          placeholder="Digite o título do modelo"
          value={title}
          onChange={handleChange}
          variant="rounded"
          required
          maxLength={TITLE_MAX_LENGTH}
          errorMessage={error}
          autoFocus
        />
      </div>
    </Modal>
  );
};

export default SaveActivityModelModal;
