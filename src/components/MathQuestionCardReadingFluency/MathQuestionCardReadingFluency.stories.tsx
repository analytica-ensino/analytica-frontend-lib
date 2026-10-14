import { useState } from 'react';
import type { Story } from '@ladle/react';
import { MathQuestionCardReadingFluency } from './MathQuestionCardReadingFluency';

/**
 * Questão do modo CONTAR com três alternativas de texto, sobre o fundo verde
 * claro do cenário "festa". Clique numa alternativa para selecioná-la.
 */
export const TresAlternativas: Story = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return (
    <div
      data-theme="papole-aluno-light"
      className="flex min-h-[480px] items-center justify-center bg-[#def4e4] p-8"
    >
      <MathQuestionCardReadingFluency
        statement="Ana ganhou 10 brigadeiros e depois mais 6. Quantos brigadeiros ela tem agora?"
        imageUrl="https://placehold.co/260x100/fcfbf8/312c16?text=10+%2B+6"
        imageAlt="10 brigadeiros mais 6 brigadeiros"
        alternatives={[
          { id: 'a', text: '16' },
          { id: 'b', text: '15' },
          { id: 'c', text: '60' },
        ]}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
    </div>
  );
};

/** Questão do 1º ano: duas alternativas, sem ilustração no enunciado. */
export const DuasAlternativas: Story = () => {
  const [selectedId, setSelectedId] = useState<string | null>('b');
  return (
    <div
      data-theme="papole-aluno-light"
      className="flex min-h-[360px] items-center justify-center bg-[#3561a8] p-8"
    >
      <MathQuestionCardReadingFluency
        statement="Qual é mais pesado?"
        alternatives={[
          { id: 'a', text: 'Rato' },
          { id: 'b', text: 'Elefante' },
        ]}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
    </div>
  );
};
