import { Text, Chips } from '../..';
import type { Bank } from '../../types/activityFilters';

export interface BanksFilterProps {
  banks: Bank[];
  selectedBanks: string[];
  onToggleBank: (bankName: string) => void;
  loading?: boolean;
  error?: string | null;
}

export const BanksFilter = ({
  banks,
  selectedBanks,
  onToggleBank,
  loading = false,
  error = null,
}: BanksFilterProps) => {
  if (loading) {
    return (
      <Text size="sm" className="text-text-600">
        Carregando bancas...
      </Text>
    );
  }

  if (error) {
    return (
      <Text size="sm" className="text-text-600">
        {error}
      </Text>
    );
  }

  if (banks.length === 0) {
    return (
      <Text size="sm" className="text-text-600">
        Nenhuma banca encontrada
      </Text>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {banks.map((bank: Bank) => (
        <Chips
          key={bank.examInstitution}
          selected={selectedBanks.includes(bank.examInstitution)}
          onClick={() => onToggleBank(bank.examInstitution)}
        >
          {bank.examInstitution}
        </Chips>
      ))}
    </div>
  );
};

