import Text from '../Text/Text';
import Button from '../Button/Button';
import Select, {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../Select/Select';
import { Plus } from 'phosphor-react';

/**
 * Statistics data item
 */
interface StatItem {
  /** Statistic label */
  label: string;
  /** Statistic value */
  value: string | number;
  /** Color variant */
  variant: 'high' | 'medium' | 'low' | 'total';
}

/**
 * Props for StatisticsCard component
 */
interface StatisticsCardProps {
  /** Title displayed at the top of the card */
  title: string;
  /** Statistics data to display */
  data?: StatItem[];
  /** Message shown in empty state */
  emptyStateMessage?: string;
  /** Text for the empty state button */
  emptyStateButtonText?: string;
  /** Callback when empty state button is clicked */
  onEmptyStateButtonClick?: () => void;
  /** Optional dropdown options for filtering */
  dropdownOptions?: Array<{
    label: string;
    value: string;
  }>;
  /** Currently selected dropdown value */
  selectedDropdownValue?: string;
  /** Callback when dropdown value changes */
  onDropdownChange?: (value: string) => void;
  /** Placeholder text for the dropdown select */
  selectPlaceholder?: string;
  /** Accessible label for the dropdown select */
  dropdownAriaLabel?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Variant styles mapping
 */
const VARIANT_STYLES = {
  high: 'bg-success-background',
  medium: 'bg-warning-background',
  low: 'bg-error-background',
  total: 'bg-info-background',
} as const;

/**
 * Value text colors mapping
 */
const VALUE_TEXT_COLORS = {
  high: 'text-success-700',
  medium: 'text-warning-600',
  low: 'text-error-700',
  total: 'text-info-700',
} as const;

/**
 * Internal StatCard component
 */
interface StatCardProps {
  item: StatItem;
}

const StatCard = ({ item }: StatCardProps) => {
  return (
    <div
      className={`rounded-xl py-[17px] px-6 min-h-[105px] flex flex-col justify-center items-start gap-1 ${VARIANT_STYLES[item.variant]}`}
    >
      <Text
        size="4xl"
        weight="bold"
        className={`${VALUE_TEXT_COLORS[item.variant]} leading-[42px] tracking-[0.2px] self-stretch`}
      >
        {item.value}
      </Text>
      <Text
        size="xs"
        weight="bold"
        className="uppercase text-[8px] leading-[9px] text-text-800 self-stretch"
      >
        {item.label}
      </Text>
    </div>
  );
};

/**
 * StatisticsCard component - displays statistics with empty state support
 *
 * @example
 * ```tsx
 * // With data
 * <StatisticsCard
 *   title="Estatística das atividades"
 *   data={[
 *     { label: 'Acertos', value: '85%', variant: 'high' },
 *     { label: 'Em andamento', value: 12, variant: 'medium' },
 *     { label: 'Erros', value: '15%', variant: 'low' },
 *     { label: 'Concluídas', value: 24, variant: 'total' }
 *   ]}
 *   dropdownOptions={[
 *     { label: '1 ano', value: '1year' },
 *     { label: '6 meses', value: '6months' }
 *   ]}
 *   selectedDropdownValue="1year"
 *   onDropdownChange={(value) => console.log(value)}
 * />
 *
 * // Empty state
 * <StatisticsCard
 *   title="Estatística das atividades"
 *   emptyStateMessage="Sem dados por enquanto. Crie uma atividade para que os resultados apareçam aqui."
 *   emptyStateButtonText="Criar atividade"
 *   onEmptyStateButtonClick={() => console.log('Create activity')}
 * />
 * ```
 */
export const StatisticsCard = ({
  title,
  data,
  emptyStateMessage,
  emptyStateButtonText,
  onEmptyStateButtonClick,
  dropdownOptions,
  selectedDropdownValue,
  onDropdownChange,
  selectPlaceholder = 'Selecione um período',
  dropdownAriaLabel = 'Filtro de período',
  className = '',
}: StatisticsCardProps) => {
  const hasData = data && data.length > 0;

  return (
    <div
      className={`bg-background rounded-xl p-4 h-auto lg:h-[185px] flex flex-col gap-2 ${className}`}
    >
      {/* Header with title and optional dropdown */}
      <div className="flex flex-row justify-between items-center gap-4">
        <Text as="h3" size="sm" weight="medium" color="text-text-600">
          {title}
        </Text>

        {dropdownOptions && dropdownOptions.length > 0 && (
          <div className="w-[99px]">
            <Select
              value={selectedDropdownValue}
              onValueChange={onDropdownChange}
              size="medium"
            >
              <SelectTrigger
                className="border-border-300 rounded whitespace-nowrap"
                aria-label={dropdownAriaLabel}
              >
                <SelectValue placeholder={selectPlaceholder} />
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

      {/* Content: Data Grid or Empty State */}
      {hasData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[13px]">
          {data.map((item) => (
            <StatCard key={`${item.variant}-${item.label}`} item={item} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border-300 rounded-lg p-6 min-h-[105px] flex flex-col items-center justify-center gap-2">
          <Text
            size="sm"
            color="text-text-600"
            className="text-center max-w-md"
          >
            {emptyStateMessage}
          </Text>

          {onEmptyStateButtonClick && (
            <Button
              variant="outline"
              action="primary"
              size="small"
              onClick={onEmptyStateButtonClick}
              iconLeft={<Plus size={16} weight="bold" />}
            >
              {emptyStateButtonText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
