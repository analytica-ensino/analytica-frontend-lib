import { useState } from 'react';
import { ClockIcon } from '@phosphor-icons/react/dist/csr/Clock';
import { MultiCheckSelect } from './MultiCheckSelect';

const DURATIONS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1h' },
  { value: 90, label: '1h 30min' },
  { value: 120, label: '2h' },
];

export const Default = () => {
  const [values, setValues] = useState<number[]>([]);

  return (
    <MultiCheckSelect
      options={DURATIONS}
      values={values}
      onValuesChange={setValues}
      placeholder="Tempo de prova"
      allLabel="Todos os tempos"
      formatSelected={(count) =>
        count === 1 ? '1 tempo selecionado' : `${count} tempos selecionados`
      }
      icon={<ClockIcon size={18} aria-hidden="true" />}
      aria-label="Tempo de prova"
    />
  );
};
