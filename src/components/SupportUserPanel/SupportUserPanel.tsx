import { useEffect, useState } from 'react';
import { Menu, MenuContent, MenuItem } from '../Menu/Menu';
import { cn } from '../../utils/utils';
import {
  SUPPORT_USER_PANEL_TAB,
  type SupportUserPanelTab,
} from '../../types/supportUserPanel';
import SupportProfileTab, {
  type SupportProfileTabProps,
} from './SupportProfileTab';
import SupportHistoryTab, {
  type SupportHistoryTabProps,
} from './SupportHistoryTab';
import SupportTicketDetailsTab, {
  type SupportTicketDetailsTabProps,
} from './SupportTicketDetailsTab';

const TABS: { value: SupportUserPanelTab; label: string }[] = [
  { value: SUPPORT_USER_PANEL_TAB.PROFILE, label: 'Perfil' },
  { value: SUPPORT_USER_PANEL_TAB.HISTORY, label: 'Histórico' },
  { value: SUPPORT_USER_PANEL_TAB.TICKET, label: 'Detalhes do ticket' },
];

/** Props for the support user panel */
export interface SupportUserPanelProps {
  /** Controlled tab. Omit to let the panel keep it (default: ticket details) */
  tab?: SupportUserPanelTab;
  /**
   * Notified on tab change. Keep the panel mounted (or control `tab`) while
   * the agent moves between tickets so the chosen tab persists.
   */
  onTabChange?: (tab: SupportUserPanelTab) => void;
  /** Enables Alt+1 / Alt+2 / Alt+3 to switch tabs (default: true) */
  enableShortcuts?: boolean;
  profile: SupportProfileTabProps;
  history: SupportHistoryTabProps;
  ticket: SupportTicketDetailsTabProps;
  className?: string;
}

/**
 * Right-side panel of the agent's ticket screen (300px). Shows the contact
 * of the open conversation and the current ticket in three tabs: Perfil,
 * Histórico and Detalhes do ticket.
 *
 * Presentational: data comes in through props and every change goes out
 * through callbacks. Saves made from the ticket tab are optimistic, with a
 * "Salvo" toast, or a rollback and an error toast when the callback rejects.
 */
export default function SupportUserPanel({
  tab,
  onTabChange,
  enableShortcuts = true,
  profile,
  history,
  ticket,
  className,
}: Readonly<SupportUserPanelProps>) {
  const [internalTab, setInternalTab] = useState<SupportUserPanelTab>(
    SUPPORT_USER_PANEL_TAB.TICKET
  );
  const active = tab ?? internalTab;

  const changeTab = (next: SupportUserPanelTab) => {
    if (tab === undefined) setInternalTab(next);
    onTabChange?.(next);
  };

  useEffect(() => {
    if (!enableShortcuts) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || event.ctrlKey || event.metaKey) return;
      // `code` instead of `key`: on macOS Alt+1 types "¡", not "1".
      const index = ['Digit1', 'Digit2', 'Digit3'].indexOf(event.code);
      if (index === -1) return;
      event.preventDefault();
      const next = TABS[index].value;
      if (tab === undefined) setInternalTab(next);
      onTabChange?.(next);
    };
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [enableShortcuts, onTabChange, tab]);

  return (
    <aside
      aria-label="Painel do usuário"
      className={cn(
        'flex h-full w-[300px] shrink-0 flex-col border-l border-border-100 bg-background',
        className
      )}
    >
      <div className="shrink-0 border-b border-border-100 px-4">
        <Menu
          defaultValue={SUPPORT_USER_PANEL_TAB.TICKET}
          value={active}
          variant="menu2"
          semantics="tabs"
          onValueChange={(value) => changeTab(value as SupportUserPanelTab)}
          className="!py-0"
        >
          <MenuContent variant="menu2">
            {TABS.map((item) => (
              <MenuItem
                key={item.value}
                value={item.value}
                variant="menu2"
                aria-controls={`support-user-panel-${item.value}`}
                className="!text-sm whitespace-nowrap"
              >
                {item.label}
              </MenuItem>
            ))}
          </MenuContent>
        </Menu>
      </div>

      <div
        id={`support-user-panel-${active}`}
        role="tabpanel"
        aria-label={TABS.find((item) => item.value === active)?.label}
        className="min-h-0 flex-1 overflow-y-auto p-4"
      >
        {active === SUPPORT_USER_PANEL_TAB.PROFILE && (
          <SupportProfileTab {...profile} />
        )}
        {active === SUPPORT_USER_PANEL_TAB.HISTORY && (
          <SupportHistoryTab {...history} />
        )}
        {active === SUPPORT_USER_PANEL_TAB.TICKET && (
          <SupportTicketDetailsTab {...ticket} />
        )}
      </div>
    </aside>
  );
}
