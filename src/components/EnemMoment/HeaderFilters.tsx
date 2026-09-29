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
 * The picks of the Momento ENEM screens: "Tempo de prova" and the teaching
 * stage of the classes. They sit in the page's header, in place of the period
 * and filters of the other reports.
 */
export function EnemMomentHeaderFilters({
  durations,
  onDurationsChange,
  educationStage,
  onEducationStageChange,
}: Readonly<{
  /** "Tempo de prova" picks, in minutes; empty is every time. */
  durations: number[];
  onDurationsChange: (durations: number[]) => void;
  educationStage: EnemMomentEducationStage;
  onEducationStageChange: (stage: EnemMomentEducationStage) => void;
}>) {
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

      <Select
        value={educationStage}
        onValueChange={(value) =>
          onEducationStageChange(value as EnemMomentEducationStage)
        }
      >
        <SelectTrigger className="w-auto min-w-45 gap-2" aria-label="Série">
          <SelectValue placeholder="Série" />
        </SelectTrigger>
        <SelectContent>
          {EDUCATION_STAGE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
