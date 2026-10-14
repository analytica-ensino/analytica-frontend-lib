import { useState } from 'react';
import type { Story } from '@ladle/react';
import { SelectionButtonReadingFluency } from './SelectionButtonReadingFluency';

/**
 * "Selection button, xl" da arte: default (bege, aresta 3D) e selected (verde
 * claro). Passe o mouse e clique e segure para ver hover e pressed.
 */
export const Estados: Story = () => (
  <div
    data-theme="papole-aluno-light"
    className="flex min-h-[200px] items-center justify-center gap-2 bg-background-100 p-8"
  >
    <div className="w-[187px]">
      <SelectionButtonReadingFluency>16</SelectionButtonReadingFluency>
    </div>
    <div className="w-[187px]">
      <SelectionButtonReadingFluency selected>15</SelectionButtonReadingFluency>
    </div>
    <div className="w-[187px]">
      <SelectionButtonReadingFluency disabled>60</SelectionButtonReadingFluency>
    </div>
  </div>
);

/** Clique para alternar a seleção. */
export const Interativo: Story = () => {
  const [selected, setSelected] = useState(false);
  return (
    <div
      data-theme="papole-aluno-light"
      className="flex min-h-[200px] items-center justify-center bg-background-100 p-8"
    >
      <div className="w-[187px]">
        <SelectionButtonReadingFluency
          selected={selected}
          onClick={() => setSelected((value) => !value)}
        >
          14
        </SelectionButtonReadingFluency>
      </div>
    </div>
  );
};
