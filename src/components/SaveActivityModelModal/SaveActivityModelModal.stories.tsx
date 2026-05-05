import type { Story } from '@ladle/react';
import { useState } from 'react';
import { SaveActivityModelModal } from './SaveActivityModelModal';
import Button from '../Button/Button';
import Text from '../Text/Text';

/**
 * Basic SaveActivityModelModal usage. The user opens the modal, types a title
 * and confirms to "save" the activity as a reusable template.
 */
export const Basic: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [savedTitle, setSavedTitle] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4 p-4">
      <Button onClick={() => setIsOpen(true)}>Salvar modelo</Button>

      {savedTitle && (
        <div className="p-4 bg-background-50 rounded-lg">
          <Text size="sm" weight="medium" color="text-text-900">
            Último título salvo:
          </Text>
          <Text size="sm" color="text-text-700">
            {savedTitle}
          </Text>
        </div>
      )}

      <SaveActivityModelModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={(title) => {
          setSavedTitle(title);
          setIsOpen(false);
        }}
      />
    </div>
  );
};

/**
 * Modal pre-filled with an initial title (used when editing an existing draft).
 */
export const WithInitialTitle: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 p-4">
      <Button onClick={() => setIsOpen(true)}>Editar título do modelo</Button>

      <SaveActivityModelModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={() => setIsOpen(false)}
        initialTitle="Modelo - Frações para o 7º ano"
      />
    </div>
  );
};

/**
 * Modal in a loading state — both action buttons are disabled while the save
 * request is in flight.
 */
export const Loading: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 p-4">
      <Button onClick={() => setIsOpen(true)}>Abrir modal (loading)</Button>

      <SaveActivityModelModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={() => setIsOpen(false)}
        isLoading
      />
    </div>
  );
};
