import type { Story } from '@ladle/react';
import { ActivityModelsList } from './ActivityModelsList';
import type { ActivityModelTableItem } from '../../../types/activitiesHistory';
import { ActivityType } from '../../ActivityCreate/ActivityCreate.types';

const mockModels: ActivityModelTableItem[] = [
  {
    id: '1',
    type: ActivityType.MODELO,
    title: 'Explorando a Fotossíntese: Atividade Prática de Campo',
    savedAt: '01/01/2024',
    subject: {
      id: 'bio-1',
      name: 'Biologia',
      icon: 'Microscope',
      color: '#E8F5E9',
    },
    subjectId: 'bio-1',
  },
  {
    id: '2',
    type: ActivityType.MODELO,
    title: 'Estudo dos Ecossistemas: Criando um Terrário',
    savedAt: '02/01/2024',
    subject: {
      id: 'bio-1',
      name: 'Biologia',
      icon: 'Microscope',
      color: '#E8F5E9',
    },
    subjectId: 'bio-1',
  },
  {
    id: '3',
    type: ActivityType.MODELO,
    title: 'Análise de pinturas: Observação ao Microscópio',
    savedAt: '03/01/2024',
    subject: {
      id: 'art-1',
      name: 'Artes',
      icon: 'Palette',
      color: '#FCE4EC',
    },
    subjectId: 'art-1',
  },
];

/**
 * Basic list with models
 */
export const Basic: Story = () => {
  return (
    <div className="p-4">
      <ActivityModelsList
        models={mockModels}
        loading={false}
        onParamsChange={(params) => {
          console.log('Params changed:', params);
        }}
        onRowClick={(model) => {
          console.log('Row clicked:', model);
        }}
      />
    </div>
  );
};

/**
 * Loading state
 */
export const Loading: Story = () => {
  return (
    <div className="p-4">
      <ActivityModelsList
        models={[]}
        loading={true}
        onParamsChange={(params) => {
          console.log('Params changed:', params);
        }}
        onRowClick={(model) => {
          console.log('Row clicked:', model);
        }}
      />
    </div>
  );
};

/**
 * Empty state
 */
export const Empty: Story = () => {
  return (
    <div className="p-4">
      <ActivityModelsList
        models={[]}
        loading={false}
        onParamsChange={(params) => {
          console.log('Params changed:', params);
        }}
        onRowClick={(model) => {
          console.log('Row clicked:', model);
        }}
      />
    </div>
  );
};
