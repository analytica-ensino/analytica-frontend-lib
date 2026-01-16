import type { Story } from '@ladle/react';
import { Info } from 'phosphor-react';
import Tooltip from './Tooltip';

/**
 * Showcase principal: Tooltip com ícone Info
 */
export const AllTooltips: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <h2 className="font-bold text-3xl text-text-900">Tooltip</h2>
    <p className="text-text-700">
      Componente para exibir informações adicionais ao passar o mouse sobre o
      ícone de informação.
    </p>

    {/* Posições */}
    <section>
      <h3 className="font-bold text-2xl text-text-900 mb-4">Posições</h3>
      <div className="flex flex-row gap-16 items-center justify-center py-16">
        <div className="flex flex-col items-center gap-2">
          <Tooltip content="Tooltip no topo" position="top">
            <Info
              size={18}
              weight="bold"
              className="text-text-950 cursor-pointer"
            />
          </Tooltip>
          <span className="text-sm text-text-500">Top</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Tooltip content="Tooltip embaixo" position="bottom">
            <Info
              size={18}
              weight="bold"
              className="text-text-950 cursor-pointer"
            />
          </Tooltip>
          <span className="text-sm text-text-500">Bottom</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Tooltip content="Tooltip à esquerda" position="left">
            <Info
              size={18}
              weight="bold"
              className="text-text-950 cursor-pointer"
            />
          </Tooltip>
          <span className="text-sm text-text-500">Left</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Tooltip content="Tooltip à direita" position="right">
            <Info
              size={18}
              weight="bold"
              className="text-text-950 cursor-pointer"
            />
          </Tooltip>
          <span className="text-sm text-text-500">Right</span>
        </div>
      </div>
    </section>

    {/* Exemplo de uso real */}
    <section>
      <h3 className="font-bold text-2xl text-text-900 mb-4">Exemplo de uso</h3>
      <div className="flex items-center gap-2 py-8">
        <span className="text-text-950 font-medium">Desempenho</span>
        <Tooltip content="Desempenho baseado nas atividades" position="bottom">
          <Info
            size={18}
            weight="bold"
            className="text-text-950 cursor-pointer"
          />
        </Tooltip>
      </div>
    </section>
  </div>
);

/**
 * Tooltip padrão (posição top)
 */
export const Default: Story = () => (
  <div className="flex items-center justify-center py-16">
    <Tooltip content="Informação adicional">
      <Info size={18} weight="bold" className="text-text-950 cursor-pointer" />
    </Tooltip>
  </div>
);

/**
 * Tooltip posicionado embaixo
 */
export const BottomPosition: Story = () => (
  <div className="flex items-center justify-center py-16">
    <Tooltip content="Informação adicional" position="bottom">
      <Info size={18} weight="bold" className="text-text-950 cursor-pointer" />
    </Tooltip>
  </div>
);

/**
 * Tooltip posicionado à esquerda
 */
export const LeftPosition: Story = () => (
  <div className="flex items-center justify-center py-16">
    <Tooltip content="Informação adicional" position="left">
      <Info size={18} weight="bold" className="text-text-950 cursor-pointer" />
    </Tooltip>
  </div>
);

/**
 * Tooltip posicionado à direita
 */
export const RightPosition: Story = () => (
  <div className="flex items-center justify-center py-16">
    <Tooltip content="Informação adicional" position="right">
      <Info size={18} weight="bold" className="text-text-950 cursor-pointer" />
    </Tooltip>
  </div>
);
