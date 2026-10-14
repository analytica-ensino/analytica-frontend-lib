import { useState } from 'react';
import type { Story } from '@ladle/react';
import { ModeToggleReadingFluency } from './ModeToggleReadingFluency';
import {
  BookIconReadingFluency,
  MathIconReadingFluency,
} from '../ReadingFluencyIcons';

type Mode = 'ler' | 'contar';

const OPTIONS = [
  { value: 'ler', label: 'Ler', icon: <BookIconReadingFluency /> },
  { value: 'contar', label: 'Contar', icon: <MathIconReadingFluency /> },
] as const;

/**
 * "MenuWeb" da arte: fica no centro do header da home no desktop. Clique ou use
 * as setas do teclado para trocar o modo.
 */
export const Inline: Story = () => {
  const [mode, setMode] = useState<Mode>('ler');
  return (
    <div
      data-theme="papole-aluno-light"
      className="flex min-h-[200px] items-center justify-center bg-secondary-700 p-8"
    >
      <ModeToggleReadingFluency
        aria-label="Modo do Papolê"
        options={OPTIONS}
        value={mode}
        onChange={setMode}
      />
    </div>
  );
};

/**
 * "Bottombar" da arte: flutua no rodapé da home no tablet e no celular, com o
 * ícone sobre o rótulo.
 */
export const Stacked: Story = () => {
  const [mode, setMode] = useState<Mode>('contar');
  return (
    <div
      data-theme="papole-aluno-light"
      className="flex min-h-[200px] items-center justify-center bg-secondary-700 p-8"
    >
      <ModeToggleReadingFluency
        aria-label="Modo do Papolê"
        layout="stacked"
        options={OPTIONS}
        value={mode}
        onChange={setMode}
      />
    </div>
  );
};
