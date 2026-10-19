import { useState } from 'react';
import { EducationStageSelect } from './EducationStageSelect';

type AccessStage =
  | 'REGULAR_1'
  | 'REGULAR_2'
  | 'REGULAR_3'
  | 'EJA'
  | 'SUBSEQUENTE';

const ACCESS_STAGES: ReadonlyArray<{ value: AccessStage; label: string }> = [
  { value: 'REGULAR_1', label: '1ª série regular' },
  { value: 'REGULAR_2', label: '2ª série regular' },
  { value: 'REGULAR_3', label: '3ª série regular' },
  { value: 'EJA', label: 'EJA' },
  { value: 'SUBSEQUENTE', label: 'Subsequente' },
];

/** The Acesso report's shape: "Todas as séries" first, nothing picked. */
export const WithAll = () => {
  const [value, setValue] = useState<AccessStage | null>(null);

  return (
    <EducationStageSelect
      value={value}
      onChange={setValue}
      options={ACCESS_STAGES}
      allLabel="Todas as séries"
    />
  );
};

/** Only the stages the scope has are offered, in the options' order. */
export const NarrowedByScope = () => {
  const [value, setValue] = useState<AccessStage | null>(null);

  return (
    <EducationStageSelect
      value={value}
      onChange={setValue}
      options={ACCESS_STAGES}
      availableStages={['SUBSEQUENTE', 'REGULAR_3']}
      allLabel="Todas as séries"
    />
  );
};

/** The Momento ENEM's shape: a stage is always picked. */
export const AlwaysPicked = () => {
  const [value, setValue] = useState<AccessStage | null>('REGULAR_3');

  return (
    <EducationStageSelect
      value={value}
      onChange={setValue}
      options={ACCESS_STAGES}
    />
  );
};
