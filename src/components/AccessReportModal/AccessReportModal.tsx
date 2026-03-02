import { type ReactNode } from 'react';
import Modal from '../Modal/Modal';
import { MetricBox } from '../shared/MetricBox';
import { LegendPieCard, type PieSlice } from '../shared/ChartComponents';
import {
  SectionTitle,
  UserHeader,
  ErrorContent,
} from '../shared/ModalComponents';
import { REPORT_MODAL_VARIANT } from '../../types/common';

// ─── Placeholder API Types ────────────────────────────────────
// Replace with real backend types once the access report API is ready.

/**
 * Platform breakdown — how many hours were spent on each platform.
 */
export interface AccessReportPlatformStats {
  web: number;
  mobile: number;
}

/**
 * Full 200 response for STUDENT access report.
 * Mirrors the expected backend StudentAccessReport shape (placeholder).
 */
export interface AccessReportStudentData {
  totalTime: string;
  content: number;
  recommendedLessons: number;
  simulations: number;
  accessCount: number;
  lastAccess: string;
  platformAccess: AccessReportPlatformStats;
  hoursByItem: {
    activities: number;
    content: number;
    simulations: number;
    questionnaires: number;
  };
}

/**
 * Full 200 response for TEACHER / UNIT_MANAGER / REGIONAL_MANAGER access report.
 * Mirrors the expected backend ProfessionalAccessReport shape (placeholder).
 */
export interface AccessReportProfessionalData {
  totalTime: string;
  activities: number;
  recommendedLessons: number;
  accessCount: number;
  lastAccess: string;
  platformAccess: AccessReportPlatformStats;
  hoursByItem: {
    activities: number;
    recommendedLessons: number;
  };
}

/** @deprecated Use {@link REPORT_MODAL_VARIANT} instead. Re-exported for backwards compatibility. */
export { REPORT_MODAL_VARIANT as AccessReportModalVariant } from '../../types/common';

interface AccessReportModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  /** Modal title (default: "Relatório de acesso") */
  title?: string;
  loading?: boolean;
  error?: string | null;
}

type AccessReportModalStudentProps = {
  variant: REPORT_MODAL_VARIANT.STUDENT;
  data: AccessReportStudentData | null;
  /**
   * Display info for the student modal header.
   * The student API response may not include user/school context,
   * so the parent can supply this from the table row data.
   */
  studentUserInfo?: {
    userName: string;
    schoolName: string;
    className: string;
    year: string | number;
  };
  professionalUserInfo?: never;
};

type AccessReportModalProfessionalProps = {
  variant: REPORT_MODAL_VARIANT.PROFESSIONAL;
  data: AccessReportProfessionalData | null;
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
  studentUserInfo?: never;
};

export type AccessReportModalProps = AccessReportModalBaseProps &
  (AccessReportModalStudentProps | AccessReportModalProfessionalProps);

// ─── Pie slice builders ───────────────────────────────────────

function buildPlatformSlices(stats: AccessReportPlatformStats): PieSlice[] {
  return [
    {
      label: 'Web',
      value: stats.web,
      colorClass: 'bg-success-700',
      color: 'var(--Success-success700, #206F3E)',
    },
    {
      label: 'Celular',
      value: stats.mobile,
      colorClass: 'bg-success-300',
      color: 'var(--Success-success300, #66B584)',
    },
  ];
}

function buildStudentHoursSlices(
  hoursByItem: AccessReportStudentData['hoursByItem']
): PieSlice[] {
  return [
    {
      label: 'Atividades',
      value: hoursByItem.activities,
      colorClass: 'bg-success-700',
      color: 'var(--Success-success700, #206F3E)',
    },
    {
      label: 'Conteúdo',
      value: hoursByItem.content,
      colorClass: 'bg-success-300',
      color: 'var(--Success-success300, #66B584)',
    },
    {
      label: 'Simulados',
      value: hoursByItem.simulations,
      colorClass: 'bg-warning-300',
      color: 'var(--Warning-warning300, #FDAD74)',
    },
    {
      label: 'Questionários',
      value: hoursByItem.questionnaires,
      colorClass: 'bg-indicator-positive',
      color: 'var(--Indicator-Indicator-Positive, #F8CC2E)',
    },
  ];
}

function buildProfessionalHoursSlices(
  hoursByItem: AccessReportProfessionalData['hoursByItem']
): PieSlice[] {
  return [
    {
      label: 'Atividades',
      value: hoursByItem.activities,
      colorClass: 'bg-success-700',
      color: 'var(--Success-success700, #206F3E)',
    },
    {
      label: 'Aulas recomendadas',
      value: hoursByItem.recommendedLessons,
      colorClass: 'bg-warning-300',
      color: 'var(--Indicator-Indicator-Positive, #F8CC2E)',
    },
  ];
}

// ─── Sub-components ──────────────────────────────────────────

// ─── Modal content ────────────────────────────────────────────

const StudentModalContent = ({
  data,
  userInfo,
}: {
  data: AccessReportStudentData;
  userInfo?: AccessReportModalProps['studentUserInfo'];
}) => {
  const platformSlices = buildPlatformSlices(data.platformAccess);
  const hoursSlices = buildStudentHoursSlices(data.hoursByItem);

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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MetricBox label="Tempo total" value={data.totalTime} />
        <MetricBox label="Conteúdo" value={data.content} />
        <MetricBox label="Aulas recomendadas" value={data.recommendedLessons} />
        <MetricBox label="Simulados" value={data.simulations} />
        <MetricBox label="Quantidade de acessos" value={data.accessCount} />
        <MetricBox label="Último acesso" value={data.lastAccess} />
      </div>

      <div className="flex flex-col gap-3">
        <SectionTitle>Plataforma de acesso</SectionTitle>
        <LegendPieCard slices={platformSlices} />
      </div>

      <div className="flex flex-col gap-3">
        <SectionTitle>Horas por item</SectionTitle>
        <LegendPieCard slices={hoursSlices} />
      </div>
    </div>
  );
};

const ProfessionalModalContent = ({
  data,
  userInfo,
}: {
  data: AccessReportProfessionalData;
  userInfo?: AccessReportModalProps['professionalUserInfo'];
}) => {
  const platformSlices = buildPlatformSlices(data.platformAccess);
  const hoursSlices = buildProfessionalHoursSlices(data.hoursByItem);

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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MetricBox label="Tempo total" value={data.totalTime} />
        <MetricBox label="Atividades" value={data.activities} />
        <MetricBox label="Aulas recomendadas" value={data.recommendedLessons} />
        <MetricBox label="Quantidade de acessos" value={data.accessCount} />
        <MetricBox label="Último acesso" value={data.lastAccess} />
      </div>

      <div className="flex flex-col gap-3">
        <SectionTitle>Plataforma de acesso</SectionTitle>
        <LegendPieCard slices={platformSlices} />
      </div>

      <div className="flex flex-col gap-3">
        <SectionTitle>Horas por item</SectionTitle>
        <LegendPieCard slices={hoursSlices} />
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="flex flex-col gap-4 animate-pulse">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={`skeleton-${String(i)}`} className="h-16 bg-background-200 rounded-xl" />
      ))}
    </div>
    <div className="h-5 bg-background-200 rounded w-40 mt-2" />
    <div className="h-32 bg-background-200 rounded-xl" />
    <div className="h-5 bg-background-200 rounded w-32" />
    <div className="h-32 bg-background-200 rounded-xl" />
  </div>
);

// ─── Main component ───────────────────────────────────────────

/**
 * AccessReportModal component
 *
 * Displays a modal with access data for a user.
 *
 * Two variants driven by the profile type:
 * - `STUDENT` — 6 metric boxes (totalTime, content, recommendedLessons, simulations,
 *   accessCount, lastAccess) + platform pie chart + hours-by-item pie chart
 * - `PROFESSIONAL` — 5 metric boxes (totalTime, activities, recommendedLessons,
 *   accessCount, lastAccess) + platform pie chart + hours-by-item pie chart
 *
 * @example
 * ```tsx
 * <AccessReportModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   variant={AccessReportModalVariant.STUDENT}
 *   data={apiResponse.data}
 * />
 * ```
 */
export const AccessReportModal = ({
  isOpen,
  onClose,
  title = 'Relatório de acesso',
  loading = false,
  error = null,
  ...variantProps
}: AccessReportModalProps) => {
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
          userInfo={variantProps.studentUserInfo}
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

export default AccessReportModal;
