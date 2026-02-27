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
  totalTime: '42h15min',
  content: 18,
  recommendedLessons: 12,
  simulations: 5,
  accessCount: 87,
  lastAccess: '27/02/2026',
  platformAccess: {
    web: 65,
    mobile: 35,
  },
  hoursByItem: {
    activities: 20,
    content: 10,
    simulations: 8,
    questionnaires: 4,
  },
};

const professionalData: AccessReportProfessionalData = {
  totalTime: '18h30min',
  activities: 24,
  recommendedLessons: 10,
  accessCount: 45,
  lastAccess: '26/02/2026',
  platformAccess: {
    web: 80,
    mobile: 20,
  },
  hoursByItem: {
    activities: 12,
    recommendedLessons: 6,
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
 * Student – with user info header (padrão)
 */
export const StudentWithUserInfo: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <OpenButton onClick={() => setIsOpen(true)} />
      <AccessReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant={AccessReportModalVariant.STUDENT}
        data={studentData}
        studentUserInfo={{
          userName: 'João Silva',
          schoolName: 'Escola Municipal São Paulo',
          className: '9A',
          year: '9º Ano',
        }}
      />
    </div>
  );
};

/**
 * Student – with all access data (without user info)
 */
export const StudentWithData: Story = () => {
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
 * Professional – with user info header (from table row)
 */
export const ProfessionalWithUserInfo: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <OpenButton onClick={() => setIsOpen(true)} />
      <AccessReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant={AccessReportModalVariant.PROFESSIONAL}
        data={professionalData}
        professionalUserInfo={{
          userName: 'Maria Souza',
          schoolName: 'Escola Estadual Paraná',
          className: 'Turma B',
          year: '2026',
        }}
      />
    </div>
  );
};

/**
 * Professional – without user info header
 */
export const ProfessionalWithoutUserInfo: Story = () => {
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
