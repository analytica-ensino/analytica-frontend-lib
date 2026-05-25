import type { Story } from '@ladle/react';
import {
  House,
  Exam,
  ClipboardText,
  Calculator,
  ChalkboardTeacher,
  Files,
  BookBookmark,
  Headset,
} from 'phosphor-react';
import Text from '../Text/Text';
import { AppLayout, type AppLayoutMenuItem } from './AppLayout';

const noop = () => undefined;

const studentItems: AppLayoutMenuItem[] = [
  { value: 'home', label: 'Painel', icon: <House /> },
  { value: 'simulated', label: 'Simulados', icon: <Exam /> },
  { value: 'provas', label: 'Provas', icon: <ClipboardText /> },
  { value: 'simulador', label: 'Simulador', icon: <Calculator /> },
  { value: 'lecture', label: 'Aulas', icon: <ChalkboardTeacher /> },
];

const managerItems: AppLayoutMenuItem[] = [
  { value: 'reports', label: 'Relatórios', icon: <Files /> },
  { value: 'trails', label: 'Aulas Recomendadas', icon: <BookBookmark /> },
  { value: 'suport', label: 'Suporte', icon: <Headset /> },
];

const FakeHeader = () => (
  <header className="bg-primary-800 w-full h-[70px] flex items-center justify-center text-white font-bold">
    Header placeholder
  </header>
);

const PageBody = () => (
  <div className="p-6">
    <Text as="h2" size="2xl" weight="bold" color="text-text-950">
      Conteúdo da página
    </Text>
    <Text color="text-text-700" className="mt-2">
      Renderizado dentro de PageContainer pelo AppLayout.
    </Text>
  </div>
);

/**
 * Student-like layout with multiple menu items and an optional `bottomSlot`.
 */
export const Student: Story = () => (
  <AppLayout
    header={<FakeHeader />}
    menuItems={studentItems}
    activeMenuValue="home"
    onMenuItemClick={noop}
    bottomSlot={
      <div
        data-testid="zendesk-stub"
        className="fixed bottom-4 right-4 bg-primary-600 text-white rounded-full p-3"
      >
        Z
      </div>
    }
  >
    <PageBody />
  </AppLayout>
);

/**
 * Manager-like layout — fewer items, no `bottomSlot`, wider `menuMaxWidth`.
 */
export const Manager: Story = () => (
  <AppLayout
    header={<FakeHeader />}
    menuItems={managerItems}
    activeMenuValue="reports"
    onMenuItemClick={noop}
    menuMaxWidth="max-w-[1150px]"
  >
    <PageBody />
  </AppLayout>
);

/**
 * Demonstrates `visible: false` filtering — `Simulador` is hidden.
 */
export const WithHiddenItem: Story = () => (
  <AppLayout
    header={<FakeHeader />}
    menuItems={studentItems.map((item) =>
      item.value === 'simulador' ? { ...item, visible: false } : item
    )}
    activeMenuValue="home"
    onMenuItemClick={noop}
  >
    <PageBody />
  </AppLayout>
);
