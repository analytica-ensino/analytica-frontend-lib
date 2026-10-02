import { useEffect } from 'react';
import { ClockIcon } from '@phosphor-icons/react/dist/csr/Clock';
import Select, {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../Select/Select';
import { MultiCheckSelect } from '../MultiCheckSelect/MultiCheckSelect';
import { EDUCATION_STAGE_OPTIONS, EXAM_DURATION_OPTIONS } from './constants';
import type { EnemMomentEducationStage } from './types';

const formatSelectedDurations = (count: number) =>
  count === 1 ? '1 tempo selecionado' : `${count} tempos selecionados`;

/**
 * The "Série" options to offer, given what the school actually has.
 *
 * Keeps the order of `EDUCATION_STAGE_OPTIONS` instead of the caller's, so the
 * regular 3rd year stays first however the scope came back.
 *
 * @param availableStages - Stages the school has; `undefined` means unknown
 * @returns The options to render
 */
const resolveStageOptions = (
  availableStages?: readonly EnemMomentEducationStage[]
) => {
  if (!availableStages) return EDUCATION_STAGE_OPTIONS;
  return EDUCATION_STAGE_OPTIONS.filter((option) =>
    availableStages.includes(option.value)
  );
};

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
  const stageOptions = resolveStageOptions(availableStages);
  const stageIsOffered = stageOptions.some(
    (option) => option.value === educationStage
  );

  /*
    A primitive, and not the options array: `resolveStageOptions` filters, so
    it hands back a new array on every render and an effect watching it would
    fire forever. This settles to null as soon as the cut is corrected.
  */
  const stageToFallBackTo =
    stageIsOffered || stageOptions.length === 0 ? null : stageOptions[0].value;

  useEffect(() => {
    if (!stageToFallBackTo) return;
    onEducationStageChange(stageToFallBackTo);
  }, [stageToFallBackTo, onEducationStageChange]);
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

      {/* The width goes on the root, not only on the trigger: the root is
          `w-full`, and in a header that wraps (the gestor's) a full-width item
          drops to a line of its own, far from "Tempo de prova". */}
      {stageOptions.length > 1 && (
        <Select
          value={educationStage}
          onValueChange={(value) =>
            onEducationStageChange(value as EnemMomentEducationStage)
          }
          className="w-auto"
        >
          <SelectTrigger className="w-auto min-w-45 gap-2" aria-label="Série">
            <SelectValue placeholder="Série" />
          </SelectTrigger>
          <SelectContent>
            {stageOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </>
  );
}
