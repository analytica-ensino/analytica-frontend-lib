import Text from '../Text/Text';
import Badge from '../Badge/Badge';
import SearchSelect from '../SearchSelect/SearchSelect';
import type { SearchSelectOption } from '../SearchSelect/SearchSelect';
import type {
  ComparisonType,
  ComparisonItem,
  ComparatorLabels,
} from '../../types/comparator';
import { DEFAULT_COMPARATOR_LABELS } from '../../types/comparator';

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export interface ComparatorSelectItemsStepProps {
  readonly options: SearchSelectOption[];
  readonly selectedItems: ComparisonItem[];
  readonly onSelectItem: (value: string) => void;
  readonly onRemoveItem: (itemId: string) => void;
  readonly comparisonType: ComparisonType;
  readonly labels?: Partial<ComparatorLabels>;
}

export function ComparatorSelectItemsStep({
  options,
  selectedItems,
  onSelectItem,
  onRemoveItem,
  comparisonType,
  labels: customLabels,
}: ComparatorSelectItemsStepProps) {
  const labels = { ...DEFAULT_COMPARATOR_LABELS, ...customLabels };
  const isMaxReached = selectedItems.length >= 5;
  const placeholder =
    comparisonType === 'school' ? labels.schools : labels.schoolYears;
  const itemTypeName =
    comparisonType === 'school'
      ? labels.schools.toLowerCase()
      : labels.schoolYears.toLowerCase();

  return (
    <div className="flex flex-col gap-4">
      <Text size="sm" className="text-text-600">
        Selecione uma {itemTypeName.slice(0, -1)} para comparar.
      </Text>

      <SearchSelect
        options={options}
        placeholder={placeholder}
        searchPlaceholder={`${labels.search} ${placeholder.toLowerCase()}...`}
        onValueChange={onSelectItem}
        disabled={isMaxReached}
        emptyText="Nenhum resultado encontrado"
        size="medium"
        variant="outlined"
      />

      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-secondary-50 rounded-xl border border-border-100">
          {selectedItems.map((item) => (
            <Badge
              key={item.id}
              variant="outlined"
              action="info"
              size="medium"
              className="flex items-center gap-1 pr-1"
            >
              <span
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate max-w-[200px]">{item.name}</span>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="ml-1 p-0.5 rounded-full hover:bg-secondary-200 transition-colors"
                aria-label={`Remover ${item.name}`}
              >
                <CloseIcon />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {isMaxReached && (
        <Text size="xs" className="text-warning-600">
          {labels.maxLimitWarning}
        </Text>
      )}

      <Text size="xs" className="text-text-500">
        {selectedItems.length} de 5 {itemTypeName} {labels.ofSelected}
      </Text>
    </div>
  );
}
