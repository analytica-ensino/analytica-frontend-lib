import type { Story } from '@ladle/react';
import { CloseButtonReadingFluency } from './CloseButtonReadingFluency';

export const Default: Story = () => (
  <div data-theme="papole-light" className="flex flex-col gap-8 p-8">
    <p className="text-sm text-text-700">
      Botão de fechar do tema Reading Fluency. Alvo de 42×42 com o disco visível
      de ~29px. Usado nos modals papole (header verde) e no de sucesso (corpo
      branco).
    </p>

    {/* Sobre o header verde dos modals */}
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold uppercase text-text-900">
        Sobre o header verde
      </span>
      <div className="relative h-28 w-[420px] rounded-3xl bg-secondary-500">
        <span className="absolute right-4 top-4">
          <CloseButtonReadingFluency onClick={() => {}} />
        </span>
      </div>
    </div>

    {/* Sobre o corpo branco (SuccessModal) */}
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold uppercase text-text-900">
        Sobre o corpo branco
      </span>
      <div className="relative h-28 w-[420px] rounded-3xl bg-background shadow-hard-shadow-2">
        <span className="absolute right-4 top-4">
          <CloseButtonReadingFluency onClick={() => {}} />
        </span>
      </div>
    </div>

    {/* Tamanhos e desabilitado */}
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold uppercase text-text-900">
        Tamanhos e desabilitado
      </span>
      <div className="flex items-end gap-6 rounded-2xl bg-secondary-500 p-6">
        {[24, 37, 56].map((iconSize) => (
          <div key={iconSize} className="flex flex-col items-center gap-2">
            <CloseButtonReadingFluency iconSize={iconSize} />
            <span className="text-xs text-primary-100">{iconSize}px</span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-2">
          <CloseButtonReadingFluency disabled />
          <span className="text-xs text-primary-100">disabled</span>
        </div>
      </div>
    </div>
  </div>
);
