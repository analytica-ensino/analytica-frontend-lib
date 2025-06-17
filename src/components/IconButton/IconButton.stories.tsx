import type { Story } from '@ladle/react';
import { useState } from 'react';
import { Gear } from 'phosphor-react';
import IconButton from './IconButton';

/**
 * Showcase principal: demonstração do IconButton para ações rápidas
 */
export const AllIconButtons: Story = () => {
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({});

  const toggleActive = (buttonId: string) => {
    setActiveStates((prev) => ({
      ...prev,
      [buttonId]: !prev[buttonId],
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">IconButton</h2>
      <p className="text-text-700">
        Botão compacto apenas com ícone, ideal para menus dropdown, barras de
        ferramentas, ações secundárias e interfaces onde o espaço é limitado.
        Estado ativo permanece até ser clicado novamente.
      </p>

      {/* Tamanhos */}
      <section>
        <h3 className="font-bold text-2xl text-text-900 mb-4">Tamanhos:</h3>
        <div className="flex flex-row gap-8 items-center">
          <div className="flex flex-col items-center gap-2">
            <IconButton
              icon={<Gear size={16} />}
              size="sm"
              active={activeStates.small}
              onClick={() => toggleActive('small')}
            />
            <span className="text-sm text-text-600">Small</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <IconButton
              icon={<Gear size={24} />}
              size="md"
              active={activeStates.medium}
              onClick={() => toggleActive('medium')}
            />
            <span className="text-sm text-text-600">Medium</span>
          </div>
        </div>
        <p className="text-sm text-text-600 mt-4">
          Status:{' '}
          <strong>
            Small: {activeStates.small ? 'Ativo' : 'Inativo'} | Medium:{' '}
            {activeStates.medium ? 'Ativo' : 'Inativo'}
          </strong>
        </p>
      </section>
    </div>
  );
};
