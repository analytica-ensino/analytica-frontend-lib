import { Modal, Text, SelectionButton } from '../../../index';
import { FileText, Plus } from 'phosphor-react';

export type ActivityOption = 'choose-model' | 'create-new';

interface AddActivityOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: ActivityOption) => void;
}

/**
 * Modal for selecting activity option (choose model or create new)
 */
export const AddActivityOptionModal = ({
  isOpen,
  onClose,
  onSelectOption,
}: AddActivityOptionModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Selecione uma opção"
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <Text size="md" className="text-text-800">
          Como deseja adicionar a atividade?
        </Text>
        <div className="flex flex-col gap-2">
          <SelectionButton
            icon={<FileText size={24} />}
            label="Escolher modelo de atividade"
            selected={false}
            onClick={() => onSelectOption('choose-model')}
            className="w-full"
          />
          <SelectionButton
            icon={<Plus size={24} />}
            label="Criar nova atividade"
            selected={false}
            onClick={() => onSelectOption('create-new')}
            className="w-full"
          />
        </div>
      </div>
    </Modal>
  );
};

