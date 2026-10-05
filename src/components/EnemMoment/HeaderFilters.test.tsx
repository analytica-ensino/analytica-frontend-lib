import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnemMomentHeaderFilters } from './HeaderFilters';
import { EDUCATION_STAGE_OPTIONS, EXAM_DURATION_OPTIONS } from './constants';
import type { EnemMomentEducationStage } from './types';

function renderFilters({
  durations = [] as number[],
  educationStage = 'REGULAR' as EnemMomentEducationStage,
  availableStages = undefined as
    | readonly EnemMomentEducationStage[]
    | undefined,
} = {}) {
  const onDurationsChange = jest.fn();
  const onEducationStageChange = jest.fn();
  render(
    <EnemMomentHeaderFilters
      durations={durations}
      onDurationsChange={onDurationsChange}
      educationStage={educationStage}
      onEducationStageChange={onEducationStageChange}
      availableStages={availableStages}
    />
  );
  return { onDurationsChange, onEducationStageChange };
}

const durationTrigger = () =>
  screen.getByRole('button', { name: 'Tempo de prova' });

describe('EnemMomentHeaderFilters', () => {
  describe('Tempo de prova', () => {
    it('reads "Tempo de prova" while every time is picked', () => {
      renderFilters();

      expect(durationTrigger()).toHaveTextContent('Tempo de prova');
    });

    it('counts the times picked, singular and plural', () => {
      const { unmount } = render(
        <EnemMomentHeaderFilters
          durations={[60]}
          onDurationsChange={jest.fn()}
          educationStage="REGULAR"
          onEducationStageChange={jest.fn()}
        />
      );
      expect(durationTrigger()).toHaveTextContent('1 tempo selecionado');
      unmount();

      renderFilters({ durations: [30, 60] });
      expect(durationTrigger()).toHaveTextContent('2 tempos selecionados');
    });

    it('offers every 30-minute range, both ends in the label', () => {
      renderFilters();
      fireEvent.click(durationTrigger());

      expect(screen.getByLabelText('Todos os tempos')).toBeChecked();
      for (const option of EXAM_DURATION_OPTIONS) {
        expect(screen.getByLabelText(option.label)).toBeInTheDocument();
      }
      expect(EXAM_DURATION_OPTIONS.map((option) => option.value)).toEqual([
        30, 60, 90, 120, 150, 180, 210,
      ]);
    });

    it('reports the minutes each range ends at', () => {
      const { onDurationsChange } = renderFilters({ durations: [30] });
      fireEvent.click(durationTrigger());

      fireEvent.click(screen.getByText('30 min a 1h'));

      expect(onDurationsChange).toHaveBeenCalledWith([30, 60]);
    });
  });

  describe('Série', () => {
    it('shows the stage picked', () => {
      renderFilters({ educationStage: 'EJA' });

      expect(screen.getByRole('combobox')).toHaveTextContent('EJA');
    });

    it('offers the teaching stages, the regular 3rd year first', () => {
      renderFilters();
      fireEvent.click(screen.getByRole('combobox'));

      expect(
        screen.getAllByRole('option').map((option) => option.textContent)
      ).toEqual(EDUCATION_STAGE_OPTIONS.map((option) => option.label));
      expect(EDUCATION_STAGE_OPTIONS[0]).toEqual({
        value: 'REGULAR',
        label: '3ª série regular',
      });
    });

    it('takes only its own width, so a wrapping header keeps it in line', () => {
      renderFilters();

      // Select root → its container → the trigger.
      const root = screen.getByRole('combobox').parentElement!.parentElement!;
      expect(root).toHaveClass('w-auto');
      expect(root).not.toHaveClass('w-full');
    });

    it('reports the stage picked', () => {
      const { onEducationStageChange } = renderFilters();
      fireEvent.click(screen.getByRole('combobox'));

      fireEvent.click(screen.getByRole('option', { name: 'Subsequente' }));

      expect(onEducationStageChange).toHaveBeenCalledWith('SUBSEQUENTE');
    });
  });

  describe('Série, against what the school has', () => {
    it('offers only the stages of the school', () => {
      renderFilters({ availableStages: ['REGULAR', 'SUBSEQUENTE'] });
      fireEvent.click(screen.getByRole('combobox'));

      expect(
        screen.getAllByRole('option').map((option) => option.textContent)
      ).toEqual(['3ª série regular', 'Subsequente']);
    });

    it('keeps the canonical order, not the order received', () => {
      renderFilters({ availableStages: ['SUBSEQUENTE', 'REGULAR', 'EJA'] });
      fireEvent.click(screen.getByRole('combobox'));

      expect(
        screen.getAllByRole('option').map((option) => option.textContent)
      ).toEqual(EDUCATION_STAGE_OPTIONS.map((option) => option.label));
    });

    it.each([
      ['a single modality', ['EJA'] as EnemMomentEducationStage[]],
      ['no modality at all', [] as EnemMomentEducationStage[]],
    ])('hides the select for %s', (_label, availableStages) => {
      renderFilters({ availableStages });

      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('keeps "Tempo de prova" when the select is hidden', () => {
      renderFilters({ availableStages: ['EJA'] });

      expect(durationTrigger()).toBeInTheDocument();
    });

    it('offers every stage while the school is not known yet', () => {
      renderFilters({ availableStages: undefined });
      fireEvent.click(screen.getByRole('combobox'));

      expect(screen.getAllByRole('option')).toHaveLength(
        EDUCATION_STAGE_OPTIONS.length
      );
    });
  });

  describe('cut left on a stage the school does not have', () => {
    it('falls back to the only stage there is', () => {
      const { onEducationStageChange } = renderFilters({
        educationStage: 'REGULAR',
        availableStages: ['EJA'],
      });

      expect(onEducationStageChange).toHaveBeenCalledWith('EJA');
    });

    it('falls back to the first of the stages there are', () => {
      const { onEducationStageChange } = renderFilters({
        educationStage: 'REGULAR',
        availableStages: ['SUBSEQUENTE', 'EJA'],
      });

      expect(onEducationStageChange).toHaveBeenCalledWith('EJA');
    });

    it('leaves a cut the school does have alone', () => {
      const { onEducationStageChange } = renderFilters({
        educationStage: 'EJA',
        availableStages: ['REGULAR', 'EJA'],
      });

      expect(onEducationStageChange).not.toHaveBeenCalled();
    });

    it('leaves the cut alone while the school is not known yet', () => {
      const { onEducationStageChange } = renderFilters({
        educationStage: 'REGULAR',
        availableStages: undefined,
      });

      expect(onEducationStageChange).not.toHaveBeenCalled();
    });

    it('has nothing to fall back to when the scope has no stage', () => {
      const { onEducationStageChange } = renderFilters({
        educationStage: 'REGULAR',
        availableStages: [],
      });

      expect(onEducationStageChange).not.toHaveBeenCalled();
    });
  });
});
