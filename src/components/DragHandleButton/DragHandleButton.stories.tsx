import type { Story } from '@ladle/react';
import { useState } from 'react';
import DragHandleButton from './DragHandleButton';

const ITENS_INICIAIS = ['Biologia', 'Física', 'Química', 'Matemática'];

/**
 * Lista reordenável de verdade: a alça só avisa a intenção (arrastar ou mover
 * pelo teclado); quem decide o que a ordem significa é esta página.
 */
export const ListaReordenavel: Story = () => {
  const [itens, setItens] = useState(ITENS_INICIAIS);

  const mover = (de: number, para: number) => {
    if (para < 0 || para >= itens.length) return;
    const novos = [...itens];
    const [movido] = novos.splice(de, 1);
    novos.splice(para, 0, movido);
    setItens(novos);
  };

  return (
    <ul className="w-80 rounded-xl border border-border-100">
      {itens.map((item, index) => (
        <li
          key={item}
          className="flex items-center gap-2 border-b border-border-100 px-3 py-3 last:border-b-0"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const origem = itens.indexOf(
              event.dataTransfer.getData('text/plain')
            );
            if (origem !== -1) mover(origem, index);
          }}
        >
          <DragHandleButton
            size="sm"
            aria-label={`Reordenar ${item}`}
            dragData={item}
            onMove={(direcao) => mover(index, index + direcao)}
          />
          <span className="text-sm text-text-800">{item}</span>
        </li>
      ))}
    </ul>
  );
};

export const Tamanhos: Story = () => (
  <div className="flex items-center gap-4">
    <DragHandleButton size="sm" aria-label="Reordenar (pequeno)" />
    <DragHandleButton size="md" aria-label="Reordenar (médio)" />
    <DragHandleButton aria-label="Reordenar (desabilitado)" disabled />
  </div>
);
