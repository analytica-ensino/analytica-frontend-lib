import { ReactNode } from 'react';
import Text from '../Text/Text';
import Button from '../Button/Button';
import Select, {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../Select/Select';

/**
 * Props for StatisticsCard component
 */
interface StatisticsCardProps {
  /** Title displayed at the top of the card */
  title: string;
  /** Message shown in empty state */
  emptyStateMessage: string;
  /** Text for the empty state button */
  emptyStateButtonText: string;
  /** Optional icon for the empty state button */
  emptyStateButtonIcon?: ReactNode;
  /** Callback when empty state button is clicked */
  onEmptyStateButtonClick: () => void;
  /** Optional dropdown options for filtering */
  dropdownOptions?: Array<{
    label: string;
    value: string;
  }>;
  /** Currently selected dropdown value */
  selectedDropdownValue?: string;
  /** Callback when dropdown value changes */
  onDropdownChange?: (value: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * StatisticsCard component - displays statistics with empty state support
 *
 * @example
 * ```tsx
 * <StatisticsCard
 *   title="Estatística das atividades"
 *   emptyStateMessage="Sem dados por enquanto. Crie uma atividade para que os resultados apareçam aqui."
 *   emptyStateButtonText="Criar atividade"
 *   emptyStateButtonIcon={<Plus size={16} />}
 *   onEmptyStateButtonClick={() => console.log('Create activity')}
 *   dropdownOptions={[
 *     { label: '1 ano', value: '1year' },
 *     { label: '6 meses', value: '6months' }
 *   ]}
 *   selectedDropdownValue="1year"
 *   onDropdownChange={(value) => console.log(value)}
 * />
 * ```
 */
export const StatisticsCard = ({
  title,
  emptyStateMessage,
  emptyStateButtonText,
  emptyStateButtonIcon,
  onEmptyStateButtonClick,
  dropdownOptions,
  selectedDropdownValue,
  onDropdownChange,
  className = '',
}: StatisticsCardProps) => {
  return (
    <div className={`bg-background rounded-xl p-4 ${className}`}>
      {/* Header with title and optional dropdown */}
      <div className="flex flex-row justify-between items-center gap-4 mb-2">
        <Text as="h3" size="sm" weight="medium" color="text-600">
          {title}
        </Text>

        {dropdownOptions && dropdownOptions.length > 0 && (
          <div className="w-[99px]">
            <Select
              value={selectedDropdownValue}
              onValueChange={onDropdownChange}
              size="medium"
            >
              <SelectTrigger className="!border !rounded">
                <SelectValue placeholder="Selecione um período" />
              </SelectTrigger>
              <SelectContent>
                {dropdownOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Empty State Card */}
      <div className="border border-dashed border-border-300 rounded-lg p-6 flex flex-col items-center justify-center gap-2">
        <Text size="sm" color="text-600" className="text-center max-w-md">
          {emptyStateMessage}
        </Text>

        <Button
          variant="outline"
          action="primary"
          size="small"
          onClick={onEmptyStateButtonClick}
          iconLeft={emptyStateButtonIcon}
        >
          {emptyStateButtonText}
        </Button>
      </div>
    </div>
  );
};
