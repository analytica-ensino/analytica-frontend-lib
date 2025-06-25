// src/components/CardActivesResults.stories.tsx

import type { Story } from '@ladle/react';
import { Book, Star } from 'phosphor-react';
import { CardActivesResults, CardProgress, CardQuestions } from './Card';

/**
 * Showcase principal: todos os estados do CardActivesResults
 */
export const AllCardActivesResults: Story = () => {
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
        CardActivesResults - Estados
      </h2>
      <p className="text-text-700">
        Variações do componente <code>CardActivesResults</code> com diferentes
        ações e estados estendidos.
      </p>

      {/* Estados por action */}
      <h3 className="font-bold text-2xl text-text-900">Ações</h3>
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

      {/* Estado Extended */}
      <h3 className="font-bold text-2xl text-text-900">Extended State</h3>
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

      <h3 className="font-bold text-2xl text-text-900">Extended State</h3>
      <div className="flex flex-row gap-6">
        <CardQuestions className="max-w-[360px]" header="Header" />
        <CardQuestions className="max-w-[360px]" header="Header" state="done" />
      </div>

      <h3 className="font-bold text-2xl text-text-900">Extended State</h3>
      <div className="flex flex-row gap-6">
        <CardProgress
          className="max-w-[360px]"
          header="Header"
          initialDate="12 Fev 2025"
          endDate="20 Mar 2025"
          progress={20}
          icon={<Book />}
        />
        <CardProgress
          className="max-w-[180px]"
          direction="vertical"
          header="Header"
          initialDate=""
          endDate=""
          progress={20}
          icon={<Book />}
          subhead="0 de 3"
        />
      </div>
    </div>
  );
};
