import type { Story } from '@ladle/react';
import Input from '../Input/Input';
import Text from '../Text/Text';
import { ReadOnlyField } from './ReadOnlyField';

/**
 * Bloco de dados cadastrais: o `<dl>` fica com o consumidor, cada campo é um
 * par `<dt>`/`<dd>`.
 */
export const Default: Story = () => (
  <div className="p-8">
    <Text size="md" weight="bold" className="text-text-950 pb-4">
      Informações cadastradas
    </Text>
    <Text as="dl" className="bg-background p-4 rounded-lg max-w-lg">
      <ReadOnlyField label="Nome" value="João Silva" />
      <ReadOnlyField label="E-mail" value="joao@example.com" />
    </Text>
  </div>
);

/**
 * Lado a lado com o `Input readOnly` que ele substitui: o desenho é o mesmo,
 * mas o da direita não é focável nem anunciado como campo editável.
 */
export const ComparedToReadOnlyInput: Story = () => (
  <div className="flex gap-12 p-8">
    <div className="flex-1 max-w-sm">
      <Text size="sm" weight="bold" className="text-text-950 pb-2">
        Input readOnly (focável)
      </Text>
      <div className="bg-background p-4 rounded-lg">
        <Input label="E-mail" defaultValue="joao@example.com" readOnly />
      </div>
    </div>
    <div className="flex-1 max-w-sm">
      <Text size="sm" weight="bold" className="text-text-950 pb-2">
        ReadOnlyField (só texto)
      </Text>
      <Text as="dl" className="bg-background p-4 rounded-lg">
        <ReadOnlyField label="E-mail" value="joao@example.com" />
      </Text>
    </div>
  </div>
);
