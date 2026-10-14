import { useId, useMemo } from 'react';
import { MedalIcon } from '@phosphor-icons/react/dist/csr/Medal';
import Text from '../Text/Text';
import ScoreCircle from '../ScoreCircle/ScoreCircle';
import ProgressBar from '../ProgressBar/ProgressBar';
import { IconRender } from '../IconRender/IconRender';
import { useTheme } from '../../hooks/useTheme';
import { useMobile } from '../../hooks/useMobile';
import { cn, getSubjectColorWithOpacity } from '../../utils/utils';
import { formatReportScore } from '../../utils/reportFormat';
import type {
  EnemClassroomResultArea,
  EnemClassroomStudentResult,
  EnemClassroomSubjectHighlight,
} from '../../types/enemClassroom';
import {
  FALLBACK_SUBJECT_COLOR,
  FALLBACK_SUBJECT_ICON,
  areaVisual,
  summaryMessage,
  type EnemClassroomSubjectStyle,
} from './utils';

/** The styles by subject id, for the lookups of a render. */
export const useSubjectStyleMap = (
  subjectStyles: ReadonlyArray<EnemClassroomSubjectStyle>
) =>
  useMemo(
    () => new Map(subjectStyles.map((style) => [style.id, style])),
    [subjectStyles]
  );

/** "Melhor desempenho" / "Área para melhorar": a subject chip under a label. */
const SubjectHighlight = ({
  label,
  subject,
  style,
}: Readonly<{
  label: string;
  subject: EnemClassroomSubjectHighlight | null;
  style: EnemClassroomSubjectStyle | undefined;
}>) => {
  const { isDark } = useTheme();

  return (
    <div className="flex flex-col gap-2">
      <Text size="md" weight="medium" className="text-text-950">
        {label}
      </Text>
      {subject ? (
        <div className="flex flex-row items-center gap-2">
          <span
            aria-hidden="true"
            className="flex size-[21px] shrink-0 items-center justify-center rounded text-text-950"
            style={{
              backgroundColor: getSubjectColorWithOpacity(
                style?.color ?? FALLBACK_SUBJECT_COLOR,
                isDark
              ),
            }}
          >
            <IconRender
              iconName={style?.icon ?? FALLBACK_SUBJECT_ICON}
              color="currentColor"
              size={14}
            />
          </span>
          <Text size="sm" className="text-text-700">
            {subject.subjectName}
          </Text>
        </div>
      ) : (
        <Text size="sm" className="text-text-500">
          —
        </Text>
      )}
    </div>
  );
};

/** One of the "Desempenho por área do conhecimento" cards. */
const AreaCard = ({ area }: Readonly<{ area: EnemClassroomResultArea }>) => {
  const { Icon, circleClassName } = areaVisual(area.areaKnowledgeName);
  const percentage = area.correctPercentage ?? 0;

  return (
    <li className="flex flex-col gap-3 p-4 rounded-xl border border-border-50 bg-background">
      <span
        aria-hidden="true"
        className={cn(
          'flex size-8 items-center justify-center rounded-full',
          circleClassName
        )}
      >
        <Icon size={16} />
      </span>
      <Text size="2xs" weight="bold" className="uppercase text-text-950">
        {area.areaKnowledgeName}
      </Text>
      <ProgressBar
        value={percentage}
        max={100}
        variant="green"
        size="medium"
        showPercentage
        accessibleLabel={`${area.areaKnowledgeName}: ${Math.round(percentage)}% de acertos`}
      />
      <Text size="xs" className="text-text-700">
        {area.correct} acertos / {area.incorrect} erros
      </Text>
    </li>
  );
};

/**
 * "Resumo geral" of a Simulado Momento Enem result: the score, the best and
 * weakest components, and the areas of knowledge under them — one card.
 *
 * The message follows `aboveAverage`, which the API decides so the text never
 * disagrees with the score over a rounding; without an average yet there is
 * nothing to compare against, and no message.
 *
 * On mobile the text goes on top and the ring beside the two highlights; from
 * `md` the text and the highlights sit left of the ring.
 */
export const EnemClassroomResultSummary = ({
  result,
  subjectStyles,
}: Readonly<{
  result: EnemClassroomStudentResult;
  /** Icons and colours of the components, from the app's subjects endpoint. */
  subjectStyles: ReadonlyArray<EnemClassroomSubjectStyle>;
}>) => {
  const titleId = useId();
  const { isMobile } = useMobile();
  const styles = useSubjectStyleMap(subjectStyles);
  const message = summaryMessage(result.aboveAverage);
  const styleOf = (subject: EnemClassroomSubjectHighlight | null) =>
    subject ? styles.get(subject.subjectId) : undefined;

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-6 p-6 rounded-xl bg-background border border-border-50"
    >
      <div className="grid grid-cols-[auto_1fr] md:grid-cols-[1fr_auto] items-center gap-6">
        <div className="col-span-2 md:col-span-1 md:col-start-1 md:row-start-1 flex flex-col gap-1">
          <Text
            as="h2"
            id={titleId}
            size="lg"
            weight="bold"
            className="text-text-950"
          >
            Resumo geral
          </Text>
          {message && (
            <Text size="sm" className="text-text-700">
              {message}
            </Text>
          )}
        </div>

        {result.finalScore !== null && (
          <ScoreCircle
            className="row-start-2 col-start-1 md:row-start-1 md:row-span-2 md:col-start-2"
            value={result.finalScore}
            displayValue={formatReportScore(result.finalScore)}
            max={10}
            size={isMobile ? 112 : 150}
            strokeWidth={isMobile ? 8 : 10}
            label="Nota final"
            labelIcon={<MedalIcon size={14} aria-hidden="true" />}
          />
        )}

        <div
          className={cn(
            'row-start-2 md:col-start-1 grid grid-cols-1 md:grid-cols-2 gap-4',
            result.finalScore === null
              ? 'col-span-2 md:col-span-1'
              : 'col-start-2'
          )}
        >
          <SubjectHighlight
            label="Melhor desempenho"
            subject={result.bestSubject}
            style={styleOf(result.bestSubject)}
          />
          <SubjectHighlight
            label="Área para melhorar"
            subject={result.worstSubject}
            style={styleOf(result.worstSubject)}
          />
        </div>
      </div>

      {result.areas.length > 0 && (
        <div className="flex flex-col gap-4 pt-6 border-t border-border-100">
          <div className="flex flex-col gap-1">
            <Text as="h3" size="lg" weight="bold" className="text-text-950">
              Desempenho por área do conhecimento
            </Text>
            <Text size="sm" className="text-text-700">
              Visualize seu desempenho em cada área
            </Text>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {result.areas.map((area) => (
              <AreaCard key={area.areaKnowledgeId} area={area} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
