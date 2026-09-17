import { ReactNode } from 'react';
import Text from '../Text/Text';

export interface ReadOnlyFieldProps {
  /** Nome do dado, ex.: "E-mail". */
  label: ReactNode;
  /** Valor cadastrado. */
  value: ReactNode;
}

/**
 * Par rótulo/valor de um dado que o usuário só pode ler.
 *
 * Existe porque a alternativa em uso era um `<Input readOnly>`: visualmente já
 * é texto puro (o estado read-only do Input zera borda, fundo e padding), mas
 * continua sendo um campo de formulário — focável, anunciado pelo leitor de
 * tela como área de edição e alcançado pelo cursor do VoiceOver, que desenha
 * sua moldura em volta. Quem usa o leitor tenta interagir com algo que não
 * aceita interação nenhuma.
 *
 * Renderiza um par `<dt>`/`<dd>` e **precisa estar dentro de um `<dl>`** — é o
 * que dá a associação programática entre o rótulo e o valor, para que o dado
 * não dependa da ordem na tela para ser entendido.
 *
 * Não envolve o par num elemento próprio de propósito: `<div>` entre o `<dl>`
 * e os `<dt>`/`<dd>` é HTML válido, mas o suporte das tecnologias assistivas a
 * esse agrupamento é menos consistente do que o do par direto.
 *
 * @example
 * ```tsx
 * <Text as="dl" className="bg-background p-4 rounded-lg">
 *   <ReadOnlyField label="Nome" value={user.name} />
 *   <ReadOnlyField label="E-mail" value={user.email} />
 * </Text>
 * ```
 */
export const ReadOnlyField = ({ label, value }: ReadOnlyFieldProps) => (
  <>
    {/* Espelha o label e o valor do Input read-only, para a troca não mexer
        em pixel nenhum na tela. */}
    <Text
      as="dt"
      size="md"
      weight="bold"
      color="text-text-900"
      className="mb-1.5"
    >
      {label}
    </Text>
    <Text
      as="dd"
      size="md"
      weight="normal"
      color="text-text-600"
      className="py-2"
    >
      {value}
    </Text>
  </>
);

export default ReadOnlyField;
