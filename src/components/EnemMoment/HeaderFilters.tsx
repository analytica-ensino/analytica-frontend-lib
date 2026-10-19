import { useCallback } from 'react';
import { ClockIcon } from '@phosphor-icons/react/dist/csr/Clock';
import { MultiCheckSelect } from '../MultiCheckSelect/MultiCheckSelect';
import { EducationStageSelect } from '../EducationStageSelect/EducationStageSelect';
import { EDUCATION_STAGE_OPTIONS, EXAM_DURATION_OPTIONS } from './constants';
import type { EnemMomentEducationStage } from './types';

const formatSelectedDurations = (count: number) =>
  count === 1 ? '1 tempo selecionado' : `${count} tempos selecionados`;

/**
 * The picks of the Momento ENEM screens: "Tempo de prova" and the teaching
 * stage of the classes. They sit in the page's header, in place of the period
 * and filters of the other reports.
 */
export function EnemMomentHeaderFilters({
  durations,
  onDurationsChange,
  educationStage,
  onEducationStageChange,
  availableStages,
}: Readonly<{
  /** "Tempo de prova" picks, in minutes; empty is every time. */
  durations: number[];
  onDurationsChange: (durations: number[]) => void;
  educationStage: EnemMomentEducationStage;
  onEducationStageChange: (stage: EnemMomentEducationStage) => void;
  /**
   * Teaching stages the school has, as the scope's classes spell them.
   *
   * A school with a single modality has nothing to pick, so the "Série" select
   * is not rendered at all — an only option is a statement, not a choice, and
   * it invites the manager to look for the others.
   *
   * `undefined` is "not known yet" and keeps every stage on offer, which is
   * what the screens did before the scope could answer this.
   */
  availableStages?: readonly EnemMomentEducationStage[];
}>) {
  // A stage is always picked here (no "all" item), so `null` never comes back.
  const handleStageChange = useCallback(
    (stage: EnemMomentEducationStage | null) => {
      if (stage) onEducationStageChange(stage);
    },
    [onEducationStageChange]
  );

  return (
    <>
      <MultiCheckSelect
        options={EXAM_DURATION_OPTIONS}
        values={durations}
        onValuesChange={onDurationsChange}
        placeholder="Tempo de prova"
        allLabel="Todos os tempos"
        formatSelected={formatSelectedDurations}
        icon={<ClockIcon size={18} aria-hidden="true" />}
        aria-label="Tempo de prova"
      />

      <EducationStageSelect
        value={educationStage}
        onChange={handleStageChange}
        options={EDUCATION_STAGE_OPTIONS}
        availableStages={availableStages}
      />
    </>
  );
}
