import { ArrowDownIcon } from '@phosphor-icons/react/dist/csr/ArrowDown';
import Text from '../Text/Text';

/**
 * Slot that shows where a dragged item will land in a reorderable list.
 */
export const DropPlaceholder = () => (
  <div
    data-testid="drop-placeholder"
    className="rounded-lg border border-dashed border-primary-600 bg-primary-50 py-3 px-2 flex flex-row items-center justify-center gap-2 text-primary-950"
  >
    <ArrowDownIcon size={16} />
    <Text size="sm" weight="medium" className="text-primary-950">
      Soltar aqui
    </Text>
  </div>
);
