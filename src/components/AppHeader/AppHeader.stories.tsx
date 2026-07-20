import type { Story } from '@ladle/react';
import { AppHeader, type AppHeaderProps } from './AppHeader';

const noop = () => undefined;

const sampleNotifications: AppHeaderProps['notifications'] = {
  unreadCount: 0,
  loading: false,
  error: null,
  groupedNotifications: [],
  refreshNotifications: noop,
  markAsRead: noop,
  deleteNotification: noop,
  fetchNotifications: noop,
  getActionLabel: () => undefined,
};

const baseSession: AppHeaderProps['sessionInfo'] = {
  userName: 'Maria Souza',
  email: 'maria.souza@example.com',
  schoolName: 'Escola Modelo',
  className: '3º ano A',
  schoolYearName: '2026',
};

/**
 * Aluno: header with calendar, no profile-info section.
 */
export const Student: Story = () => (
  <AppHeader
    user={{ name: 'Maria', email: 'maria@example.com' }}
    sessionInfo={baseSession}
    notifications={sampleNotifications}
    showCalendar
    calendarContent={
      <div className="p-4 text-text-700">Calendário do aluno</div>
    }
    onLogout={noop}
    onNavigateToMyData={noop}
    onNavigateByNotification={noop}
  />
);

/**
 * Professor: header with calendar and school/class/year info in profile.
 */
export const Teacher: Story = () => (
  <AppHeader
    user={{ name: 'João', email: 'joao@example.com' }}
    sessionInfo={baseSession}
    notifications={sampleNotifications}
    showCalendar
    showProfileInfo
    calendarContent={
      <div className="p-4 text-text-700">Calendário do professor</div>
    }
    onLogout={noop}
    onNavigateToMyData={noop}
    onNavigateByNotification={noop}
  />
);

/**
 * Gestor: header without calendar, with school/class/year info in profile.
 */
export const Manager: Story = () => (
  <AppHeader
    user={{ name: 'Ana', email: 'ana@example.com' }}
    sessionInfo={baseSession}
    notifications={sampleNotifications}
    showProfileInfo
    onLogout={noop}
    onNavigateToMyData={noop}
    onNavigateByNotification={noop}
  />
);

/**
 * Header with the "Tutoriais" pill button (opens the tutorial link).
 */
export const WithTutorial: Story = () => (
  <AppHeader
    user={{ name: 'Maria', email: 'maria@example.com' }}
    sessionInfo={baseSession}
    notifications={sampleNotifications}
    tutorial={{ visible: true, onClick: noop }}
    showCalendar
    calendarContent={
      <div className="p-4 text-text-700">Calendário do aluno</div>
    }
    onLogout={noop}
    onNavigateToMyData={noop}
    onNavigateByNotification={noop}
  />
);
