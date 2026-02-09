import type { Story } from '@ladle/react';
import { type ReactNode, useState } from 'react';
import {
  TimeReport,
  TimeCard,
  formatHoursToTime,
  formatVariation,
  getTrendDirection,
} from './TimeReport';
import type { TimeReportTab, TimeCardData, TimeReportData } from './TimeReport';
import { PROFILE_ROLES } from './TimeReport';
import Text from '../Text/Text';
import {
  StudentIcon,
  MonitorIcon,
  FileIcon,
  ExamIcon,
  BookOpenIcon,
  ChalkboardTeacherIcon,
  PencilRulerIcon,
  MapPinSimpleIcon,
  MapPinSimpleAreaIcon,
} from '@phosphor-icons/react';

/**
 * Helper: creates a TimeCardData from a TimeMetric
 */
const metricToCard = (
  id: string,
  label: string,
  icon: ReactNode,
  metric: { hours: number; variation_percent: number | null }
): TimeCardData => ({
  id,
  label,
  value: formatHoursToTime(metric.hours),
  icon,
  trendValue: formatVariation(metric.variation_percent),
  trendDirection: getTrendDirection(metric.variation_percent),
});

/**
 * Transforms API response data to TimeCardData[] for STUDENT profile
 */
const studentCardsFromApi = (data: TimeReportData): TimeCardData[] => {
  const cards: TimeCardData[] = [
    metricToCard(
      'platform',
      'TEMPO NA PLATAFORMA',
      <MonitorIcon />,
      data.total_platform_time
    ),
    metricToCard(
      'activity',
      'TEMPO EM ATIVIDADES',
      <FileIcon />,
      data.activity_time
    ),
  ];
  if (data.exam_simulation_time) {
    cards.push(
      metricToCard(
        'simulation',
        'TEMPO EM SIMULADOS',
        <ExamIcon />,
        data.exam_simulation_time
      )
    );
  }
  if (data.content_time) {
    cards.push(
      metricToCard(
        'content',
        'TEMPO EM CONTEÚDO',
        <ChalkboardTeacherIcon />,
        data.content_time
      )
    );
  }
  cards.push(
    metricToCard(
      'lessons',
      'TEMPO EM AULAS RECOMENDADAS',
      <BookOpenIcon />,
      data.recommended_classes_time
    )
  );
  return cards;
};

/**
 * Transforms API response data to TimeCardData[] for non-STUDENT profiles
 */
const defaultCardsFromApi = (data: TimeReportData): TimeCardData[] => [
  metricToCard(
    'platform',
    'TEMPO NA PLATAFORMA',
    <MonitorIcon />,
    data.total_platform_time
  ),
  metricToCard(
    'activity',
    'TEMPO EM ATIVIDADES',
    <FileIcon />,
    data.activity_time
  ),
  metricToCard(
    'lessons',
    'TEMPO EM AULAS RECOMENDADAS',
    <BookOpenIcon />,
    data.recommended_classes_time
  ),
];

/**
 * Simulated API response for STUDENT profile
 */
const studentApiResponse: TimeReportData = {
  total_platform_time: { hours: 150.5, variation_percent: 12.3 },
  activity_time: { hours: 45.2, variation_percent: 8.5 },
  exam_simulation_time: { hours: 30.0, variation_percent: -5.2 },
  content_time: { hours: 25.8, variation_percent: 15.0 },
  recommended_classes_time: { hours: 49.5, variation_percent: null },
};

/**
 * Simulated API response for other profiles
 */
const otherApiResponse: TimeReportData = {
  total_platform_time: { hours: 120.3, variation_percent: 10.0 },
  activity_time: { hours: 38.7, variation_percent: -3.5 },
  recommended_classes_time: { hours: 81.6, variation_percent: 5.8 },
};

/**
 * Tabs matching the Figma design, built from API data
 */
const figmaTabs: TimeReportTab[] = [
  {
    value: PROFILE_ROLES.STUDENT,
    label: 'Estudante',
    icon: <StudentIcon size={17} />,
    cards: studentCardsFromApi(studentApiResponse),
  },
  {
    value: PROFILE_ROLES.TEACHER,
    label: 'Professor',
    icon: <PencilRulerIcon size={17} />,
    cards: defaultCardsFromApi(otherApiResponse),
  },
  {
    value: PROFILE_ROLES.UNIT_MANAGER,
    label: 'Gestor unidade',
    icon: <MapPinSimpleIcon size={17} />,
    cards: defaultCardsFromApi(otherApiResponse),
  },
  {
    value: PROFILE_ROLES.REGIONAL_MANAGER,
    label: 'Gestor regional',
    icon: <MapPinSimpleAreaIcon size={17} />,
    cards: defaultCardsFromApi(otherApiResponse),
  },
];

/**
 * Complete example matching Figma design
 */
export const FigmaDesign: Story = () => (
  <div className="p-4">
    <TimeReport tabs={figmaTabs} />
  </div>
);

/**
 * Controlled tab state
 */
export const Controlled: Story = () => {
  const [activeTab, setActiveTab] = useState<string>(PROFILE_ROLES.STUDENT);

  return (
    <div className="flex flex-col gap-4 p-4">
      <Text size="sm" className="text-text-500">
        profile={activeTab}
      </Text>
      <TimeReport
        tabs={figmaTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

/**
 * Single tab (no tab navigation)
 */
export const SingleTab: Story = () => (
  <div className="p-4">
    <TimeReport tabs={[figmaTabs[0]]} />
  </div>
);

/**
 * Cards without trend (variation_percent: null)
 */
export const NoTrend: Story = () => {
  const noTrendData: TimeReportData = {
    total_platform_time: { hours: 12.33, variation_percent: null },
    activity_time: { hours: 8.75, variation_percent: null },
    recommended_classes_time: { hours: 3.25, variation_percent: null },
  };

  return (
    <div className="p-4">
      <TimeReport
        tabs={[
          {
            value: 'no-trend',
            label: 'Sem tendência',
            cards: defaultCardsFromApi(noTrendData),
          },
        ]}
      />
    </div>
  );
};

/**
 * Individual TimeCard showcase
 */
export const IndividualCards: Story = () => (
  <div className="flex flex-col gap-4 p-4">
    <Text as="h2" size="xl" weight="bold">
      TimeCard - Variações
    </Text>
    <div className="grid grid-cols-3 gap-4">
      <TimeCard
        data={metricToCard('up', 'TEMPO NA PLATAFORMA', <MonitorIcon />, {
          hours: 150.5,
          variation_percent: 12.3,
        })}
      />
      <TimeCard
        data={metricToCard(
          'down',
          'TEMPO EM CONTEÚDO',
          <ChalkboardTeacherIcon />,
          { hours: 25.8, variation_percent: -5.2 }
        )}
      />
      <TimeCard
        data={metricToCard('none', 'TEMPO EM SIMULADOS', <ExamIcon />, {
          hours: 200.0,
          variation_percent: null,
        })}
      />
    </div>
  </div>
);
