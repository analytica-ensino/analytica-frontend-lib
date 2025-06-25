import type { Story } from '@ladle/react';
import { Book, Star } from 'phosphor-react';
import {
  CardActivesResults,
  CardPerformance,
  CardProgress,
  CardQuestions,
  CardTopic,
} from './Card';

export const AllCardComponentsShowcase: Story = () => {
  const baseProps = {
    icon: <Star size={16} weight="fill" />,
    title: 'Título',
    subTitle: 'Subtítulo',
    header: 'Header Example',
    description: 'Texto Descrição.',
  };

  const actions: Array<'success' | 'warning' | 'error' | 'info'> = [
    'success',
    'warning',
    'error',
    'info',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Card Components - Showcase
      </h2>

      <h3 className="font-bold text-2xl text-text-900">CardActivesResults</h3>
      <div className="grid grid-cols-2 gap-6">
        {actions.map((action) => (
          <div key={action} className="flex flex-col items-center gap-2">
            <CardActivesResults
              className="max-w-[128px]"
              {...baseProps}
              action={action}
            />
            <span className="text-xs text-text-600">Action: {action}</span>
          </div>
        ))}
      </div>

      <h3 className="font-bold text-2xl text-text-900">
        CardActivesResults (Extended)
      </h3>
      <div className="grid grid-cols-2 gap-6">
        {actions.map((action) => (
          <div
            key={`${action}-extended`}
            className="flex flex-col items-center gap-2"
          >
            <CardActivesResults
              className="max-w-[262px]"
              {...baseProps}
              action={action}
              extended
            />
            <span className="text-xs text-text-600">
              Extended + Action: {action}
            </span>
          </div>
        ))}
      </div>

      <h3 className="font-bold text-2xl text-text-900">CardQuestions</h3>
      <div className="flex flex-row gap-6">
        <CardQuestions className="max-w-[360px]" header="Header" />
        <CardQuestions className="max-w-[360px]" header="Header" state="done" />
      </div>

      <h3 className="font-bold text-2xl text-text-900">CardProgress</h3>
      <div className="flex flex-row gap-6">
        <CardProgress
          className="max-w-[360px]"
          header="Header"
          initialDate="12 Fev 2025"
          endDate="20 Mar 2025"
          progress={20}
          color="#B7DFFF"
          icon={<Book />}
        />
        <CardProgress
          className="max-w-[180px]"
          direction="vertical"
          header="Header"
          initialDate=""
          endDate=""
          progress={20}
          color="#B7DFFF"
          icon={<Book />}
          subhead="0 de 3"
        />
      </div>

      <h3 className="font-bold text-2xl text-text-900">CardTopic</h3>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <h4 className="font-bold text-xl text-text-900">Sem Porcentagem</h4>
          <div className="flex flex-row gap-6">
            <CardTopic
              className="max-w-[360px]"
              header="Header"
              progress={20}
            />
            <CardTopic
              subHead={['Tema', 'Subtema']}
              className="max-w-[360px]"
              header="Header"
              progress={20}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="font-bold text-xl text-text-900">Com Porcentagem</h4>
          <div className="flex flex-row gap-6">
            <CardTopic
              className="max-w-[360px]"
              header="Header"
              progress={20}
              showPercentage
            />
            <CardTopic
              subHead={['Tema', 'Subtema']}
              className="max-w-[360px]"
              header="Header"
              progress={20}
              showPercentage
            />
          </div>
        </div>
      </div>

      <h3 className="font-bold text-2xl text-text-900">CardPerformance</h3>
      <div className="flex flex-row gap-6">
        <CardPerformance className="max-w-[360px]" header="Header" />
        <CardPerformance
          className="max-w-[360px]"
          header="Header"
          progress={30}
        />
      </div>
    </div>
  );
};
