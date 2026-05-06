import Text from '../Text/Text';
import Button from '../Button/Button';
import type { ComparisonType, ComparatorLabels } from '../../types/comparator';
import { DEFAULT_COMPARATOR_LABELS } from '../../types/comparator';

export interface ComparatorSelectTypeStepProps {
  readonly onSelectType: (type: ComparisonType) => void;
  readonly canCompareSchools: boolean;
  readonly canCompareSchoolYears: boolean;
  readonly labels?: Partial<ComparatorLabels>;
}

export function ComparatorSelectTypeStep({
  onSelectType,
  canCompareSchools,
  canCompareSchoolYears,
  labels: customLabels,
}: ComparatorSelectTypeStepProps) {
  const labels = { ...DEFAULT_COMPARATOR_LABELS, ...customLabels };

  if (!canCompareSchools && !canCompareSchoolYears) {
    return (
      <div className="flex flex-col gap-4">
        <Text size="sm" className="text-text-600">
          {labels.noAccessMessage}
        </Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Text size="sm" className="text-text-600">
        {labels.selectComparisonType}
      </Text>
      <div className="flex gap-4">
        {canCompareSchools && (
          <Button
            variant="raw"
            onClick={() => onSelectType('school')}
            className="flex-1 p-4 border border-border-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
          >
            <Text size="md" weight="semibold" className="text-text-950">
              {labels.schools}
            </Text>
            <Text size="sm" className="text-text-500">
              {labels.compareSchoolsDescription}
            </Text>
          </Button>
        )}
        {canCompareSchoolYears && (
          <Button
            variant="raw"
            onClick={() => onSelectType('schoolYear')}
            className="flex-1 p-4 border border-border-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
          >
            <Text size="md" weight="semibold" className="text-text-950">
              {labels.schoolYears}
            </Text>
            <Text size="sm" className="text-text-500">
              {labels.compareSchoolYearsDescription}
            </Text>
          </Button>
        )}
      </div>
    </div>
  );
}
