import { useMemo, useState } from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Text from '../Text/Text';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import SelectionButton from '../SelectionButton/SelectionButton';
import DateTimeInput from '../DateTimeInput/DateTimeInput';
import {
  CheckboxGroup,
  type CategoryConfig,
} from '../CheckBoxGroup/CheckBoxGroup';
import {
  ACTION_PLAN_STATUSES,
  type ActionPlanFilterOptions,
  type ActionPlanStatus,
} from '../../types/actionPlans';
import {
  ACTION_PLAN_STATUS_LABELS,
  DEADLINE_RANGE,
  DEADLINE_RANGE_LABELS,
  EMPTY_ACTION_PLAN_FILTERS,
  narrowedSelection,
  type ActionPlanFilters,
  type DeadlineRange,
} from './actionPlans.utils';

const CATEGORY = {
  STATUS: 'status',
  SCHOOL: 'school',
  RESPONSIBLE: 'responsible',
} as const;

export interface ActionPlanFiltersModalProps {
  /** The filters applied now; the modal edits a copy */
  filters: ActionPlanFilters;
  /** The schools and responsibles the tab's plans hold */
  options: ActionPlanFilterOptions;
  /**
   * The "Responsável" group is for managers: a teacher only sees plans they
   * hold or created.
   */
  showResponsible: boolean;
  onApply: (filters: ActionPlanFilters) => void;
  onClose: () => void;
}

/**
 * "Filtros" of the action plans list: status, school and responsible (all
 * checked by default), the deadline window and "only late plans". Nothing
 * reaches the list until "Aplicar".
 */
export const ActionPlanFiltersModal = ({
  filters,
  options,
  showResponsible,
  onApply,
  onClose,
}: Readonly<ActionPlanFiltersModalProps>) => {
  const [draft, setDraft] = useState<ActionPlanFilters>(filters);

  const schoolIds = useMemo(
    () => options.schools.map((school) => school.id),
    [options.schools]
  );
  const responsibleIds = useMemo(
    () => options.responsibles.map((person) => person.userInstitutionId),
    [options.responsibles]
  );

  // A null group is "todos": every option starts checked
  const categories: CategoryConfig[] = [
    {
      key: CATEGORY.STATUS,
      label: 'Status',
      itens: ACTION_PLAN_STATUSES.map((status) => ({
        id: status,
        name: ACTION_PLAN_STATUS_LABELS[status],
      })),
      selectedIds: draft.statuses ?? [...ACTION_PLAN_STATUSES],
    },
    {
      key: CATEGORY.SCHOOL,
      label: 'Escola',
      searchable: true,
      itens: options.schools.map((school) => ({
        id: school.id,
        name: school.name,
      })),
      selectedIds: draft.schoolIds ?? schoolIds,
    },
    ...(showResponsible
      ? [
          {
            key: CATEGORY.RESPONSIBLE,
            label: 'Responsável',
            searchable: true,
            itens: options.responsibles.map((person) => ({
              id: person.userInstitutionId,
              name: person.name,
            })),
            selectedIds: draft.responsibleIds ?? responsibleIds,
          },
        ]
      : []),
  ];

  const handleCategoriesChange = (updated: CategoryConfig[]) => {
    const selectedOf = (key: string) =>
      updated.find((category) => category.key === key)?.selectedIds ?? [];
    setDraft((current) => ({
      ...current,
      statuses: narrowedSelection(
        selectedOf(CATEGORY.STATUS) as ActionPlanStatus[],
        ACTION_PLAN_STATUSES
      ),
      schoolIds: narrowedSelection(selectedOf(CATEGORY.SCHOOL), schoolIds),
      responsibleIds: showResponsible
        ? narrowedSelection(selectedOf(CATEGORY.RESPONSIBLE), responsibleIds)
        : null,
    }));
  };

  const chooseDeadline = (deadline: DeadlineRange) =>
    setDraft((current) => ({ ...current, deadline }));

  const handleApply = () => {
    onApply(
      draft.deadline === DEADLINE_RANGE.CUSTOM
        ? draft
        : { ...draft, deadlineFrom: '', deadlineTo: '' }
    );
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      title="Filtros"
      footer={
        <div className="flex w-full justify-end gap-3">
          <Button
            variant="outline"
            size="small"
            onClick={() => setDraft(EMPTY_ACTION_PLAN_FILTERS)}
          >
            Limpar filtros
          </Button>
          <Button size="small" onClick={handleApply}>
            Aplicar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <CheckboxGroup
          categories={categories}
          onCategoriesChange={handleCategoriesChange}
          compactSingleItem={false}
          showSingleItem
          disableAutoSelection
        />

        <fieldset className="flex flex-col gap-3">
          <Text
            as="legend"
            size="sm"
            weight="bold"
            className="mb-3 text-text-950"
          >
            Prazo
          </Text>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Object.values(DEADLINE_RANGE).map((range) => (
              <SelectionButton
                key={range}
                type="button"
                label={DEADLINE_RANGE_LABELS[range]}
                selected={draft.deadline === range}
                aria-pressed={draft.deadline === range}
                className="justify-center whitespace-nowrap px-2"
                onClick={() => chooseDeadline(range)}
              />
            ))}
          </div>
          {draft.deadline === DEADLINE_RANGE.CUSTOM && (
            <div className="grid grid-cols-1 gap-3 rounded-xl bg-background-100 p-4 sm:grid-cols-2">
              <DateTimeInput
                label="De"
                showTime={false}
                date={draft.deadlineFrom}
                onDateChange={(deadlineFrom) =>
                  setDraft((current) => ({ ...current, deadlineFrom }))
                }
                testId="action-plan-deadline-from"
              />
              <DateTimeInput
                label="Até"
                showTime={false}
                date={draft.deadlineTo}
                onDateChange={(deadlineTo) =>
                  setDraft((current) => ({ ...current, deadlineTo }))
                }
                testId="action-plan-deadline-to"
              />
            </div>
          )}
        </fieldset>

        <div className="flex items-center gap-3 rounded-xl bg-background-100 p-4">
          <ToggleSwitch
            checked={draft.lateOnly}
            aria-labelledby="action-plan-late-only"
            onChange={() =>
              setDraft((current) => ({
                ...current,
                lateOnly: !current.lateOnly,
              }))
            }
          />
          <Text
            as="span"
            id="action-plan-late-only"
            size="sm"
            className="text-text-950"
          >
            Mostrar somente planos atrasados
          </Text>
        </div>
      </div>
    </Modal>
  );
};
