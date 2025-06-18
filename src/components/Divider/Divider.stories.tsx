import type { Story } from '@ladle/react';
import Divider from './Divider';

/**
 * Showcase principal: todas as variações possíveis do Divider
 */
export const AllDividers: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
    <h2 className="font-bold text-3xl text-text-900">Divider</h2>
    <p className="text-text-700">
      Variações possíveis do componente <code>Divider</code>:
    </p>

    {/* Divider Horizontal */}
    <h3 className="font-bold text-2xl text-text-900">Horizontal</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div className="font-medium text-text-900 mb-2">Padrão</div>
        <div className="w-full">
          <div className="p-4 bg-background-100 rounded-lg">
            <p className="text-text-700 mb-4">Conteúdo acima do divider</p>
            <Divider />
            <p className="text-text-700 mt-4">Conteúdo abaixo do divider</p>
          </div>
        </div>
      </div>
    </div>

    {/* Divider Vertical */}
    <h3 className="font-bold text-2xl text-text-900">Vertical</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div className="font-medium text-text-900 mb-2">Padrão</div>
        <div className="w-full">
          <div className="p-4 bg-background-100 rounded-lg flex items-center gap-4 h-20">
            <p className="text-text-700">Conteúdo à esquerda</p>
            <Divider orientation="vertical" />
            <p className="text-text-700">Conteúdo à direita</p>
          </div>
        </div>
      </div>
    </div>

    {/* Em uma lista */}
    <h3 className="font-bold text-2xl text-text-900">Em lista de itens</h3>
    <div className="w-full max-w-md">
      <div className="bg-background-100 rounded-lg p-4">
        <div className="text-text-900 font-medium mb-2">Item 1</div>
        <Divider />
        <div className="text-text-900 font-medium my-2">Item 2</div>
        <Divider />
        <div className="text-text-900 font-medium my-2">Item 3</div>
        <Divider />
        <div className="text-text-900 font-medium mt-2">Item 4</div>
      </div>
    </div>
  </div>
);

// Stories individuais para referência rápida
export const Horizontal: Story = () => (
  <div className="w-full p-4">
    <p className="text-text-700 mb-4">Conteúdo acima</p>
    <Divider />
    <p className="text-text-700 mt-4">Conteúdo abaixo</p>
  </div>
);

export const Vertical: Story = () => (
  <div className="flex items-center gap-4 h-20 p-4">
    <p className="text-text-700">À esquerda</p>
    <Divider orientation="vertical" />
    <p className="text-text-700">À direita</p>
  </div>
);
