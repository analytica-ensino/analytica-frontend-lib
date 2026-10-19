import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EducationStageSelect } from './EducationStageSelect';
import type { EducationStageOption } from './EducationStageSelect';

type Stage = 'REGULAR_1' | 'REGULAR_3' | 'EJA';

const OPTIONS: ReadonlyArray<EducationStageOption<Stage>> = [
  { value: 'REGULAR_1', label: '1ª série regular' },
  { value: 'REGULAR_3', label: '3ª série regular' },
  { value: 'EJA', label: 'EJA' },
];

function renderSelect({
  value = null as Stage | null,
  availableStages = undefined as readonly Stage[] | undefined,
  withAll = true,
} = {}) {
  const onChange = jest.fn();
  render(
    <EducationStageSelect
      value={value}
      onChange={onChange}
      options={OPTIONS}
      availableStages={availableStages}
      allLabel={withAll ? 'Todas as séries' : undefined}
    />
  );
  return { onChange };
}

const optionLabels = () =>
  screen.getAllByRole('option').map((option) => option.textContent);

describe('EducationStageSelect', () => {
  describe('with an "all" item', () => {
    it('reads the "all" label while no stage is picked', () => {
      renderSelect();

      expect(screen.getByRole('combobox')).toHaveTextContent('Todas as séries');
    });

    it('offers "all" first, then the options in their own order', () => {
      renderSelect({ availableStages: ['EJA', 'REGULAR_1'] });
      fireEvent.click(screen.getByRole('combobox'));

      expect(optionLabels()).toEqual([
        'Todas as séries',
        '1ª série regular',
        'EJA',
      ]);
    });

    it('reports the stage picked, and null for "all"', () => {
      const { onChange } = renderSelect({ value: 'EJA' });
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByRole('option', { name: '3ª série regular' }));
      expect(onChange).toHaveBeenLastCalledWith('REGULAR_3');

      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByRole('option', { name: 'Todas as séries' }));
      expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it('goes back to "all" when the scope stops offering the pick', () => {
      // A filter the screen no longer shows must not keep narrowing it.
      const { onChange } = renderSelect({
        value: 'REGULAR_3',
        availableStages: ['REGULAR_1', 'EJA'],
      });

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('goes back to "all" when the scope offers nothing at all', () => {
      const { onChange } = renderSelect({
        value: 'EJA',
        availableStages: [],
      });

      expect(onChange).toHaveBeenCalledWith(null);
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('leaves "all" alone, whatever the scope offers', () => {
      const { onChange } = renderSelect({ availableStages: [] });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('hides itself when the scope has a single option', () => {
      // "all" and the only option would mean the same thing.
      renderSelect({ availableStages: ['EJA'] });

      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
  });

  describe('without an "all" item', () => {
    it('offers only the options', () => {
      renderSelect({ value: 'EJA', withAll: false });
      fireEvent.click(screen.getByRole('combobox'));

      expect(optionLabels()).toEqual(OPTIONS.map((option) => option.label));
    });

    it('falls back to the first offered option, never to null', () => {
      const { onChange } = renderSelect({
        value: 'REGULAR_1',
        availableStages: ['EJA', 'REGULAR_3'],
        withAll: false,
      });

      expect(onChange).toHaveBeenCalledWith('REGULAR_3');
      expect(onChange).not.toHaveBeenCalledWith(null);
    });
  });

  it('takes only its own width, so a wrapping header keeps it in line', () => {
    renderSelect();

    // Select root → its container → the trigger.
    const root = screen.getByRole('combobox').parentElement!.parentElement!;
    expect(root).toHaveClass('w-auto');
    expect(root).not.toHaveClass('w-full');
  });
});
