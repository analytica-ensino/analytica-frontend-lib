import { type ReactNode } from 'react';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import Badge from '../Badge/Badge';
import { MetricBox } from '../shared/MetricBox';
import { LegendPieCard, type PieSlice } from '../shared/ChartComponents';
import {
  SectionTitle,
  UserHeader,
  ErrorContent,
} from '../shared/ModalComponents';
import { REPORT_PERIOD, REPORT_MODAL_VARIANT } from '../../types/common';
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

/** @deprecated Use {@link REPORT_MODAL_VARIANT} instead. Re-exported for backwards compatibility. */
export { REPORT_MODAL_VARIANT as PerformanceReportModalVariant };

interface PerformanceReportModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  /** Modal title (default: "Desempenho em 1 ano") */
  title?: string;
  loading?: boolean;
  error?: string | null;
}

type PerformanceReportModalStudentProps = {
  variant: REPORT_MODAL_VARIANT.STUDENT;
  data: UserPerformanceStudentData | null;
  /**
   * Optional icon mapper for the downloaded lessons table.
   * The API does not return icons; the parent can derive them from lesson data.
   */
  getLessonIcon?: (lesson: UserPerformanceLesson) => ReactNode;
  /**
   * Optional activity/questionnaire/simulation done counts.
   * These are not part of the API response — pass them from other data sources.
   */
  studentActivityCounts?: {
    activities?: number;
    questionnaires?: number;
    simulations?: number;
  };
  professionalUserInfo?: never;
};

type PerformanceReportModalProfessionalProps = {
  variant: REPORT_MODAL_VARIANT.PROFESSIONAL;
  data: UserPerformanceProfessionalData | null;
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
  getLessonIcon?: never;
  studentActivityCounts?: never;
};

export type PerformanceReportModalProps = PerformanceReportModalBaseProps &
  (
    | PerformanceReportModalStudentProps
    | PerformanceReportModalProfessionalProps
  );

// ─── Status → Badge variant mapping ──────────────────────────

function getStatusVariant(
  status: string
): 'success' | 'info' | 'warning' | 'error' {
  return (
    Object.values(PERFORMANCE_TAG_CONFIG).find((c) => c.label === status)
      ?.variant ?? 'info'
  );
}

// ─── Pie slice builders ───────────────────────────────────────

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
      statusBadge={
        data.status ? (
          <Badge
            variant="solid"
            action={getStatusVariant(data.status)}
            size="small"
          >
            {data.status.toUpperCase()}
          </Badge>
        ) : undefined
      }
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
  loading = false,
  error = null,
  ...variantProps
}: PerformanceReportModalProps) => {
  let content: ReactNode;

  if (loading) {
    content = <LoadingSkeleton />;
  } else if (error) {
    content = <ErrorContent message={error} />;
  } else if (variantProps.data !== null) {
    if (variantProps.variant === REPORT_MODAL_VARIANT.STUDENT) {
      content = (
        <StudentModalContent
          data={variantProps.data}
          getLessonIcon={variantProps.getLessonIcon}
          activityCounts={variantProps.studentActivityCounts}
        />
      );
    } else {
      content = (
        <ProfessionalModalContent
          data={variantProps.data}
          userInfo={variantProps.professionalUserInfo}
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
