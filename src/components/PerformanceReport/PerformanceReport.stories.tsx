import type { Story } from '@ladle/react';
import { useState } from 'react';
import { PerformanceReport, PerformanceCard } from './PerformanceReport';
import type {
  PerformanceReportTab,
  PerformanceCardData,
} from './PerformanceReport';
import { PROFILE_ROLES } from './PerformanceReport';
import Text from '../Text/Text';
import {
  StudentIcon,
  PencilRulerIcon,
  MapPinSimpleIcon,
  MapPinSimpleAreaIcon,
  CityIcon,
  GraduationCapIcon,
  UsersFourIcon,
  BookBookmarkIcon,
  FileIcon,
} from '@phosphor-icons/react';

/**
 * Simulated API response for STUDENT profile
 */
const studentData = {
  cities: 42,
  schools: 150,
  classes: 1200,
  students: 5000,
  teachers: 320,
};

/**
 * Simulated API response for non-STUDENT profiles
 */
const defaultData = {
  activities: 80,
  recommendedLessons: 45,
};

/**
 * Transforms STUDENT API data to cards
 */
const studentCards: PerformanceCardData[] = [
  {
    id: 'cities',
    label: 'CIDADES',
    value: studentData.cities,
    icon: <CityIcon />,
  },
  {
    id: 'schools',
    label: 'ESCOLAS',
    value: studentData.schools,
    icon: <GraduationCapIcon />,
  },
  {
    id: 'classes',
    label: 'TURMAS',
    value: studentData.classes,
    icon: <UsersFourIcon />,
  },
  {
    id: 'students',
    label: 'ESTUDANTES',
    value: studentData.students,
    icon: <StudentIcon />,
  },
  {
    id: 'teachers',
    label: 'PROFESSORES',
    value: studentData.teachers,
    icon: <PencilRulerIcon />,
  },
];

/**
 * Transforms non-STUDENT API data to cards
 */
const defaultCards: PerformanceCardData[] = [
  {
    id: 'activities',
    label: 'ATIVIDADES',
    value: defaultData.activities,
    icon: <FileIcon />,
  },
  {
    id: 'lessons',
    label: 'AULAS RECOMENDADAS',
    value: defaultData.recommendedLessons,
    icon: <BookBookmarkIcon />,
  },
];

/**
 * Tabs matching the Figma design
 */
const figmaTabs: PerformanceReportTab[] = [
  {
    value: PROFILE_ROLES.STUDENT,
    label: 'Estudante',
    icon: <StudentIcon size={17} />,
    cards: studentCards,
  },
  {
    value: PROFILE_ROLES.TEACHER,
    label: 'Professor',
    icon: <PencilRulerIcon size={17} />,
    cards: defaultCards,
  },
  {
    value: PROFILE_ROLES.UNIT_MANAGER,
    label: 'Gestor unidade',
    icon: <MapPinSimpleIcon size={17} />,
    cards: defaultCards,
  },
  {
    value: PROFILE_ROLES.REGIONAL_MANAGER,
    label: 'Gestor regional',
    icon: <MapPinSimpleAreaIcon size={17} />,
    cards: defaultCards,
  },
];

/**
 * Complete example matching Figma design
 */
export const FigmaDesign: Story = () => (
  <div className="p-4">
    <PerformanceReport tabs={figmaTabs} />
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
      <PerformanceReport
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
    <PerformanceReport tabs={[figmaTabs[0]]} />
  </div>
);

/**
 * Two cards layout (non-STUDENT profile)
 */
export const TwoCards: Story = () => (
  <div className="p-4">
    <PerformanceReport
      tabs={[
        {
          value: 'teacher',
          label: 'Professor',
          cards: defaultCards,
        },
      ]}
    />
  </div>
);

/**
 * Individual PerformanceCard showcase
 */
export const IndividualCards: Story = () => (
  <div className="flex flex-col gap-4 p-4">
    <Text as="h2" size="xl" weight="bold">
      PerformanceCard - Variações
    </Text>
    <div className="grid grid-cols-3 gap-4">
      <PerformanceCard
        data={{
          id: 'cities',
          label: 'CIDADES',
          value: 42,
          icon: <CityIcon />,
        }}
      />
      <PerformanceCard
        data={{
          id: 'schools',
          label: 'ESCOLAS',
          value: 150,
          icon: <GraduationCapIcon />,
        }}
      />
      <PerformanceCard
        data={{
          id: 'students',
          label: 'ESTUDANTES',
          value: '5.000',
          icon: <StudentIcon />,
        }}
      />
    </div>
  </div>
);
