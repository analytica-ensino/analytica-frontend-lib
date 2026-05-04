import type { Story } from '@ladle/react';
import { useState } from 'react';
import { PeriodSelector } from './PeriodSelector';

export const Default: Story = () => {
  const [period, setPeriod] = useState('1_MONTH');

  return (
    <div className="space-y-4">
      <p className="text-text-700 text-sm">
        Período selecionado: <strong>{period}</strong>
      </p>
      <PeriodSelector value={period} onChange={setPeriod} />
    </div>
  );
};

export const WithExcludedOptions: Story = () => {
  const [period, setPeriod] = useState('1_MONTH');

  return (
    <div className="space-y-4">
      <p className="text-text-700 text-sm">
        Excluindo <strong>3_MONTHS</strong> e <strong>1_YEAR</strong>
      </p>
      <PeriodSelector
        value={period}
        onChange={setPeriod}
        excludeValues={['3_MONTHS', '1_YEAR']}
      />
    </div>
  );
};

export const CustomOptions: Story = () => {
  const [period, setPeriod] = useState('TODAY');

  return (
    <div className="space-y-4">
      <p className="text-text-700 text-sm">
        Exemplo com opções customizadas para visão rápida.
      </p>
      <PeriodSelector
        value={period}
        onChange={setPeriod}
        defaultValue="TODAY"
        options={[
          { value: 'TODAY', label: 'Hoje' },
          { value: 'THIS_WEEK', label: 'Esta semana' },
          { value: 'THIS_MONTH', label: 'Este mês' },
        ]}
      />
    </div>
  );
};
