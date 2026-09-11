import { SparkleIcon } from '@phosphor-icons/react/dist/csr/Sparkle';
import { ChalkboardTeacherIcon } from '@phosphor-icons/react/dist/csr/ChalkboardTeacher';
import { CircleNotchIcon } from '@phosphor-icons/react/dist/csr/CircleNotch';
import Badge from '../Badge/Badge';
import { AI_CORRECTION_STATUS, CORRECTION_SOURCE } from './useQuizStore';

/**
 * Visual definition of each tag, keyed by what it represents.
 *
 * A lookup table rather than a chain of conditionals so adding a fourth state
 * later — a second reviewer, an appeal — is one entry and not a new branch in
 * every consumer.
 */
const TAG_BY_SOURCE = {
  [CORRECTION_SOURCE.IA]: {
    label: 'Corrigido por IA',
    action: 'info',
    Icon: SparkleIcon,
  },
  [CORRECTION_SOURCE.IA_PROFESSOR]: {
    label: 'Corrigido por IA + Professor',
    action: 'success',
    Icon: SparkleIcon,
  },
  [CORRECTION_SOURCE.PROFESSOR]: {
    label: 'Corrigido por Professor',
    action: 'muted',
    Icon: ChalkboardTeacherIcon,
  },
} as const;

export interface CorrectionSourceTagProps {
  /** Who produced the correction currently on the answer. */
  correctionSource?: CORRECTION_SOURCE | null;
  /** Where the asynchronous AI correction stands, when one was started. */
  aiCorrectionStatus?: AI_CORRECTION_STATUS | null;
  readonly className?: string;
}

/**
 * Tag saying who corrected a dissertative answer.
 *
 * Three settled states — `IA`, `IA + professor`, `apenas professor` — plus the
 * in-between one: an answer whose AI correction is still running shows
 * "Corrigindo com IA" instead of nothing. That transient state is the whole
 * reason `aiCorrectionStatus` exists; the correction is asynchronous, so the
 * student reaches the result screen before there is a verdict to tag, and
 * without it the screen would claim the answer is waiting on a teacher seconds
 * before the AI feedback appears.
 *
 * Renders nothing when there is neither a correction nor one under way, which
 * is every objective question and every dissertative answer in an institution
 * with the feature off.
 *
 * @param props - Component props
 * @returns JSX element or null
 *
 * @example
 * ```tsx
 * <CorrectionSourceTag
 *   correctionSource={answer.correctionSource}
 *   aiCorrectionStatus={answer.aiCorrectionStatus}
 * />
 * ```
 */
export const CorrectionSourceTag = ({
  correctionSource,
  aiCorrectionStatus,
  className,
}: CorrectionSourceTagProps) => {
  if (!correctionSource) {
    if (aiCorrectionStatus !== AI_CORRECTION_STATUS.PENDING) {
      return null;
    }

    return (
      <Badge
        variant="solid"
        action="info"
        size="small"
        className={className}
        iconLeft={<CircleNotchIcon className="animate-spin" />}
      >
        Corrigindo com IA
      </Badge>
    );
  }

  const tag = TAG_BY_SOURCE[correctionSource];
  const { Icon } = tag;

  return (
    <Badge
      variant="solid"
      action={tag.action}
      size="small"
      className={className}
      iconLeft={<Icon />}
    >
      {tag.label}
    </Badge>
  );
};

CorrectionSourceTag.displayName = 'CorrectionSourceTag';

export default CorrectionSourceTag;
