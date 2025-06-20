import type { Story } from '@ladle/react';
import { useState } from 'react';
import Chips from './Chips';

/**
 * Showcase principal: todos os estados do Chips simplificado
 */
export const AllChips: Story = () => {
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  const toggleChip = (chipId: string) => {
    setSelectedChips((prev) =>
      prev.includes(chipId)
        ? prev.filter((id) => id !== chipId)
        : [...prev, chipId]
    );
  };

  const categories = [
    'React',
    'TypeScript',
    'JavaScript',
    'CSS',
    'HTML',
    'Node.js',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">Chips</h2>
      <p className="text-text-700">
        Componente <code>Chips</code>:
      </p>

      {/* Estados básicos */}
      <h3 className="font-bold text-2xl text-text-900">Estados Básicos</h3>
      <div className="flex flex-row gap-4 items-center">
        <div className="flex flex-col items-center gap-2">
          <Chips>Label</Chips>
          <span className="text-xs text-text-600">Default</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Chips selected>Label</Chips>
          <span className="text-xs text-text-600">Selected</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="font-bold text-lg text-text-900">Exemplo de uso:</h3>
        <p className="text-text-700 text-sm">
          Clique nos chips para selecioná-los/deselecioná-los.
        </p>
        <p className="text-text-600 text-xs">
          Selecionados:{' '}
          {selectedChips.length > 0 ? selectedChips.join(', ') : 'Nenhum'}
        </p>
        <div className="flex flex-row gap-3 flex-wrap">
          {categories.map((category) => (
            <Chips
              key={category}
              selected={selectedChips.includes(category)}
              onClick={() => toggleChip(category)}
            >
              {category}
            </Chips>
          ))}
        </div>
      </div>
    </div>
  );
};
