import { HtmlHTMLAttributes, useEffect, useState } from 'react';
import CheckboxList, { CheckboxListItem } from '../CheckBox/CheckboxList';
import { cn } from '../../utils/utils';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle';
import { XCircleIcon } from '@phosphor-icons/react/dist/csr/XCircle';
import { CheckIcon } from '@phosphor-icons/react/dist/csr/Check';
import Badge from '../Badge/Badge';
import { HtmlMathRenderer } from '../HtmlMathRenderer';
import { QuizVariant } from '../Quiz/Quiz.types';
import { OptionStatus } from '../../enums/Options';

interface Choice {
  value: string;
  label: string;
  status?: OptionStatus;
  disabled?: boolean;
}

interface MultipleChoiceListProps extends HtmlHTMLAttributes<HTMLDivElement> {
  choices: Choice[];
  disabled?: boolean;
  name?: string;
  selectedValues?: string[];
  onHandleSelectedValues?: (values: string[]) => void;
  mode?: 'interactive' | 'readonly';
}

const MultipleChoiceList = ({
  disabled = false,
  className = '',
  choices,
  name,
  selectedValues,
  onHandleSelectedValues,
  mode = QuizVariant.INTERACTIVE,
}: MultipleChoiceListProps) => {
  const [actualValue, setActualValue] = useState(selectedValues);

  // Mirror the incoming prop into local state, but only when its *value*
  // actually changed. Comparing by reference alone would re-set state on every
  // render where the parent hands us a new-but-equal array, which feeds an
  // infinite re-render loop when the parent also subscribes to the store.
  useEffect(() => {
    setActualValue((prev) =>
      JSON.stringify(prev) === JSON.stringify(selectedValues)
        ? prev
        : selectedValues
    );
  }, [selectedValues]);
  const getStatusBadge = (status: Choice['status']) => {
    switch (status) {
      case OptionStatus.CORRECT:
        return (
          <Badge
            variant="solid"
            action="success"
            iconLeft={<CheckCircleIcon />}
          >
            Resposta correta
          </Badge>
        );
      case OptionStatus.INCORRECT:
        return (
          <Badge variant="solid" action="error" iconLeft={<XCircleIcon />}>
            Resposta incorreta
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusStyles = (status: Choice['status']) => {
    switch (status) {
      case OptionStatus.CORRECT:
        return 'bg-success-background border-success-300';
      case OptionStatus.INCORRECT:
        return 'bg-error-background border-error-300';
      default:
        return `bg-background border-border-100`;
    }
  };

  const renderVisualCheckbox = (isSelected: boolean, isDisabled: boolean) => {
    const checkboxClasses = cn(
      'w-5 h-5 rounded border-2 cursor-default transition-all duration-200 flex items-center justify-center',
      isSelected
        ? 'border-primary-950 bg-primary-950 text-text'
        : 'border-border-400 bg-background',
      isDisabled && 'opacity-40 cursor-not-allowed'
    );

    return (
      <div className={checkboxClasses}>
        {isSelected && <CheckIcon size={16} weight="bold" />}
      </div>
    );
  };

  if (mode === 'readonly') {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {choices.map((choice, i) => {
          const isSelected = actualValue?.includes(choice.value) || false;
          const statusStyles = getStatusStyles(choice.status);
          const statusBadge = getStatusBadge(choice.status);

          return (
            <div
              key={`readonly-${choice.value}-${i}`}
              className={cn(
                'flex flex-row justify-between gap-2 items-start p-2 rounded-lg transition-all',
                statusStyles,
                choice.disabled ? 'opacity-50 cursor-not-allowed' : ''
              )}
            >
              <div className="flex items-center gap-2 flex-1">
                {renderVisualCheckbox(isSelected, choice.disabled || disabled)}
                <HtmlMathRenderer
                  content={choice.label}
                  className={cn(
                    'flex-1',
                    isSelected ||
                      (choice.status && choice.status != OptionStatus.NEUTRAL)
                      ? 'text-text-950'
                      : 'text-text-600',
                    choice.disabled || disabled
                      ? 'cursor-not-allowed'
                      : 'cursor-default'
                  )}
                />
              </div>
              {statusBadge && (
                <div className="flex-shrink-0">{statusBadge}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div
      className={cn(
        'flex flex-row justify-between gap-2 items-start p-2 rounded-lg transition-all',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className
      )}
    >
      <CheckboxList
        name={name}
        values={actualValue}
        onValuesChange={(v) => {
          setActualValue(v);
          onHandleSelectedValues?.(v);
        }}
        disabled={disabled}
      >
        {choices.map((choice, i) => (
          <div
            key={`interactive-${choice.value}-${i}`}
            className="flex flex-row gap-2 items-center"
          >
            <CheckboxListItem
              value={choice.value}
              id={`interactive-${choice.value}-${i}`}
              disabled={choice.disabled || disabled}
            />

            <label
              htmlFor={`interactive-${choice.value}-${i}`}
              className={cn(
                'flex-1',
                actualValue?.includes(choice.value)
                  ? 'text-text-950'
                  : 'text-text-600',
                choice.disabled || disabled
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer'
              )}
            >
              <HtmlMathRenderer content={choice.label} />
            </label>
          </div>
        ))}
      </CheckboxList>
    </div>
  );
};

export { MultipleChoiceList };
