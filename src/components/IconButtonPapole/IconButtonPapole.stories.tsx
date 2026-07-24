import type { Story } from '@ladle/react';
import { IconButtonPapole } from './IconButtonPapole';

/**
 * "Solid Icon button, xl" do Papolê com o ícone de voz. Interaja pra ver os
 * estados: passe o mouse (hover), clique e segure (pressed) e navegue com Tab
 * (focus).
 */
export const Default: Story = () => (
  <div
    data-theme="papole-light"
    className="flex min-h-[220px] items-center justify-center bg-[#CBC7F2] p-8"
  >
    <IconButtonPapole aria-label="Falar" />
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
      <IconButtonPapole aria-label="Falar" />
      <span className="text-xs text-text-700">default / hover / pressed</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <IconButtonPapole aria-label="Falar" autoFocus />
      <span className="text-xs text-text-700">focus</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <IconButtonPapole aria-label="Falar" disabled />
      <span className="text-xs text-text-700">disabled</span>
    </div>
  </div>
);
