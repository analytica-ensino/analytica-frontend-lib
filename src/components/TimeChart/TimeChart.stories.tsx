import type { Story } from '@ladle/react';
import {
  TimeChart,
  STUDENT_CATEGORIES,
  DEFAULT_CATEGORIES,
} from './TimeChart';

// ─── Period: Semana (7 dias) ─────────────────────────────────

const weekStudentPeriods = [
  { label: 'SEG', activities: 2, content: 4, simulations: 3, questionnaires: 2 },
  { label: 'TER', activities: 2.5, content: 4, simulations: 3, questionnaires: 2 },
  { label: 'QUA', activities: 4, content: 3, simulations: 2, questionnaires: 2 },
  { label: 'QUI', activities: 3, content: 4, simulations: 2, questionnaires: 2 },
  { label: 'SEX', activities: 2, content: 2.5, simulations: 1.5, questionnaires: 2 },
  { label: 'SAB', activities: 1, content: 2, simulations: 1.5, questionnaires: 2 },
  { label: 'DOM', activities: 2, content: 4, simulations: 2, questionnaires: 3 },
];

const weekTeacherPeriods = [
  { label: 'SEG', activities: 0, recommendedLessons: 11 },
  { label: 'TER', activities: 3.5, recommendedLessons: 7 },
  { label: 'QUA', activities: 9, recommendedLessons: 2 },
  { label: 'QUI', activities: 0, recommendedLessons: 11 },
  { label: 'SEX', activities: 1.5, recommendedLessons: 6 },
  { label: 'SAB', activities: 0, recommendedLessons: 6.5 },
  { label: 'DOM', activities: 0, recommendedLessons: 11 },
];

// ─── Period: 1 mês (semanas) ─────────────────────────────────

const monthPeriods = [
  { label: '1-7', activities: 2, content: 3, simulations: 3, questionnaires: 2 },
  { label: '8-14', activities: 3, content: 5, simulations: 1, questionnaires: 1 },
  { label: '15-21', activities: 8, content: 2, simulations: 0, questionnaires: 0 },
  { label: '22-28', activities: 7, content: 3, simulations: 0, questionnaires: 0 },
  { label: '29-31', activities: 1, content: 1, simulations: 0, questionnaires: 5 },
];

// ─── Period: 3 meses ─────────────────────────────────────────

const threeMonthsPeriods = [
  { label: 'JAN', activities: 2, content: 3, simulations: 3, questionnaires: 2 },
  { label: 'FEV', activities: 8, content: 2, simulations: 0, questionnaires: 0 },
  { label: 'MAR', activities: 7, content: 3, simulations: 0, questionnaires: 0 },
];

// ─── Period: 6 meses ─────────────────────────────────────────

const sixMonthsPeriods = [
  { label: 'JUL', activities: 4, content: 5, simulations: 1, questionnaires: 1 },
  { label: 'AGO', activities: 7, content: 3, simulations: 1, questionnaires: 0 },
  { label: 'SET', activities: 8, content: 2, simulations: 0, questionnaires: 0 },
  { label: 'OUT', activities: 0, content: 0, simulations: 5, questionnaires: 2 },
  { label: 'NOV', activities: 0, content: 0, simulations: 4, questionnaires: 2 },
  { label: 'DEZ', activities: 2, content: 4, simulations: 2, questionnaires: 3 },
];

// ─── Period: 1 ano ───────────────────────────────────────────

const yearPeriods = [
  { label: 'JAN', activities: 3, content: 5, simulations: 2, questionnaires: 1 },
  { label: 'FEV', activities: 4, content: 5, simulations: 1, questionnaires: 1 },
  { label: 'MAR', activities: 3, content: 5, simulations: 2, questionnaires: 1 },
  { label: 'ABR', activities: 3, content: 6, simulations: 1, questionnaires: 1 },
  { label: 'MAI', activities: 4, content: 5, simulations: 1, questionnaires: 1 },
  { label: 'JUN', activities: 3, content: 5, simulations: 2, questionnaires: 1 },
  { label: 'JUL', activities: 5, content: 5, simulations: 1, questionnaires: 1 },
  { label: 'AGO', activities: 7, content: 3, simulations: 1, questionnaires: 0 },
  { label: 'SET', activities: 8, content: 2, simulations: 0, questionnaires: 0 },
  { label: 'OUT', activities: 0, content: 0, simulations: 5, questionnaires: 2 },
  { label: 'NOV', activities: 0, content: 0, simulations: 4, questionnaires: 2 },
  { label: 'DEZ', activities: 2, content: 4, simulations: 2, questionnaires: 3 },
];

// ─── Stories ─────────────────────────────────────────────────

/**
 * Student profile - Period: Semana (7 dias)
 */
export const StudentWeek: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <TimeChart
      data={{
        categories: STUDENT_CATEGORIES,
        hoursByPeriod: weekStudentPeriods,
        hoursByItem: { activities: 20, content: 45, simulations: 20, questionnaires: 15 },
      }}
      barChartTitle="Dados de horas por semana"
    />
  </div>
);

/**
 * Student profile - Period: 1 mês (semanas do mês)
 */
export const StudentMonth: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <TimeChart
      data={{
        categories: STUDENT_CATEGORIES,
        hoursByPeriod: monthPeriods,
        hoursByItem: { activities: 30, content: 30, simulations: 20, questionnaires: 20 },
      }}
      barChartTitle="Dados de horas por 1 mês"
    />
  </div>
);

/**
 * Student profile - Period: 3 meses
 */
export const StudentThreeMonths: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <TimeChart
      data={{
        categories: STUDENT_CATEGORIES,
        hoursByPeriod: threeMonthsPeriods,
        hoursByItem: { activities: 50, content: 25, simulations: 15, questionnaires: 10 },
      }}
      barChartTitle="Dados de horas 3 meses"
    />
  </div>
);

/**
 * Student profile - Period: 6 meses
 */
export const StudentSixMonths: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <TimeChart
      data={{
        categories: STUDENT_CATEGORIES,
        hoursByPeriod: sixMonthsPeriods,
        hoursByItem: { activities: 35, content: 25, simulations: 20, questionnaires: 20 },
      }}
      barChartTitle="Dados de horas por 6 meses"
    />
  </div>
);

/**
 * Student profile - Period: 1 ano (12 meses)
 */
export const StudentYear: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <TimeChart
      data={{
        categories: STUDENT_CATEGORIES,
        hoursByPeriod: yearPeriods,
        hoursByItem: { activities: 30, content: 35, simulations: 15, questionnaires: 20 },
      }}
      barChartTitle="Dados de horas por 1 ano"
    />
  </div>
);

/**
 * Teacher/Manager profile - Period: Semana
 */
export const TeacherWeek: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <TimeChart
      data={{
        categories: DEFAULT_CATEGORIES,
        hoursByPeriod: weekTeacherPeriods,
        hoursByItem: { activities: 30, recommendedLessons: 70 },
      }}
      barChartTitle="Dados de horas por semana"
    />
  </div>
);

/**
 * Edge case: all values are zero
 */
export const ZeroValues: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <TimeChart
      data={{
        categories: STUDENT_CATEGORIES,
        hoursByPeriod: weekStudentPeriods.map((d) => ({
          label: d.label,
          activities: 0,
          content: 0,
          simulations: 0,
          questionnaires: 0,
        })),
      }}
    />
  </div>
);

/**
 * Example using API response directly (simulated student API response)
 */
export const ApiDirectStudent: Story = () => {
  // Simulated API response - data passed directly without transforms
  const apiResponse = {
    message: 'Success',
    data: {
      labels: ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'],
      hoursByPeriod: [
        { label: 'SEG', activities: 2, content: 4, simulations: 3, questionnaires: 2 },
        { label: 'TER', activities: 2.5, content: 4, simulations: 3, questionnaires: 2 },
        { label: 'QUA', activities: 4, content: 3, simulations: 2, questionnaires: 2 },
        { label: 'QUI', activities: 3, content: 4, simulations: 2, questionnaires: 2 },
        { label: 'SEX', activities: 2, content: 2.5, simulations: 1.5, questionnaires: 2 },
        { label: 'SAB', activities: 1, content: 2, simulations: 1.5, questionnaires: 2 },
        { label: 'DOM', activities: 2, content: 4, simulations: 2, questionnaires: 3 },
      ],
      hoursByItem: {
        activities: 20,
        content: 45,
        simulations: 20,
        questionnaires: 15,
      },
    },
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <TimeChart
        data={{
          categories: STUDENT_CATEGORIES,
          hoursByPeriod: apiResponse.data.hoursByPeriod,
          hoursByItem: apiResponse.data.hoursByItem,
        }}
        barChartTitle="Dados de horas por semana"
      />
    </div>
  );
};

/**
 * Example using API response directly (simulated teacher API response)
 */
export const ApiDirectTeacher: Story = () => {
  // Simulated API response - data passed directly without transforms
  const apiResponse = {
    message: 'Success',
    data: {
      labels: ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'],
      hoursByPeriod: [
        { label: 'SEG', activities: 0, recommendedLessons: 11 },
        { label: 'TER', activities: 3.5, recommendedLessons: 7 },
        { label: 'QUA', activities: 9, recommendedLessons: 2 },
        { label: 'QUI', activities: 0, recommendedLessons: 11 },
        { label: 'SEX', activities: 1.5, recommendedLessons: 6 },
        { label: 'SAB', activities: 0, recommendedLessons: 6.5 },
        { label: 'DOM', activities: 0, recommendedLessons: 11 },
      ],
      hoursByItem: { activities: 30, recommendedLessons: 70 },
    },
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <TimeChart
        data={{
          categories: DEFAULT_CATEGORIES,
          hoursByPeriod: apiResponse.data.hoursByPeriod,
          hoursByItem: apiResponse.data.hoursByItem,
        }}
        barChartTitle="Dados de horas por semana"
      />
    </div>
  );
};
