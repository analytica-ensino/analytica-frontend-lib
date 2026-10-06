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
import {
  ROW_INTERACTION_CLASSES,
  STRETCHED_LABEL_CLASSES,
} from '../Alternative/choiceRowClasses';
import Text from '../Text/Text';

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
  /** Id of the element that names the group (e.g. the question heading) */
  labelledBy?: string;
  /** Id(s) of the element(s) that describe the group (e.g. the statement) */
  describedBy?: string;
}

const MultipleChoiceList = ({
  disabled = false,
  className = '',
  choices,
  name,
  selectedValues,
  onHandleSelectedValues,
  mode = QuizVariant.INTERACTIVE,
  labelledBy,
  describedBy,
}: MultipleChoiceListProps) => {
  // A heading passed by the consumer names the group; otherwise fall back to
  // a fixed, readable label instead of the generated group name.
  const groupA11yProps = {
    role: 'group',
    ...(labelledBy
      ? { 'aria-labelledby': labelledBy, 'aria-label': undefined }
      : { 'aria-label': 'Alternativas' }),
    'aria-describedby': describedBy,
  };
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
            iconLeft={<CheckCircleIcon aria-hidden="true" />}
          >
            Resposta correta
          </Badge>
        );
      case OptionStatus.INCORRECT:
        return (
          <Badge
            variant="solid"
            action="error"
            iconLeft={<XCircleIcon aria-hidden="true" />}
          >
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
      // Puramente decorativo: o estado sai no texto `sr-only` da linha.
      <div className={checkboxClasses} aria-hidden="true">
        {isSelected && <CheckIcon size={16} weight="bold" />}
      </div>
    );
  };

  if (mode === 'readonly') {
    return (
      <div {...groupA11yProps} className={cn('flex flex-col gap-2', className)}>
        {choices.map((choice, i) => {
          const isSelected = actualValue?.includes(choice.value) || false;
          const statusStyles = getStatusStyles(choice.status);
          const statusBadge = getStatusBadge(choice.status);
          const isDisabled = choice.disabled || disabled;

          /*
           * Resultado só de leitura: não há controle para operar, então a linha
           * não finge ser um checkbox. A leitura sai do texto, na ordem:
           * posição, enunciado da alternativa, status e o que o aluno marcou.
           */
          return (
            <div
              key={`readonly-${choice.value}-${i}`}
              className={cn(
                'flex flex-row justify-between gap-2 items-start p-2 rounded-lg transition-all',
                statusStyles,
                choice.disabled ? 'opacity-50 cursor-not-allowed' : ''
              )}
            >
              <Text as="span" className="sr-only">
                {`Alternativa ${i + 1} de ${choices.length}`}
              </Text>
              <div className="flex items-center gap-2 flex-1">
                {renderVisualCheckbox(isSelected, isDisabled)}
                <HtmlMathRenderer
                  content={choice.label}
                  className={cn(
                    'flex-1',
                    isSelected ||
                      (choice.status && choice.status != OptionStatus.NEUTRAL)
                      ? 'text-text-950'
                      : 'text-text-600',
                    isDisabled ? 'cursor-not-allowed' : 'cursor-default'
                  )}
                />
              </div>
              {statusBadge && (
                <div className="flex-shrink-0">{statusBadge}</div>
              )}
              {/* Única fonte do que o aluno escolheu para o leitor de tela. */}
              <Text as="span" className="sr-only">
                {isSelected ? 'Você marcou' : 'Não marcada'}
              </Text>
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
        {...groupA11yProps}
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
            className={cn(
              'flex flex-row gap-2 items-center p-2 rounded-lg transition-all',
              ROW_INTERACTION_CLASSES,
              choice.disabled || disabled
                ? 'cursor-not-allowed'
                : 'cursor-pointer hover:bg-background-50'
            )}
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
                STRETCHED_LABEL_CLASSES,
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
