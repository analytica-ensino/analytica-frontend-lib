import { useState, type ReactNode } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';
import CheckBox from '../CheckBox/CheckBox';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';

export interface MultiCheckSelectOption<T extends string | number> {
  value: T;
  label: string;
}

export interface MultiCheckSelectProps<T extends string | number> {
  options: ReadonlyArray<MultiCheckSelectOption<T>>;
  /** Picked values. Empty means every option — there is no "none". */
  values: T[];
  /** Receives the full next selection, in the order of `options`. */
  onValuesChange: (values: T[]) => void;
  /** Caption of the trigger while every option is picked. */
  placeholder: string;
  /** Caption of the first item, the one that picks everything. */
  allLabel: string;
  /** Caption of the trigger while only some options are picked. */
  formatSelected: (count: number) => string;
  /** Rendered before the caption, inside the trigger. */
  icon?: ReactNode;
  /** Extra classes for the trigger. */
  className?: string;
  'aria-label'?: string;
}

/**
 * A compact dropdown of checkboxes whose first item picks every option — a
 * header filter the size of a Select, where MultiSearchSelect would be a
 * search field with chips. The "Tempo de prova" of the Momento ENEM report of
 * the gestor app.
 *
 * Every option picked and none picked are the same thing, the whole set, so
 * the selection is normalised to `[]` for both: checking the last missing
 * option, unchecking the last picked one or clicking the "all" item all land
 * there.
 *
 * The `DropdownMenu` primitives are rendered right here, not through a
 * wrapper: the menu injects its store by walking this element tree, and an
 * indirection would hide the items from it.
 *
 * @example
 * ```tsx
 * <MultiCheckSelect
 *   options={[{ value: 30, label: '30 min' }, { value: 60, label: '1h' }]}
 *   values={durations}
 *   onValuesChange={setDurations}
 *   placeholder="Tempo de prova"
 *   allLabel="Todos os tempos"
 *   formatSelected={(count) => `${count} tempos selecionados`}
 * />
 * ```
 */
export function MultiCheckSelect<T extends string | number>({
  options,
  values,
  onValuesChange,
  placeholder,
  allLabel,
  formatSelected,
  icon,
  className,
  'aria-label': ariaLabel,
}: Readonly<MultiCheckSelectProps<T>>) {
  const [open, setOpen] = useState(false);

  const isAll = values.length === 0 || values.length >= options.length;
  const isChecked = (value: T) => isAll || values.includes(value);

  const toggle = (value: T) => {
    const next = options
      .map((option) => option.value)
      .filter((optionValue) =>
        optionValue === value ? !isChecked(value) : isChecked(optionValue)
      );
    onValuesChange(next.length === options.length ? [] : next);
  };

  return (
    <DropdownMenu onOpenChange={setOpen}>
      {/* `border-solid` is not decoration: the trigger ships `border-none`, a
          border *style*, which `border-2` (a width) does not override. */}
      <DropdownMenuTrigger
        aria-label={ariaLabel}
        className={cn(
          'flex h-8 items-center gap-2 rounded-lg border-2 border-solid border-border-300 px-2 py-1 whitespace-nowrap text-text-700 cursor-pointer hover:bg-accent focus:border-primary-950',
          className
        )}
      >
        {icon}
        <Text as="span" size="md" className="text-inherit">
          {isAll ? placeholder : formatSelected(values.length)}
        </Text>
        <CaretDownIcon
          aria-hidden="true"
          className={cn(
            'h-[1em] w-[1em] opacity-50 transition-transform',
            open && 'rotate-180'
          )}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-full">
        {/* The checkbox is only a picture of the state: the item takes the
            click. Otherwise a click on its label would also click the input,
            and the two clicks would toggle twice. */}
        <DropdownMenuItem
          preventClose
          onClick={() => {
            if (!isAll) onValuesChange([]);
          }}
        >
          <span className="pointer-events-none flex">
            <CheckBox checked={isAll} readOnly tabIndex={-1} label={allLabel} />
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {options.map((option) => (
          <DropdownMenuItem
            key={String(option.value)}
            preventClose
            onClick={() => toggle(option.value)}
          >
            <span className="pointer-events-none flex">
              <CheckBox
                checked={isChecked(option.value)}
                readOnly
                tabIndex={-1}
                label={option.label}
              />
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default MultiCheckSelect;
