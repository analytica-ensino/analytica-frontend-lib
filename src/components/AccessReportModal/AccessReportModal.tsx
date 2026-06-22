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
import {
  SimpleBarChart,
  type SimpleBarChartDataItem,
} from '../SimpleBarChart/SimpleBarChart';

// ─── API Types ────────────────────────────────────────────────

/**
 * Time + percentage pair returned by the backend for platform/hours breakdowns.
 */
export interface AccessReportTimePercentage {
  time: string;
  percentage: number;
}

/**
 * User context returned by the backend inside every access report response.
 */
export interface AccessReportUser {
  id: string;
  name: string;
  profileType: string;
  school: string;
  group: string | null;
  class: string | null;
  year: number;
}

/**
 * Platform access breakdown — web vs mobile.
 */
export interface AccessReportByPlatform {
  web: AccessReportTimePercentage;
  mobile: AccessReportTimePercentage;
}

/**
 * Full 200 response for STUDENT access report.
 * Mirrors backend shape from GET /access-report/access/user/:userId (student variant).
 */
export interface AccessReportStudentData {
  user: AccessReportUser;
  accessData: {
    totalTime: string;
    activitiesTime: string;
    contentTime: string;
    recommendedLessonsTime: string;
    simulationsTime: string;
    questionnairesTime: string;
    accessCount: number;
    lastAccess: string | null;
  };
  accessByPlatform: AccessReportByPlatform;
  hoursByItem: {
    activities: AccessReportTimePercentage;
    content: AccessReportTimePercentage;
    simulations: AccessReportTimePercentage;
    questionnaires: AccessReportTimePercentage;
  };
}

/**
 * Full 200 response for TEACHER / UNIT_MANAGER / REGIONAL_MANAGER access report.
 * Mirrors backend shape from GET /access-report/access/user/:userId (professional variant).
 */
export interface AccessReportProfessionalData {
  user: AccessReportUser;
  accessData: {
    totalTime: string;
    activitiesTime: string;
    recommendedLessonsTime: string;
    accessCount: number;
    lastAccess: string | null;
  };
  accessByPlatform: AccessReportByPlatform;
  hoursByItem: {
    activities: AccessReportTimePercentage;
    recommendedLessons: AccessReportTimePercentage;
  };
}

/** @deprecated Use {@link REPORT_MODAL_VARIANT} instead. Re-exported for backwards compatibility. */
export { REPORT_MODAL_VARIANT as AccessReportModalVariant } from '../../types/common';

/**
 * Access count by period item for bar chart
 */
export interface AccessCountByPeriodItem {
  label: string;
  count: number;
}

interface AccessReportModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  /** Modal title (default: "Relatório de acesso") */
  title?: string;
  loading?: boolean;
  error?: string | null;
  /** Optional access count by period data for rendering the access count chart */
  accessCountByPeriod?: AccessCountByPeriodItem[];
}

type AccessReportModalStudentProps = {
  variant: REPORT_MODAL_VARIANT.STUDENT;
  data: AccessReportStudentData | null;
};

type AccessReportModalProfessionalProps = {
  variant: REPORT_MODAL_VARIANT.PROFESSIONAL;
  data: AccessReportProfessionalData | null;
};

export type AccessReportModalProps = AccessReportModalBaseProps &
  (AccessReportModalStudentProps | AccessReportModalProfessionalProps);

// ─── Pie slice builders ───────────────────────────────────────

function buildPlatformSlices(platform: AccessReportByPlatform): PieSlice[] {
  return [
    {
      label: 'Web',
      value: platform.web.percentage,
      colorClass: 'bg-success-700',
      color: 'var(--Success-success700, #206F3E)',
    },
    {
      label: 'Celular',
      value: platform.mobile.percentage,
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
      value: hoursByItem.activities.percentage,
      colorClass: 'bg-success-700',
      color: 'var(--Success-success700, #206F3E)',
    },
    {
      label: 'Conteúdo',
      value: hoursByItem.content.percentage,
      colorClass: 'bg-success-300',
      color: 'var(--Success-success300, #66B584)',
    },
    {
      label: 'Simulados',
      value: hoursByItem.simulations.percentage,
      colorClass: 'bg-warning-300',
      color: 'var(--Warning-warning300, #FDAD74)',
    },
    {
      label: 'Questionários',
      value: hoursByItem.questionnaires.percentage,
      colorClass: 'bg-indicator-positive',
      color: 'var(--Indicator-Indicator-Positive, #F8CC2E)',
    },
  ];
}

// ─── Modal content ────────────────────────────────────────────

const ReportContentLayout = ({
  user,
  metricBoxes,
  platformSlices,
  hoursSlices,
  accessCountByPeriod,
}: {
  user: AccessReportUser;
  metricBoxes: ReactNode;
  platformSlices: PieSlice[];
  hoursSlices: PieSlice[];
  accessCountByPeriod?: AccessCountByPeriodItem[];
}) => (
  <div className="flex flex-col gap-6">
    <UserHeader
      name={user.name}
      school={user.school}
      className={user.class ?? ''}
      year={user.year}
    />

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{metricBoxes}</div>

    {accessCountByPeriod && accessCountByPeriod.length > 0 && (
      <SimpleBarChart
        data={accessCountByPeriod.map((item) => ({
          label: item.label,
          value: item.count,
        }))}
        title="Quantidade de acessos por período"
        barColor="bg-info-500"
        chartHeight={150}
      />
    )}

    <div className="flex flex-col gap-3">
      <SectionTitle>Dados de acesso por plataforma</SectionTitle>
      <LegendPieCard slices={platformSlices} />
    </div>

    <div className="flex flex-col gap-3">
      <SectionTitle>Dados de horas por item</SectionTitle>
      <LegendPieCard slices={hoursSlices} />
    </div>
  </div>
);

const StudentModalContent = ({
  data,
  accessCountByPeriod,
}: {
  data: AccessReportStudentData;
  accessCountByPeriod?: AccessCountByPeriodItem[];
}) => (
  <ReportContentLayout
    user={data.user}
    platformSlices={buildPlatformSlices(data.accessByPlatform)}
    hoursSlices={buildStudentHoursSlices(data.hoursByItem)}
    accessCountByPeriod={accessCountByPeriod}
    metricBoxes={
      <>
        <MetricBox label="Tempo total" value={data.accessData.totalTime} />
        <MetricBox label="Conteúdo" value={data.accessData.contentTime} />
        <MetricBox
          label="Aulas recomendadas"
          value={data.accessData.recommendedLessonsTime}
        />
        <MetricBox label="Simulados" value={data.accessData.simulationsTime} />
        <MetricBox
          label="Quantidade de acessos"
          value={data.accessData.accessCount}
        />
        <MetricBox
          label="Último acesso"
          value={data.accessData.lastAccess ?? '—'}
        />
      </>
    }
  />
);

const ProfessionalModalContent = ({
  data,
  accessCountByPeriod,
}: {
  data: AccessReportProfessionalData;
  accessCountByPeriod?: AccessCountByPeriodItem[];
}) => (
  <div className="flex flex-col gap-6">
    <UserHeader
      name={data.user.name}
      school={data.user.school}
      className={data.user.class ?? ''}
      year={data.user.year}
    />

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <MetricBox
        label="Tempo na plataforma"
        value={data.accessData.totalTime}
      />
      <MetricBox
        label="Quantidade de acessos"
        value={data.accessData.accessCount}
      />
      <MetricBox
        label="Último acesso"
        value={data.accessData.lastAccess ?? '—'}
      />
    </div>

    {accessCountByPeriod && accessCountByPeriod.length > 0 && (
      <SimpleBarChart
        data={accessCountByPeriod.map((item) => ({
          label: item.label,
          value: item.count,
        }))}
        title="Quantidade de acessos por período"
        barColor="bg-info-500"
        chartHeight={150}
      />
    )}

    <div className="flex flex-col gap-3">
      <SectionTitle>Dados de acesso por plataforma</SectionTitle>
      <LegendPieCard slices={buildPlatformSlices(data.accessByPlatform)} />
    </div>
  </div>
);

const LoadingSkeleton = ({
  metricCount,
  showSecondaryChart = true,
}: {
  metricCount: number;
  showSecondaryChart?: boolean;
}) => (
  <div className="flex flex-col gap-4 animate-pulse">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: metricCount }, (_, i) => (
        <div
          key={`skeleton-${String(i)}`}
          className="h-16 bg-background-200 rounded-xl"
        />
      ))}
    </div>
    <div className="h-5 bg-background-200 rounded w-40 mt-2" />
    <div className="h-32 bg-background-200 rounded-xl" />
    {showSecondaryChart && (
      <>
        <div className="h-5 bg-background-200 rounded w-32" />
        <div className="h-32 bg-background-200 rounded-xl" />
      </>
    )}
  </div>
);

// ─── Main component ───────────────────────────────────────────

/**
 * AccessReportModal component
 *
 * Displays a modal with access data for a user.
 *
 * Two variants driven by the profile type:
 * - `STUDENT` — 6 metric boxes (totalTime, contentTime, recommendedLessonsTime,
 *   simulationsTime, accessCount, lastAccess) + platform pie chart + hours-by-item pie chart
 * - `PROFESSIONAL` — 3 metric boxes (totalTime, accessCount, lastAccess) +
 *   platform pie chart only (no hours-by-item breakdown for professionals)
 *
 * @example
 * ```tsx
 * <AccessReportModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   variant={REPORT_MODAL_VARIANT.STUDENT}
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
  accessCountByPeriod,
  ...variantProps
}: AccessReportModalProps) => {
  let content: ReactNode;

  const isStudent = variantProps.variant === REPORT_MODAL_VARIANT.STUDENT;
  // Student: 6 metrics + 2 charts; Professional: 3 metrics + 1 chart
  const metricCount = isStudent ? 6 : 3;
  const showSecondaryChart = isStudent;

  if (loading) {
    content = (
      <LoadingSkeleton
        metricCount={metricCount}
        showSecondaryChart={showSecondaryChart}
      />
    );
  } else if (error) {
    content = <ErrorContent message={error} />;
  } else if (variantProps.data === null) {
    content = <ErrorContent message="Nenhum dado disponível." />;
  } else if (variantProps.variant === REPORT_MODAL_VARIANT.STUDENT) {
    content = (
      <StudentModalContent
        data={variantProps.data}
        accessCountByPeriod={accessCountByPeriod}
      />
    );
  } else if (variantProps.variant === REPORT_MODAL_VARIANT.PROFESSIONAL) {
    content = (
      <ProfessionalModalContent
        data={variantProps.data}
        accessCountByPeriod={accessCountByPeriod}
      />
    );
  } else {
    content = <ErrorContent message="Variante de relatório inválida." />;
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
