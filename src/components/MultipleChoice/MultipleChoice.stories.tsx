import type { Story } from '@ladle/react';
import { MultipleChoiceList } from './MultipleChoice';
import { useState } from 'react';

export const AllAlternativesShowcase: Story = () => {
  const [selectedValues, setSelectedValues] = useState(['a', 'c']);

  const choices = [
    {
      value: 'a',
      label:
        'Alternativa A - Esta é uma alternativa com texto mais longo para demonstrar o comportamento do componente',
      status: 'correct' as const,
    },
    {
      value: 'b',
      label: 'Alternativa B - Outra alternativa para teste',
      status: 'incorrect' as const,
    },
    {
      value: 'c',
      label: 'Alternativa C - Terceira opção disponível',
      status: 'correct' as const,
    },
    {
      value: 'd',
      label: 'Alternativa D - Quarta opção com descrição',
      status: 'incorrect' as const,
    },
    {
      value: 'e',
      label: 'Alternativa E - Quinta opção com descrição',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-900 mb-4">
          MultipleChoice Component Library
        </h1>
        <p className="text-text-600 text-lg">
          Componente de múltipla escolha para questões e formulários
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2">
          Modo Interativo
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">Layout Padrão</h3>
          <MultipleChoiceList
            choices={choices}
            selectedValues={selectedValues}
            onHandleSelectedValues={setSelectedValues}
            mode="interactive"
          />
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <p className="text-sm">
              <strong>Selecionados:</strong>{' '}
              {selectedValues.join(', ') || 'Nenhum'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2">
          Modo Readonly
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-text-800">
            Resultado do Usuário
          </h3>
          <MultipleChoiceList
            choices={choices}
            mode="readonly"
            selectedValues={['b', 'c']}
          />
        </div>
      </div>
    </div>
  );
};
