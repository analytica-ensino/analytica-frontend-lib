import type { Story } from '@ladle/react';
import { IconButtonReadingFluency } from './IconButtonReadingFluency';

/**
 * "Solid Icon button, xl" do Reading Fluency com o ícone de voz. Interaja pra ver os
 * estados: passe o mouse (hover), clique e segure (pressed) e navegue com Tab
 * (focus).
 */
export const Default: Story = () => (
  <div
    data-theme="papole-light"
    className="flex min-h-[220px] items-center justify-center bg-[#CBC7F2] p-8"
  >
    <IconButtonReadingFluency aria-label="Falar" />
  </div>
);

/**
 * Com `label` — a variante da arte (ícone 61×50 + rótulo "Bold/Upper/Bold 20" em
 * `secondary-700`). A largura acompanha o conteúdo. O `aria-label` continua
 * valendo quando você quer um nome acessível mais descritivo que o rótulo.
 */
export const ComRotulo: Story = () => (
  <div
    data-theme="papole-light"
    className="flex min-h-[220px] items-center justify-center gap-6 bg-[#CBC7F2] p-8"
  >
    <div className="flex flex-col items-center gap-2">
      <IconButtonReadingFluency aria-label="Falar" />
      <span className="text-xs text-text-700">só ícone</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <IconButtonReadingFluency aria-label="Ouvir narração" label="Ouvir" />
      <span className="text-xs text-text-700">ícone + label</span>
    </div>
  </div>
);

/**
 * Os 4 estados lado a lado — os 3 primeiros são interativos (default aciona
 * hover/pressed/focus ao interagir). O último mostra `disabled`.
 */
export const Estados: Story = () => (
  <div
    data-theme="papole-light"
    className="flex min-h-[220px] items-center justify-center gap-6 bg-[#CBC7F2] p-8"
  >
    <div className="flex flex-col items-center gap-2">
      <IconButtonReadingFluency aria-label="Falar" />
      <span className="text-xs text-text-700">default / hover / pressed</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <IconButtonReadingFluency aria-label="Falar" autoFocus />
      <span className="text-xs text-text-700">focus</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <IconButtonReadingFluency aria-label="Falar" disabled />
      <span className="text-xs text-text-700">disabled</span>
    </div>
  </div>
);
