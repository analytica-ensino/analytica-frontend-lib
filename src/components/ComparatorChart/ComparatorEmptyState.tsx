import { Plus } from 'phosphor-react';
import Text from '../Text/Text';
import Button from '../Button/Button';
import type { ComparatorLabels } from '../../types/comparator';
import { DEFAULT_COMPARATOR_LABELS } from '../../types/comparator';

export interface ComparatorEmptyStateProps {
  readonly onSelectClick: () => void;
  readonly canCompareSchools: boolean;
  readonly canCompareSchoolYears: boolean;
  readonly isLoading?: boolean;
  readonly labels?: Partial<ComparatorLabels>;
}

export function ComparatorEmptyState({
  onSelectClick,
  canCompareSchools,
  canCompareSchoolYears,
  isLoading = false,
  labels: customLabels,
}: ComparatorEmptyStateProps) {
  const labels = { ...DEFAULT_COMPARATOR_LABELS, ...customLabels };
  const hasAnyOption = canCompareSchools || canCompareSchoolYears;

  const buttonText =
    canCompareSchools && canCompareSchoolYears
      ? labels.selectComparison
      : canCompareSchools
        ? labels.selectSchools
        : labels.selectSchoolYears;

  const descriptionText =
    canCompareSchools && canCompareSchoolYears
      ? labels.emptyStateDescriptionBoth
      : canCompareSchools
        ? labels.emptyStateDescriptionSchools
        : canCompareSchoolYears
          ? labels.emptyStateDescriptionSchoolYears
          : labels.noAccessMessage;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
        <svg
          className="w-12 h-12 text-primary-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <div className="text-center">
        <Text size="lg" weight="semibold" className="text-text-950 mb-2">
          {labels.title}
        </Text>
        <Text size="sm" className="text-text-500">
          {descriptionText}
        </Text>
      </div>
      {hasAnyOption && (
        <Button
          variant="outline"
          action="primary"
          size="medium"
          onClick={onSelectClick}
          disabled={isLoading}
        >
          <Plus size={18} />
          {buttonText}
        </Button>
      )}
    </div>
  );
}
