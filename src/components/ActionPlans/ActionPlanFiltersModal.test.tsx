import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionPlanFiltersModal } from './ActionPlanFiltersModal';
import {
  DEADLINE_RANGE,
  EMPTY_ACTION_PLAN_FILTERS,
  type ActionPlanFilters,
} from './actionPlans.utils';
import type { CategoryConfig } from '../CheckBoxGroup/CheckBoxGroup';

// The real group pulls the whole lib barrel; this one shows what each
// category has checked and narrows it to its first option on demand.
jest.mock('../CheckBoxGroup/CheckBoxGroup', () => ({
  CheckboxGroup: ({
    categories,
    onCategoriesChange,
  }: {
    categories: CategoryConfig[];
    onCategoriesChange: (categories: CategoryConfig[]) => void;
  }) => (
    <div>
      {categories.map((category) => (
        <div key={category.key}>
          <span data-testid={`selected-${category.key}`}>
            {(category.selectedIds ?? []).join(',')}
          </span>
          <button
            type="button"
            onClick={() =>
              onCategoriesChange(
                categories.map((other) =>
                  other.key === category.key
                    ? { ...other, selectedIds: [other.itens?.[0]?.id ?? ''] }
                    : other
                )
              )
            }
          >
            Só o primeiro de {category.label}
          </button>
        </div>
      ))}
    </div>
  ),
}));

const OPTIONS = {
  schools: [
    { id: 'school-a', name: 'Escola A' },
    { id: 'school-b', name: 'Escola B' },
  ],
  responsibles: [
    { userInstitutionId: 'ui-1', name: 'Ana Souza' },
    { userInstitutionId: 'ui-2', name: 'Bia Lima' },
  ],
};

const setup = (filters: ActionPlanFilters = EMPTY_ACTION_PLAN_FILTERS) => {
  const onApply = jest.fn();
  render(
    <ActionPlanFiltersModal
      filters={filters}
      options={OPTIONS}
      showResponsible
      onApply={onApply}
      onClose={jest.fn()}
    />
  );
  return { onApply };
};

describe('ActionPlanFiltersModal', () => {
  it('starts with every option checked', () => {
    setup();

    expect(screen.getByTestId('selected-status')).toHaveTextContent(
      'NOT_STARTED,IN_PROGRESS,DONE,CANCELED'
    );
    expect(screen.getByTestId('selected-school')).toHaveTextContent(
      'school-a,school-b'
    );
    expect(screen.getByTestId('selected-responsible')).toHaveTextContent(
      'ui-1,ui-2'
    );
  });

  it('applies the narrowed groups only', async () => {
    const { onApply } = setup();

    await userEvent.click(screen.getByText('Só o primeiro de Escola'));
    await userEvent.click(screen.getByText('Só o primeiro de Responsável'));
    await userEvent.click(screen.getByText('Aplicar'));

    expect(onApply).toHaveBeenCalledWith({
      ...EMPTY_ACTION_PLAN_FILTERS,
      schoolIds: ['school-a'],
      responsibleIds: ['ui-1'],
    });
  });

  it('takes a custom period, and drops it for another choice', async () => {
    const { onApply } = setup();

    await userEvent.click(screen.getByText('Escolher período'));
    fireEvent.change(screen.getByTestId('action-plan-deadline-from-input'), {
      target: { value: '2026-12-01' },
    });
    fireEvent.change(screen.getByTestId('action-plan-deadline-to-input'), {
      target: { value: '2026-12-31' },
    });
    await userEvent.click(screen.getByText('Aplicar'));

    expect(onApply).toHaveBeenLastCalledWith({
      ...EMPTY_ACTION_PLAN_FILTERS,
      deadline: DEADLINE_RANGE.CUSTOM,
      deadlineFrom: '2026-12-01',
      deadlineTo: '2026-12-31',
    });

    await userEvent.click(screen.getByText('Próximos 30 dias'));
    await userEvent.click(screen.getByText('Aplicar'));

    expect(onApply).toHaveBeenLastCalledWith({
      ...EMPTY_ACTION_PLAN_FILTERS,
      deadline: DEADLINE_RANGE.NEXT_30_DAYS,
    });
  });

  it('clears every filter back to "todos"', async () => {
    const { onApply } = setup({
      ...EMPTY_ACTION_PLAN_FILTERS,
      statuses: ['DONE'],
      lateOnly: true,
      deadline: DEADLINE_RANGE.NEXT_7_DAYS,
    });

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByText('Próximos 7 dias').closest('button')
    ).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByText('Limpar filtros'));
    await userEvent.click(screen.getByText('Aplicar'));

    expect(onApply).toHaveBeenCalledWith(EMPTY_ACTION_PLAN_FILTERS);
  });
});
