import type { Story } from '@ladle/react';
import { useState } from 'react';
import { MultiSearchSelect } from './MultiSearchSelect';
import Text from '../Text/Text';
import type { MultiSearchSelectOption } from './MultiSearchSelect';

const sizes = ['small', 'medium', 'large'] as const;
const variants = ['outlined', 'underlined', 'rounded'] as const;

const classOptions: MultiSearchSelectOption[] = [
  { value: 'c-1', label: 'A - NEM EPT IF TEC DESE SIST-ET IC' },
  { value: 'c-2', label: 'A - NOVO ENSINO MEDIO-PROFISSIONAL' },
  { value: 'c-3', label: 'B - ENSINO MEDIO FGB' },
  { value: 'c-4', label: 'B - ENS MEDIO IF LGG/CHS L ING CCM' },
  { value: 'c-5', label: 'C - ENSINO MEDIO' },
];

const fruitOptions: MultiSearchSelectOption[] = [
  { value: 'apple', label: 'Maçã' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Laranja' },
  { value: 'grape', label: 'Uva' },
  { value: 'strawberry', label: 'Morango' },
];

export const Default: Story = () => {
  const [values, setValues] = useState<string[]>([]);

  return (
    <div className="w-96 p-4">
      <MultiSearchSelect
        label="Turmas"
        values={values}
        onValuesChange={setValues}
        options={classOptions}
        placeholder="Selecione as turmas"
        searchPlaceholder="Buscar turma..."
      />
      <Text size="sm" className="mt-4 text-text-500">
        Selecionadas: {values.length ? values.join(', ') : 'nenhuma'}
      </Text>
    </div>
  );
};

export const WithPreselectedValues: Story = () => {
  const [values, setValues] = useState<string[]>(['c-1', 'c-3']);

  return (
    <div className="w-96 p-4">
      <MultiSearchSelect
        label="Turmas"
        values={values}
        onValuesChange={setValues}
        options={classOptions}
      />
    </div>
  );
};

/** Chips beyond `maxVisibleChips` collapse into a counter. */
export const ChipOverflow: Story = () => {
  const [values, setValues] = useState<string[]>([
    'c-1',
    'c-2',
    'c-3',
    'c-4',
    'c-5',
  ]);

  return (
    <div className="w-96 p-4">
      <MultiSearchSelect
        label="Turmas"
        values={values}
        onValuesChange={setValues}
        options={classOptions}
        maxVisibleChips={2}
      />
    </div>
  );
};

/**
 * A selected value missing from `options` is kept and labelled, never dropped —
 * otherwise a still-loading list would silently discard a real binding.
 */
export const UnknownValue: Story = () => {
  const [values, setValues] = useState<string[]>(['c-1', 'removed-id']);

  return (
    <div className="w-96 p-4">
      <MultiSearchSelect
        label="Turmas"
        values={values}
        onValuesChange={setValues}
        options={classOptions}
        unknownValueLabel="Turma não encontrada"
      />
    </div>
  );
};

export const WithHelperText: Story = () => {
  const [values, setValues] = useState<string[]>([]);

  return (
    <div className="w-96 p-4">
      <MultiSearchSelect
        label="Frutas"
        values={values}
        onValuesChange={setValues}
        options={fruitOptions}
        helperText="Escolha ao menos uma fruta"
      />
    </div>
  );
};

export const WithError: Story = () => {
  const [values, setValues] = useState<string[]>([]);

  return (
    <div className="w-96 p-4">
      <MultiSearchSelect
        label="Frutas"
        values={values}
        onValuesChange={setValues}
        options={fruitOptions}
        errorMessage="Selecione ao menos uma fruta"
      />
    </div>
  );
};

export const DisabledOptions: Story = () => {
  const [values, setValues] = useState<string[]>([]);

  return (
    <div className="w-96 p-4">
      <MultiSearchSelect
        label="Frutas"
        values={values}
        onValuesChange={setValues}
        options={fruitOptions.map((option, index) => ({
          ...option,
          disabled: index % 2 === 1,
        }))}
      />
    </div>
  );
};

export const States: Story = () => {
  const [values, setValues] = useState<string[]>(['apple']);

  return (
    <div className="flex w-96 flex-col gap-6 p-4">
      <MultiSearchSelect
        label="Desabilitado"
        values={values}
        onValuesChange={setValues}
        options={fruitOptions}
        disabled
      />
      <MultiSearchSelect
        label="Carregando"
        values={[]}
        onValuesChange={setValues}
        options={[]}
        loading
      />
      <MultiSearchSelect
        label="Sem opções"
        values={[]}
        onValuesChange={setValues}
        options={[]}
        emptyText="Nenhuma fruta encontrada"
      />
    </div>
  );
};

export const Sizes: Story = () => {
  const [values, setValues] = useState<string[]>(['apple', 'banana']);

  return (
    <div className="flex w-96 flex-col gap-6 p-4">
      {sizes.map((size) => (
        <MultiSearchSelect
          key={size}
          label={`Size: ${size}`}
          values={values}
          onValuesChange={setValues}
          options={fruitOptions}
          size={size}
        />
      ))}
    </div>
  );
};

export const Variants: Story = () => {
  const [values, setValues] = useState<string[]>(['apple']);

  return (
    <div className="flex w-96 flex-col gap-6 p-4">
      {variants.map((variant) => (
        <MultiSearchSelect
          key={variant}
          label={`Variant: ${variant}`}
          values={values}
          onValuesChange={setValues}
          options={fruitOptions}
          variant={variant}
        />
      ))}
    </div>
  );
};
