import { useState } from 'react';
import type { Story } from '@ladle/react';
import {
  AccessReportModal,
  AccessReportModalVariant,
  type AccessReportStudentData,
  type AccessReportProfessionalData,
} from './AccessReportModal';

// ─── Mock data ────────────────────────────────────────────────

const studentData: AccessReportStudentData = {
  user: {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'João Silva',
    profileType: 'STUDENT',
    school: 'Escola Municipal São Paulo',
    group: 'NRE Centro',
    class: '9A',
    year: 2026,
  },
  accessData: {
    totalTime: '42h15min',
    activitiesTime: '15h00min',
    contentTime: '10h30min',
    recommendedLessonsTime: '8h00min',
    simulationsTime: '5h45min',
    questionnairesTime: '3h00min',
    accessCount: 87,
    lastAccess: '27/02/2026',
  },
  accessByPlatform: {
    web: { time: '27h30min', percentage: 65 },
    mobile: { time: '14h45min', percentage: 35 },
  },
  hoursByItem: {
    activities: { time: '20h00min', percentage: 47 },
    content: { time: '10h00min', percentage: 24 },
    simulations: { time: '8h00min', percentage: 19 },
    questionnaires: { time: '4h15min', percentage: 10 },
  },
};

const professionalData: AccessReportProfessionalData = {
  user: {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Maria Souza',
    profileType: 'TEACHER',
    school: 'Escola Estadual Paraná',
    group: 'NRE Sul',
    class: 'Turma B',
    year: 2026,
  },
  accessData: {
    totalTime: '18h30min',
    activitiesTime: '12h00min',
    recommendedLessonsTime: '6h30min',
    accessCount: 45,
    lastAccess: '26/02/2026',
  },
  accessByPlatform: {
    web: { time: '14h50min', percentage: 80 },
    mobile: { time: '3h40min', percentage: 20 },
  },
  hoursByItem: {
    activities: { time: '12h00min', percentage: 67 },
    recommendedLessons: { time: '6h30min', percentage: 33 },
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
 * Student — full access data
 */
export const Student: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <OpenButton onClick={() => setIsOpen(true)} />
      <AccessReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant={AccessReportModalVariant.STUDENT}
        data={studentData}
      />
    </div>
  );
};

/**
 * Professional — full access data
 */
export const Professional: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <OpenButton onClick={() => setIsOpen(true)} />
      <AccessReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant={AccessReportModalVariant.PROFESSIONAL}
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
      <AccessReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant={AccessReportModalVariant.STUDENT}
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
      <AccessReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant={AccessReportModalVariant.STUDENT}
        data={null}
        error="Não foi possível carregar os dados de acesso."
      />
    </div>
  );
};

/**
 * Custom title
 */
export const WithCustomTitle: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <OpenButton onClick={() => setIsOpen(true)} />
      <AccessReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Relatório de acesso — Março 2026"
        variant={AccessReportModalVariant.STUDENT}
        data={studentData}
      />
    </div>
  );
};

/**
 * Null lastAccess fallback
 */
export const WithNullLastAccess: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <OpenButton onClick={() => setIsOpen(true)} />
      <AccessReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant={AccessReportModalVariant.STUDENT}
        data={{
          ...studentData,
          accessData: { ...studentData.accessData, lastAccess: null },
        }}
      />
    </div>
  );
};
