import { useState } from 'react';
import type { Story } from '@ladle/react';
import {
  PerformanceReportModal,
  PerformanceReportModalVariant,
  type UserPerformanceStudentData,
  type UserPerformanceProfessionalData,
  type UserPerformanceQuestionStats,
  type UserPerformanceLesson,
} from './PerformanceReportModal';
import { getSubjectInfo } from '../SubjectInfo/SubjectInfo';
import { SubjectEnum } from '../../enums/SubjectEnum';

// ─── Shared mock data ─────────────────────────────────────────

const baseStats: UserPerformanceQuestionStats = {
  totalAnswered: 70,
  correctQuestions: 50,
  correctPercentage: 62.5,
  incorrectQuestions: 20,
  incorrectPercentage: 25,
  blankQuestions: 10,
  blankPercentage: 12.5,
  performanceTag: 'Abaixo da média',
};

const studentBelowAverageData: UserPerformanceStudentData = {
  user: { id: 'user-1', name: 'João Silva' },
  school: {
    schoolId: 'school-1',
    schoolName: 'Escola Municipal São Paulo',
  },
  class: { classId: 'class-1', className: '9A' },
  schoolYear: { schoolYearId: 'sy-1', schoolYearName: '9º Ano' },
  status: 'Abaixo da média',
  generalStats: baseStats,
  activityStats: {
    ...baseStats,
    correctQuestions: 30,
    correctPercentage: 60,
    incorrectQuestions: 10,
    incorrectPercentage: 20,
    blankQuestions: 5,
    blankPercentage: 10,
    totalAnswered: 40,
  },
  questionnaireStats: {
    ...baseStats,
    correctQuestions: 15,
    correctPercentage: 57.7,
    incorrectQuestions: 8,
    incorrectPercentage: 30.8,
    blankQuestions: 3,
    blankPercentage: 11.5,
    totalAnswered: 23,
  },
  simulationStats: {
    ...baseStats,
    correctQuestions: 5,
    correctPercentage: 50,
    incorrectQuestions: 2,
    incorrectPercentage: 20,
    blankQuestions: 3,
    blankPercentage: 30,
    totalAnswered: 7,
  },
  downloadedLessons: [
    {
      lessonId: 'l1',
      lessonName: 'Matemática Avançada',
      bnccCode: 'EM01EF102',
    },
    { lessonId: 'l2', lessonName: 'Física Moderna', bnccCode: 'EM01EF102' },
    { lessonId: 'l3', lessonName: 'Filosofia e ética', bnccCode: 'EM01EF102' },
    {
      lessonId: 'l4',
      lessonName: 'História Contemporânea',
      bnccCode: 'EM01EF102',
    },
    { lessonId: 'l5', lessonName: 'Biologia Celular', bnccCode: 'EM01EF102' },
    { lessonId: 'l6', lessonName: 'Educação Física e Saúde', bnccCode: null },
    {
      lessonId: 'l7',
      lessonName: 'Literatura Brasileira',
      bnccCode: 'EM01EF102',
    },
    {
      lessonId: 'l8',
      lessonName: 'Geografia do Brasil',
      bnccCode: 'EM01EF102',
    },
    { lessonId: 'l9', lessonName: 'Arte e Cultura', bnccCode: null },
    {
      lessonId: 'l10',
      lessonName: 'Química Experimental',
      bnccCode: 'EM01EF102',
    },
  ],
};

// ─── Lesson icon helper ───────────────────────────────────────

const LESSON_SUBJECT_MAP: Record<string, SubjectEnum> = {
  l1: SubjectEnum.MATEMATICA,
  l2: SubjectEnum.FISICA,
  l3: SubjectEnum.FILOSOFIA,
  l4: SubjectEnum.HISTORIA,
  l5: SubjectEnum.BIOLOGIA,
  l6: SubjectEnum.EDUCACAO_FISICA,
  l7: SubjectEnum.LITERATURA,
  l8: SubjectEnum.GEOGRAFIA,
  l9: SubjectEnum.ARTES,
  l10: SubjectEnum.QUIMICA,
};

function getLessonIconFn(lesson: UserPerformanceLesson) {
  const subject = LESSON_SUBJECT_MAP[lesson.lessonId];
  if (!subject) return null;
  const { icon, colorClass } = getSubjectInfo(subject);
  return (
    <div
      className={`w-5.25 h-5.25 flex items-center justify-center rounded-sm text-text-950 shrink-0 ${colorClass}`}
    >
      {icon}
    </div>
  );
}

const studentTopPerformerData: UserPerformanceStudentData = {
  ...studentBelowAverageData,
  user: { id: 'user-2', name: 'Ana Pereira' },
  status: 'Destaque da turma',
  generalStats: {
    totalAnswered: 90,
    correctQuestions: 80,
    correctPercentage: 88.9,
    incorrectQuestions: 10,
    incorrectPercentage: 11.1,
    blankQuestions: 0,
    blankPercentage: 0,
    performanceTag: 'Destaque da turma',
  },
};

const professionalData: UserPerformanceProfessionalData = {
  generalStats: {
    totalMaterialProduced: 30,
    totalRecommendedLessons: 18,
    recommendedLessonsPercentage: 60,
    totalActivities: 12,
    activitiesPercentage: 40,
  },
};

// ─── Helper ───────────────────────────────────────────────────

function OpenButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
    >
      Abrir modal
    </button>
  );
}

// ─── Stories ─────────────────────────────────────────────────

/**
 * Student – Abaixo da média
 */
export const StudentBelowAverage: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <OpenButton onClick={() => setIsOpen(true)} />
      <PerformanceReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant={PerformanceReportModalVariant.STUDENT}
        data={studentBelowAverageData}
        studentActivityCounts={{
          activities: 10,
          questionnaires: 10,
          simulations: 10,
        }}
        getLessonIcon={getLessonIconFn}
      />
    </div>
  );
};

/**
 * Student – Destaque da turma
 */
export const StudentTopPerformer: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <OpenButton onClick={() => setIsOpen(true)} />
      <PerformanceReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant={PerformanceReportModalVariant.STUDENT}
        data={studentTopPerformerData}
        studentActivityCounts={{
          activities: 8,
          questionnaires: 5,
          simulations: 3,
        }}
        getLessonIcon={getLessonIconFn}
      />
    </div>
  );
};

/**
 * Student – no downloaded lessons
 */
export const StudentEmptyLessons: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <OpenButton onClick={() => setIsOpen(true)} />
      <PerformanceReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant={PerformanceReportModalVariant.STUDENT}
        data={{ ...studentBelowAverageData, downloadedLessons: [] }}
        studentActivityCounts={{
          activities: 4,
          questionnaires: 2,
          simulations: 1,
        }}
      />
    </div>
  );
};

/**
 * Professional – with user info header (from table row)
 */
export const ProfessionalWithUserInfo: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <OpenButton onClick={() => setIsOpen(true)} />
      <PerformanceReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant={PerformanceReportModalVariant.PROFESSIONAL}
        data={professionalData}
        professionalUserInfo={{
          userName: 'Maria Souza',
          schoolName: 'Escola Estadual Paraná',
          className: 'Turma B',
          year: '2024',
        }}
      />
    </div>
  );
};

/**
 * Professional – without user info header (API response only)
 */
export const ProfessionalWithoutUserInfo: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <OpenButton onClick={() => setIsOpen(true)} />
      <PerformanceReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant={PerformanceReportModalVariant.PROFESSIONAL}
        data={professionalData}
      />
    </div>
  );
};

/**
 * Loading skeleton state
 */
export const WithLoading: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <OpenButton onClick={() => setIsOpen(true)} />
      <PerformanceReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant={PerformanceReportModalVariant.STUDENT}
        data={null}
        loading={true}
      />
    </div>
  );
};

/**
 * Error state
 */
export const WithError: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <OpenButton onClick={() => setIsOpen(true)} />
      <PerformanceReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant={PerformanceReportModalVariant.STUDENT}
        data={null}
        error="Não foi possível carregar os dados de desempenho."
      />
    </div>
  );
};
