import type { Story } from '@ladle/react';
import {
  CaretRight,
  CaretLeft,
  Plus,
  PencilSimple,
  X,
  Play,
} from 'phosphor-react';
import { IconRoundedButton } from './IconRoundedButton';

/**
 * Showcase principal: demonstração do IconRoundedButton
 */
export const AllIconRoundedButtons: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
    <h2 className="font-bold text-3xl text-text-900">IconRoundedButton</h2>
    <p className="text-text-700">
      Botão redondo simples para exibir apenas ícones. Ideal para navegação,
      controles e ações rápidas.
    </p>

    {/* Exemplos básicos */}
    <h3 className="font-bold text-2xl text-text-900">Exemplos de Uso</h3>
    <div className="flex flex-row gap-4 items-center">
      <IconRoundedButton icon={<CaretLeft size={16} />} />
      <IconRoundedButton icon={<CaretRight size={16} />} />
      <IconRoundedButton icon={<Plus size={16} />} />
      <IconRoundedButton icon={<PencilSimple size={16} />} />
      <IconRoundedButton icon={<X size={16} />} />
      <IconRoundedButton icon={<Play size={16} />} />
    </div>

    <div className="flex flex-col gap-6">
      <div>
        <div className="font-medium text-text-900 mb-2">Navegação</div>
        <div className="flex flex-row gap-2 items-center">
          <IconRoundedButton
            icon={<CaretLeft size={16} />}
            title="Página anterior"
          />
          <span className="text-text-700 mx-2">Página 1 de 10</span>
          <IconRoundedButton
            icon={<CaretRight size={16} />}
            title="Próxima página"
          />
        </div>
      </div>
    </div>
  </div>
);
