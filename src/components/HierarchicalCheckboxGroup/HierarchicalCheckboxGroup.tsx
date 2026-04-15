import { Fragment, ReactNode } from 'react';
import CheckBox from '../CheckBox/CheckBox';
import Divider from '../Divider/Divider';
import { cn } from '../../utils/utils';

/**
 * Item (filho) do grupo hierarquico.
 */
export interface HierarchicalCheckboxItem {
  id: string;
  label: ReactNode;
  disabled?: boolean;
}

/**
 * Grupo (pai) que agrupa varios itens.
 */
export interface HierarchicalCheckboxGroupItem {
  id: string;
  label: ReactNode;
  items: HierarchicalCheckboxItem[];
}

/**
 * Layout dos itens (filhos) dentro de cada grupo.
 */
export type HierarchicalCheckboxItemsLayout = 'column' | 'row';

export interface HierarchicalCheckboxGroupProps {
  /** Lista de grupos, cada um com seus itens filhos */
  groups: HierarchicalCheckboxGroupItem[];
  /** Ids dos itens (filhos) atualmente selecionados */
  selectedIds: string[];
  /** Callback disparado quando a selecao muda */
  onChange: (selectedIds: string[]) => void;
  /**
   * Layout dos filhos de cada grupo.
   * - `column` (default): um abaixo do outro
   * - `row`: inline, com quebra de linha
   */
  itemsLayout?: HierarchicalCheckboxItemsLayout;
  /** Renderiza Divider entre grupos (default: true) */
  showGroupDividers?: boolean;
  /** Classes extras aplicadas ao container raiz */
  className?: string;
  /** Classes extras aplicadas ao label do grupo (pai) */
  groupLabelClassName?: string;
}

/**
 * HierarchicalCheckboxGroup - lista de grupos pai/filho com estado
 * `indeterminate` automatico no pai baseado na selecao dos filhos.
 *
 * Comportamento do pai:
 * - Todos os filhos selecionados -> `checked`
 * - Alguns filhos selecionados -> `indeterminate`
 * - Nenhum filho selecionado -> `unchecked`
 * - Click no pai: marca/desmarca todos os filhos daquele grupo
 *
 * @example
 * ```tsx
 * <HierarchicalCheckboxGroup
 *   groups={[
 *     {
 *       id: 'ef',
 *       label: 'Ensino fundamental',
 *       items: [
 *         { id: 'ef-6', label: '6º ano' },
 *         { id: 'ef-7', label: '7º ano' },
 *       ],
 *     },
 *   ]}
 *   selectedIds={selected}
 *   onChange={setSelected}
 * />
 * ```
 */
const HierarchicalCheckboxGroup = ({
  groups,
  selectedIds,
  onChange,
  itemsLayout = 'column',
  showGroupDividers = true,
  className,
  groupLabelClassName,
}: HierarchicalCheckboxGroupProps) => {
  const toggleItem = (itemId: string) => {
    if (selectedIds.includes(itemId)) {
      onChange(selectedIds.filter((id) => id !== itemId));
    } else {
      onChange([...selectedIds, itemId]);
    }
  };

  const selectAllInGroup = (groupItemIds: string[]) => {
    const merged = new Set([...selectedIds, ...groupItemIds]);
    onChange(Array.from(merged));
  };

  const deselectAllInGroup = (groupItemIds: string[]) => {
    onChange(selectedIds.filter((id) => !groupItemIds.includes(id)));
  };

  const itemsContainerClasses =
    itemsLayout === 'row'
      ? 'flex flex-wrap gap-x-6 gap-y-2'
      : 'flex flex-col gap-2';

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {groups.map((group, index) => {
        const groupItemIds = group.items.map((item) => item.id);
        const selectedCount = groupItemIds.filter((id) =>
          selectedIds.includes(id)
        ).length;
        const allChecked =
          selectedCount === groupItemIds.length && groupItemIds.length > 0;
        const someChecked = selectedCount > 0 && !allChecked;

        return (
          <Fragment key={group.id}>
            {showGroupDividers && index > 0 && <Divider />}
            <div className="flex flex-col gap-3">
              <CheckBox
                checked={allChecked}
                indeterminate={someChecked}
                onChange={() =>
                  allChecked
                    ? deselectAllInGroup(groupItemIds)
                    : selectAllInGroup(groupItemIds)
                }
                label={
                  <span
                    className={cn(
                      'font-bold text-text-950',
                      groupLabelClassName
                    )}
                  >
                    {group.label}
                  </span>
                }
              />
              <div className={itemsContainerClasses}>
                {group.items.map((item) => (
                  <CheckBox
                    key={item.id}
                    checked={selectedIds.includes(item.id)}
                    disabled={item.disabled}
                    onChange={() => toggleItem(item.id)}
                    label={item.label}
                  />
                ))}
              </div>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
};

HierarchicalCheckboxGroup.displayName = 'HierarchicalCheckboxGroup';

export default HierarchicalCheckboxGroup;
