import type { Story } from '@ladle/react';
import { PerformanceDistributionChart } from './PerformanceDistributionChart';
import type { SimulatedPerformanceCounters } from './types';

// ============================================================================
// MOCK DATA
// ============================================================================

const balancedCounters: SimulatedPerformanceCounters = {
  highlight: 10,
  aboveAverage: 25,
  belowAverage: 15,
  attentionPoint: 5,
};

const highPerformanceCounters: SimulatedPerformanceCounters = {
  highlight: 30,
  aboveAverage: 45,
  belowAverage: 10,
  attentionPoint: 2,
};

const lowPerformanceCounters: SimulatedPerformanceCounters = {
  highlight: 2,
  aboveAverage: 8,
  belowAverage: 35,
  attentionPoint: 25,
};

const singleCategoryCounters: SimulatedPerformanceCounters = {
  highlight: 50,
  aboveAverage: 0,
  belowAverage: 0,
  attentionPoint: 0,
};

const twoCategoriesCounters: SimulatedPerformanceCounters = {
  highlight: 0,
  aboveAverage: 60,
  belowAverage: 40,
  attentionPoint: 0,
};

const emptyCounters: SimulatedPerformanceCounters = {
  highlight: 0,
  aboveAverage: 0,
  belowAverage: 0,
  attentionPoint: 0,
};

const smallValuesCounters: SimulatedPerformanceCounters = {
  highlight: 1,
  aboveAverage: 2,
  belowAverage: 1,
  attentionPoint: 1,
};

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default - Balanced distribution
 */
export const Default: Story = () => (
  <div className="max-w-xl">
    <PerformanceDistributionChart counters={balancedCounters} />
  </div>
);

/**
 * High Performance - Most students above average
 */
export const HighPerformance: Story = () => (
  <div className="max-w-xl">
    <PerformanceDistributionChart
      counters={highPerformanceCounters}
      title="Alto Desempenho da Turma"
    />
  </div>
);

/**
 * Low Performance - Most students below average
 */
export const LowPerformance: Story = () => (
  <div className="max-w-xl">
    <PerformanceDistributionChart
      counters={lowPerformanceCounters}
      title="Turma com Dificuldades"
    />
  </div>
);

/**
 * Single Category - All students in one category (100%)
 */
export const SingleCategory: Story = () => (
  <div className="max-w-xl">
    <PerformanceDistributionChart
      counters={singleCategoryCounters}
      title="Todos Destaques"
    />
  </div>
);

/**
 * Two Categories - Only two categories with students
 */
export const TwoCategories: Story = () => (
  <div className="max-w-xl">
    <PerformanceDistributionChart
      counters={twoCategoriesCounters}
      title="Distribuição Simples"
    />
  </div>
);

/**
 * Empty - No students in any category
 */
export const Empty: Story = () => (
  <div className="max-w-xl">
    <PerformanceDistributionChart
      counters={emptyCounters}
      title="Sem Dados"
    />
  </div>
);

/**
 * Small Values - Very few students
 */
export const SmallValues: Story = () => (
  <div className="max-w-xl">
    <PerformanceDistributionChart
      counters={smallValuesCounters}
      title="Poucos Estudantes"
    />
  </div>
);

/**
 * Loading State
 */
export const Loading: Story = () => (
  <div className="max-w-xl">
    <PerformanceDistributionChart counters={undefined} loading={true} />
  </div>
);

/**
 * Custom Total - Override total students count
 */
export const CustomTotal: Story = () => (
  <div className="max-w-xl">
    <PerformanceDistributionChart
      counters={balancedCounters}
      totalStudents={100}
      title="Com Total Personalizado"
    />
  </div>
);

/**
 * All Variations - Side by side comparison
 */
export const AllVariations: Story = () => (
  <div className="grid grid-cols-2 gap-6 max-w-4xl">
    <PerformanceDistributionChart
      counters={highPerformanceCounters}
      title="Alto Desempenho"
    />
    <PerformanceDistributionChart
      counters={lowPerformanceCounters}
      title="Baixo Desempenho"
    />
    <PerformanceDistributionChart
      counters={balancedCounters}
      title="Equilibrado"
    />
    <PerformanceDistributionChart
      counters={twoCategoriesCounters}
      title="Duas Categorias"
    />
  </div>
);
