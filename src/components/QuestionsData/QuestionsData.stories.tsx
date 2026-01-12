import type { Story } from '@ladle/react';
import { QuestionsData } from './QuestionsData';

/**
 * Default example with all bars (matching Figma)
 */
export const Default: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <QuestionsData
      data={{
        total: 100,
        corretas: 60,
        incorretas: 30,
        emBranco: 10,
      }}
      showEmBranco
    />
  </div>
);

/**
 * Without blank questions
 */
export const WithoutBlank: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <QuestionsData
      data={{
        total: 100,
        corretas: 75,
        incorretas: 25,
      }}
    />
  </div>
);

/**
 * Custom title
 */
export const CustomTitle: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <QuestionsData
      title="Estatísticas do Simulado"
      data={{
        total: 90,
        corretas: 60,
        incorretas: 20,
        emBranco: 10,
      }}
      showEmBranco
    />
  </div>
);

/**
 * High performance (mostly correct)
 */
export const HighPerformance: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <QuestionsData
      data={{
        total: 50,
        corretas: 48,
        incorretas: 2,
      }}
    />
  </div>
);

/**
 * Low performance (mostly incorrect)
 */
export const LowPerformance: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <QuestionsData
      data={{
        total: 50,
        corretas: 10,
        incorretas: 35,
        emBranco: 5,
      }}
      showEmBranco
    />
  </div>
);

/**
 * Large numbers
 */
export const LargeNumbers: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <QuestionsData
      data={{
        total: 1500,
        corretas: 1200,
        incorretas: 250,
        emBranco: 50,
      }}
      showEmBranco
    />
  </div>
);

/**
 * Zero values
 */
export const ZeroValues: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <QuestionsData
      data={{
        total: 0,
        corretas: 0,
        incorretas: 0,
        emBranco: 0,
      }}
      showEmBranco
    />
  </div>
);

/**
 * Custom max value
 */
export const CustomMaxValue: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <QuestionsData
      data={{
        total: 50,
        corretas: 30,
        incorretas: 15,
        emBranco: 5,
      }}
      showEmBranco
      maxValue={100}
    />
  </div>
);

/**
 * Custom chart height
 */
export const CustomChartHeight: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <QuestionsData
      data={{
        total: 100,
        corretas: 60,
        incorretas: 30,
        emBranco: 10,
      }}
      showEmBranco
      chartHeight={250}
    />
  </div>
);

/**
 * Mobile view
 */
export const MobileView: Story = () => (
  <div className="p-4 bg-gray-100 min-h-screen max-w-[375px]">
    <QuestionsData
      data={{
        total: 100,
        corretas: 60,
        incorretas: 30,
        emBranco: 10,
      }}
      showEmBranco
    />
  </div>
);

/**
 * Equal distribution
 */
export const EqualDistribution: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <QuestionsData
      data={{
        total: 90,
        corretas: 30,
        incorretas: 30,
        emBranco: 30,
      }}
      showEmBranco
    />
  </div>
);
