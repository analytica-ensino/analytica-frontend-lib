import { ReportTabs } from '../shared/ReportTabs';

/** One tab of the report: "Geral" or one exam. */
export interface EnemMomentTab {
  value: string;
  label: string;
}

/**
 * The "Geral" / "Momento N" strip of the Momento ENEM screens — the lib's
 * report tabs, the look of the profile tabs of the other reports. Only the
 * active tab prints: the others are navigation, not content.
 *
 * Not drawn with "Geral" plus a single exam: two tabs showing the same numbers.
 */
export function MomentTabs({
  tabs,
  activeTab,
  onTabChange,
}: Readonly<{
  tabs: EnemMomentTab[];
  activeTab: string;
  onTabChange: (value: string) => void;
}>) {
  if (tabs.length <= 2) return null;

  return (
    <ReportTabs
      tabs={tabs}
      value={activeTab}
      onValueChange={onTabChange}
      printActiveOnly
    />
  );
}
