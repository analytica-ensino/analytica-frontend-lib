import { useState, type ReactNode } from 'react';
import { UserIcon, XCircleIcon } from '@phosphor-icons/react';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import Badge from '../Badge/Badge';
import { cn } from '../../utils/utils';
import {
  bgClassToCssVar,
  polarToCartesian,
  describeArc,
} from '../../utils/chartUtils';
import { MetricBox } from '../shared/MetricBox';
import { REPORT_PERIOD } from '../../types/common';
import { PERFORMANCE_TAG_CONFIG } from '../../types/performance';

// ─── API Types (match backend exactly) ───────────────────────

/**
 * Query params for GET /performance/user/:userId
 */
export interface UserPerformanceRequest {
  userId: string;
  period: REPORT_PERIOD;
  classId?: string;
}

/**
 * Consolidated question statistics block.
 * Mirrors backend ConsolidatedQuestionStats.
 *
 * Note: `totalAnswered = correctQuestions + incorrectQuestions` (blank excluded).
 * To display the full total use `correctQuestions + incorrectQuestions + blankQuestions`.
 */
export interface UserPerformanceQuestionStats {
  totalAnswered: number;
  correctQuestions: number;
  correctPercentage: number;
  incorrectQuestions: number;
  incorrectPercentage: number;
  blankQuestions: number;
  blankPercentage: number;
  /** Localized label e.g. "Acima da média", "Abaixo da média" */
  performanceTag: string;
}

/**
 * Downloaded lesson entry.
 * Mirrors backend DownloadedLesson.
 */
export interface UserPerformanceLesson {
  lessonId: string;
  lessonName: string;
  bnccCode: string | null;
}

/**
 * Full 200 response for STUDENT profile.
 * Mirrors backend StudentUserPerformance.
 */
export interface UserPerformanceStudentData {
  user: {
    id: string;
    name: string;
  };
  school: {
    schoolId: string;
    schoolName: string;
  };
  class: {
    classId: string;
    className: string;
  };
  schoolYear: {
    schoolYearId: string;
    schoolYearName: string;
  };
  /** Derived from generalStats.performanceTag e.g. "Abaixo da média" */
  status: string;
  generalStats: UserPerformanceQuestionStats;
  activityStats: UserPerformanceQuestionStats;
  questionnaireStats: UserPerformanceQuestionStats;
  simulationStats: UserPerformanceQuestionStats;
  downloadedLessons: UserPerformanceLesson[];
}

/**
 * Consolidated material production stats.
 * Mirrors backend ConsolidatedMaterialStats.
 */
export interface UserPerformanceMaterialStats {
  totalMaterialProduced: number;
  totalRecommendedLessons: number;
  recommendedLessonsPercentage: number;
  totalActivities: number;
  activitiesPercentage: number;
}

/**
 * Full 200 response for TEACHER / UNIT_MANAGER / REGIONAL_MANAGER profiles.
 * Mirrors backend ProfessionalUserPerformance.
 *
 * Note: no user/school/class context is returned for professional profiles.
 * Pass user display info via `professionalUserInfo` if needed.
 */
export interface UserPerformanceProfessionalData {
  generalStats: UserPerformanceMaterialStats;
}

export enum PerformanceReportModalVariant {
  STUDENT = 'student',
  PROFESSIONAL = 'professional',
}

export interface PerformanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Modal title (default: "Desempenho em 1 ano") */
  title?: string;
  variant: PerformanceReportModalVariant;
  data: UserPerformanceStudentData | UserPerformanceProfessionalData | null;
  /**
   * Display info for the professional modal header.
   * The professional API response does not include user/school context,
   * so the parent should supply this from the table row data.
   */
  professionalUserInfo?: {
    userName: string;
    schoolName: string;
    className: string;
    year: string | number;
  };
  /**
   * Optional icon mapper for the downloaded lessons table (student variant).
   * The API does not return icons; the parent can derive them from the lesson data.
   */
  getLessonIcon?: (lesson: UserPerformanceLesson) => ReactNode;
  /**
   * Optional activity/questionnaire/simulation done counts for the student modal.
   * These are not part of the main API response — pass them from other data sources
   * when available (e.g. from a separate endpoint or table row context).
   */
  studentActivityCounts?: {
    activities?: number;
    questionnaires?: number;
    simulations?: number;
  };
  loading?: boolean;
  error?: string | null;
}

// ─── Status → Badge variant mapping ──────────────────────────

function getStatusVariant(
  status: string
): 'success' | 'info' | 'warning' | 'error' {
  return (
    Object.values(PERFORMANCE_TAG_CONFIG).find((c) => c.label === status)
      ?.variant ?? 'info'
  );
}

// ─── Internal pie slice type ──────────────────────────────────

interface PieSlice {
  label: string;
  value: number;
  colorClass: string;
  /** Direct CSS color value — takes precedence over colorClass when provided */
  color?: string;
}

function buildQuestionsSlices(stats: UserPerformanceQuestionStats): PieSlice[] {
  return [
    {
      label: 'Questões corretas',
      value: stats.correctQuestions,
      colorClass: 'bg-success-200',
    },
    {
      label: 'Questões incorretas',
      value: stats.incorrectQuestions,
      colorClass: 'bg-warning-400',
    },
    {
      label: 'Questões em branco',
      value: stats.blankQuestions,
      colorClass: 'bg-background-300',
    },
  ];
}

function buildMaterialSlices(stats: UserPerformanceMaterialStats): PieSlice[] {
  return [
    {
      label: 'Aulas recomendadas',
      value: stats.totalRecommendedLessons,
      colorClass: 'bg-warning-300',
      color: 'var(--Indicator-Indicator-Positive, #F8CC2E)',
    },
    {
      label: 'Atividades',
      value: stats.totalActivities,
      colorClass: 'bg-success-700',
      color: 'var(--Success-success700, #206F3E)',
    },
  ];
}

// ─── Sub-components ──────────────────────────────────────────

const SimplePieChart = ({
  slices,
  size = 130,
}: {
  slices: PieSlice[];
  size?: number;
}) => {
  const [hovered, setHovered] = useState<string | null>(null);

  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const r = size * 0.44;
  const c = size / 2;

  if (total === 0) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <circle cx={c} cy={c} r={r} className="fill-background-200" />
      </svg>
    );
  }

  let cumAngle = 0;
  const computed = slices
    .map((s) => {
      const pct = (s.value / total) * 100;
      const startAngle = cumAngle;
      cumAngle += (pct / 100) * 360;
      const endAngle = cumAngle;
      const midAngle = startAngle + (endAngle - startAngle) / 2;
      return { ...s, pct, startAngle, endAngle, midAngle };
    })
    .filter((s) => s.pct > 0);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      onMouseLeave={() => setHovered(null)}
    >
      {computed.map((slice) => {
        const isHovered = hovered === slice.label;
        const isWhole = slice.pct >= 99.99;
        const path = isWhole
          ? undefined
          : describeArc(c, c, r, slice.startAngle, slice.endAngle);
        const labelPos = polarToCartesian(c, c, r * 0.62, slice.midAngle);
        const fill = slice.color ?? bgClassToCssVar(slice.colorClass);

        return (
          <g
            key={slice.label}
            onMouseEnter={() => setHovered(slice.label)}
            className="cursor-pointer"
          >
            {isWhole ? (
              <circle cx={c} cy={c} r={r} fill={fill} />
            ) : (
              <path d={path} fill={fill} />
            )}
            {isHovered &&
              (isWhole ? (
                <circle
                  cx={c}
                  cy={c}
                  r={r}
                  fill="white"
                  opacity={0.4}
                  style={{ pointerEvents: 'none' }}
                />
              ) : (
                <path
                  d={path}
                  fill="white"
                  opacity={0.4}
                  style={{ pointerEvents: 'none' }}
                />
              ))}
            {slice.pct >= 5 && (
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--color-text-950)"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: 'Roboto, sans-serif',
                  lineHeight: 1,
                  letterSpacing: 0,
                  pointerEvents: 'none',
                }}
              >
                {`${Math.round(slice.pct)}%`}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

const LegendRow = ({
  colorClass,
  color,
  label,
  value,
}: {
  colorClass: string;
  color?: string;
  label: string;
  value: number;
}) => (
  <div className="flex items-center gap-2">
    <div
      className={cn('w-2 h-2 rounded-full shrink-0', !color && colorClass)}
      style={color ? { backgroundColor: color } : undefined}
    />
    <Text size="sm" weight="medium" className="text-text-950 flex-1">
      {label}
    </Text>
    <Text size="sm" weight="medium" className="text-text-600 ml-3">
      {value}
    </Text>
  </div>
);

const LegendPieCard = ({ slices }: { slices: PieSlice[] }) => (
  <div className="flex items-center justify-between gap-4 p-4 bg-background border border-border-50 rounded-xl">
    <div className="flex flex-col gap-2">
      {slices.map((s) => (
        <LegendRow
          key={s.label}
          colorClass={s.colorClass}
          color={s.color}
          label={s.label}
          value={s.value}
        />
      ))}
    </div>
    <SimplePieChart slices={slices} />
  </div>
);

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <Text
    as="h3"
    size="md"
    weight="bold"
    className="text-text-950 tracking-[0.2px]"
  >
    {children}
  </Text>
);

const UserHeader = ({
  name,
  school,
  className,
  year,
  status,
}: {
  name: string;
  school: string;
  className: string;
  year: string | number;
  status?: string;
}) => (
  <div className="flex flex-col gap-2 pb-4 border-b border-border-50">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Text
          as="span"
          className="size-8 rounded-full bg-background-100 flex items-center justify-center shrink-0"
        >
          <UserIcon size={18} className="text-text-500" weight="fill" />
        </Text>
        <Text size="md" weight="medium" className="text-text-950">
          {name}
        </Text>
      </div>
      {status && (
        <Badge variant="solid" action={getStatusVariant(status)} size="small">
          {status.toUpperCase()}
        </Badge>
      )}
    </div>
    <Text size="xs" className="text-text-600">
      {school} • {className} • {year}
    </Text>
  </div>
);

/**
 * A questions stats section: one or two metrics + legend + pie chart.
 * Total displayed = correctQuestions + incorrectQuestions + blankQuestions
 * (backend totalAnswered excludes blank questions).
 * When `count` + `countLabel` are provided, renders two MetricBoxes side by side.
 */
const QuestionsSection = ({
  title,
  totalLabel,
  stats,
  count,
  countLabel,
}: {
  title: string;
  totalLabel: string;
  stats: UserPerformanceQuestionStats;
  count?: number;
  countLabel?: string;
}) => {
  const displayTotal =
    stats.correctQuestions + stats.incorrectQuestions + stats.blankQuestions;
  const slices = buildQuestionsSlices(stats);

  return (
    <div className="flex flex-col gap-3">
      <SectionTitle>{title}</SectionTitle>
      {count !== undefined && countLabel ? (
        <div className="flex gap-3">
          <MetricBox className="flex-1" label={countLabel} value={count} />
          <MetricBox
            className="flex-1"
            label={totalLabel}
            value={displayTotal}
          />
        </div>
      ) : (
        <MetricBox label={totalLabel} value={displayTotal} />
      )}
      <LegendPieCard slices={slices} />
    </div>
  );
};

const LessonsTable = ({
  lessons,
  getLessonIcon,
}: {
  lessons: UserPerformanceLesson[];
  getLessonIcon?: (lesson: UserPerformanceLesson) => ReactNode;
}) => (
  <div className="flex flex-col gap-3">
    <SectionTitle>Aulas baixadas</SectionTitle>
    <div className="bg-background border border-border-50 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-100">
        <Text size="xs" weight="bold" className="text-text-600">
          Aula
        </Text>
        <Text size="xs" weight="bold" className="text-text-600">
          BNCC
        </Text>
      </div>
      {lessons.length === 0 ? (
        <div className="flex items-center justify-center py-6">
          <Text size="sm" className="text-text-400">
            Nenhuma aula baixada
          </Text>
        </div>
      ) : (
        lessons.map((lesson) => (
          <div
            key={lesson.lessonId}
            className="flex items-center justify-between px-4 py-3 border-b border-border-50 last:border-b-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              {getLessonIcon && (
                <span className="shrink-0 [&>svg]:w-5 [&>svg]:h-5">
                  {getLessonIcon(lesson)}
                </span>
              )}
              <Text size="sm" className="text-text-950 truncate">
                {lesson.lessonName}
              </Text>
            </div>
            <Text size="sm" className="text-text-500 shrink-0 ml-3">
              {lesson.bnccCode ?? '—'}
            </Text>
          </div>
        ))
      )}
    </div>
  </div>
);

// ─── Modal content ────────────────────────────────────────────

const StudentModalContent = ({
  data,
  getLessonIcon,
  activityCounts,
}: {
  data: UserPerformanceStudentData;
  getLessonIcon?: (lesson: UserPerformanceLesson) => ReactNode;
  activityCounts?: PerformanceReportModalProps['studentActivityCounts'];
}) => (
  <div className="flex flex-col gap-6">
    <UserHeader
      name={data.user.name}
      school={data.school.schoolName}
      className={data.class.className}
      year={data.schoolYear.schoolYearName}
      status={data.status}
    />

    <QuestionsSection
      title="Dados gerais"
      totalLabel="Total de questões respondidas"
      stats={data.generalStats}
    />

    <QuestionsSection
      title="Dados de atividades"
      totalLabel="Total de questões"
      stats={data.activityStats}
      count={activityCounts?.activities}
      countLabel="Atividades realizadas"
    />

    <QuestionsSection
      title="Dados de questionários"
      totalLabel="Total de questões"
      stats={data.questionnaireStats}
      count={activityCounts?.questionnaires}
      countLabel="Questionários realizados"
    />

    <QuestionsSection
      title="Dados de simulados"
      totalLabel="Total de questões"
      stats={data.simulationStats}
      count={activityCounts?.simulations}
      countLabel="Simulados realizados"
    />

    <LessonsTable
      lessons={data.downloadedLessons}
      getLessonIcon={getLessonIcon}
    />
  </div>
);

const ProfessionalModalContent = ({
  data,
  userInfo,
}: {
  data: UserPerformanceProfessionalData;
  userInfo?: PerformanceReportModalProps['professionalUserInfo'];
}) => {
  const slices = buildMaterialSlices(data.generalStats);

  return (
    <div className="flex flex-col gap-6">
      {userInfo && (
        <UserHeader
          name={userInfo.userName}
          school={userInfo.schoolName}
          className={userInfo.className}
          year={userInfo.year}
        />
      )}

      <div className="flex flex-col gap-3">
        <SectionTitle>Dados gerais</SectionTitle>
        <MetricBox
          label="Total de material produzido"
          value={data.generalStats.totalMaterialProduced}
        />
        <LegendPieCard slices={slices} />
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="flex flex-col gap-4 animate-pulse">
    <div className="h-16 bg-background-200 rounded-xl" />
    <div className="h-5 bg-background-200 rounded w-32 mt-2" />
    <div className="h-12 bg-background-200 rounded-xl" />
    <div className="h-32 bg-background-200 rounded-xl" />
  </div>
);

const ErrorContent = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-10 gap-3">
    <Text
      as="span"
      className="size-10 rounded-full bg-error-100 flex items-center justify-center"
    >
      <XCircleIcon size={20} className="text-error-700" weight="fill" />
    </Text>
    <Text size="sm" className="text-error-700 text-center">
      {message}
    </Text>
  </div>
);

// ─── Main component ───────────────────────────────────────────

/**
 * PerformanceReportModal component
 *
 * Displays a modal with performance data for a user from `GET /performance/user/:userId`.
 *
 * Two variants driven by the profile type:
 * - `STUDENT` — question stats per section (generalStats, activityStats,
 *   questionnaireStats, simulationStats) + downloaded lessons table
 * - `PROFESSIONAL` — material production stats (totalMaterialProduced,
 *   totalRecommendedLessons, totalActivities)
 *
 * The professional API response does not include user/school context.
 * Pass `professionalUserInfo` (from the table row) to show a user header.
 *
 * @example
 * ```tsx
 * // Student variant — pass API response directly
 * <PerformanceReportModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   variant={PerformanceReportModalVariant.STUDENT}
 *   data={apiResponse.data}
 * />
 *
 * // Professional variant — API has no user context, pass it separately
 * <PerformanceReportModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   variant={PerformanceReportModalVariant.PROFESSIONAL}
 *   data={apiResponse.data}
 *   professionalUserInfo={{
 *     userName: row.userName,
 *     schoolName: row.schoolName,
 *     className: row.className,
 *     year: row.year,
 *   }}
 * />
 * ```
 */
export const PerformanceReportModal = ({
  isOpen,
  onClose,
  title = 'Desempenho em 1 ano',
  variant,
  data,
  professionalUserInfo,
  getLessonIcon,
  studentActivityCounts,
  loading = false,
  error = null,
}: PerformanceReportModalProps) => {
  let content: ReactNode;

  if (loading) {
    content = <LoadingSkeleton />;
  } else if (error) {
    content = <ErrorContent message={error} />;
  } else if (data !== null) {
    if (variant === PerformanceReportModalVariant.STUDENT) {
      content = (
        <StudentModalContent
          data={data as UserPerformanceStudentData}
          getLessonIcon={getLessonIcon}
          activityCounts={studentActivityCounts}
        />
      );
    } else {
      content = (
        <ProfessionalModalContent
          data={data as UserPerformanceProfessionalData}
          userInfo={professionalUserInfo}
        />
      );
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      contentClassName="max-h-[80vh] overflow-y-auto"
    >
      {content}
    </Modal>
  );
};

export default PerformanceReportModal;
