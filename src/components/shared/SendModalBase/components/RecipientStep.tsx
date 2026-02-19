import type { FC } from 'react';
import { cn } from '../../../../utils/utils';
import Text from '../../../Text/Text';
import { CheckboxGroup } from '../../../CheckBoxGroup/CheckBoxGroup';
import { SendModalError } from './SendModalError';
import type { CategoryConfig, CategoriesChangeHandler } from '../types';

/**
 * Props for RecipientStep component
 */
export interface RecipientStepProps {
  /** Categories to display for selection */
  categories: CategoryConfig[];
  /** Handler for categories change */
  onCategoriesChange: CategoriesChangeHandler;
  /** Entity name with article for the question text (e.g., "a aula", "a atividade") */
  entityNameWithArticle: string;
  /** Error message for students validation */
  studentsError?: string;
  /** Optional test ID prefix */
  testIdPrefix?: string;
}

/**
 * Recipient selection step component for SendModal
 * Displays a CheckboxGroup for selecting recipients (students/classes)
 */
export const RecipientStep: FC<RecipientStepProps> = ({
  categories,
  onCategoriesChange,
  entityNameWithArticle,
  studentsError,
  testIdPrefix,
}) => {
  return (
    <div
      className="flex flex-col gap-4 min-h-0 flex-1"
      data-testid={testIdPrefix ? `${testIdPrefix}-recipient-step` : undefined}
    >
      <Text
        size="sm"
        weight="medium"
        color="text-text-700"
        className="flex-shrink-0"
      >
        Para quem você vai enviar {entityNameWithArticle}?
      </Text>

      <div
        className={cn(
          'flex-1 min-h-0 overflow-y-auto',
          'scrollbar-thin scrollbar-thumb-border-300 scrollbar-track-transparent'
        )}
        data-testid={testIdPrefix ? `${testIdPrefix}-scroll-container` : 'scroll-container'}
      >
        <CheckboxGroup
          categories={categories}
          onCategoriesChange={onCategoriesChange}
          compactSingleItem={true}
          showDivider={true}
        />
      </div>

      <SendModalError
        error={studentsError}
        testId={testIdPrefix ? `${testIdPrefix}-students-error` : undefined}
        className="flex-shrink-0"
      />
    </div>
  );
};

export default RecipientStep;
