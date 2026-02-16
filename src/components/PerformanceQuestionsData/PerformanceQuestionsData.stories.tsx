import type { Story } from '@ladle/react';
import { useState } from 'react';
import {
  PerformanceQuestionsData,
  PerformanceQuestionsVariant,
} from './PerformanceQuestionsData';
import type { PerformanceFilterConfig } from './PerformanceQuestionsData';
import { GlobeSimpleIcon } from '@phosphor-icons/react';

const subjectOptions = [
  { value: 'all', label: 'Todos componentes' },
  { value: 'math', label: 'Matemática' },
  { value: 'port', label: 'Português' },
  { value: 'bio', label: 'Biologia' },
  { value: 'art', label: 'Artes' },
];

const studentActivityOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'ATIVIDADE', label: 'Atividades' },
  { value: 'SIMULADO', label: 'Simulados' },
  { value: 'QUESTIONARIO', label: 'Questionários' },
];

const defaultActivityOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'ATIVIDADE', label: 'Atividades' },
  { value: 'AULA_RECOMENDADA', label: 'Aulas recomendadas' },
];

/**
 * STUDENT variant with filters — "Dados de questões"
 */
export const QuestionsVariant: Story = () => {
  const [subject, setSubject] = useState('all');
  const [activityType, setActivityType] = useState('all');

  const subjectFilter: PerformanceFilterConfig = {
    options: subjectOptions,
    value: subject,
    onChange: setSubject,
    placeholder: 'Todos componentes',
    icon: <GlobeSimpleIcon />,
  };

  const activityTypeFilter: PerformanceFilterConfig = {
    options: studentActivityOptions,
    value: activityType,
    onChange: setActivityType,
    placeholder: 'Todos',
    icon: <GlobeSimpleIcon />,
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <PerformanceQuestionsData
        variant={PerformanceQuestionsVariant.QUESTIONS}
        data={{
          total: 150,
          corretas: 95,
          incorretas: 40,
          emBranco: 15,
        }}
        subjectFilter={subjectFilter}
        activityTypeFilter={activityTypeFilter}
      />
    </div>
  );
};

/**
 * Non-STUDENT variant with filters — "Dados de material produzido"
 */
export const MaterialVariant: Story = () => {
  const [subject, setSubject] = useState('all');
  const [activityType, setActivityType] = useState('all');

  const subjectFilter: PerformanceFilterConfig = {
    options: subjectOptions,
    value: subject,
    onChange: setSubject,
    placeholder: 'Todos componentes',
    icon: <GlobeSimpleIcon />,
  };

  const activityTypeFilter: PerformanceFilterConfig = {
    options: defaultActivityOptions,
    value: activityType,
    onChange: setActivityType,
    placeholder: 'Todos',
    icon: <GlobeSimpleIcon />,
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <PerformanceQuestionsData
        variant={PerformanceQuestionsVariant.MATERIAL}
        data={{
          total: 37,
          totalAtividades: 25,
          totalAulasRecomendadas: 12,
        }}
        subjectFilter={subjectFilter}
        activityTypeFilter={activityTypeFilter}
      />
    </div>
  );
};

/**
 * Without filters — minimal usage
 */
export const WithoutFilters: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <PerformanceQuestionsData
      variant={PerformanceQuestionsVariant.QUESTIONS}
      data={{
        total: 100,
        corretas: 60,
        incorretas: 30,
        emBranco: 10,
      }}
    />
  </div>
);

/**
 * Zero values
 */
export const ZeroValues: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <PerformanceQuestionsData
      variant={PerformanceQuestionsVariant.QUESTIONS}
      data={{
        total: 0,
        corretas: 0,
        incorretas: 0,
        emBranco: 0,
      }}
    />
  </div>
);

/**
 * Large numbers
 */
export const LargeNumbers: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <PerformanceQuestionsData
      variant={PerformanceQuestionsVariant.QUESTIONS}
      data={{
        total: 1500,
        corretas: 1200,
        incorretas: 250,
        emBranco: 50,
      }}
    />
  </div>
);
