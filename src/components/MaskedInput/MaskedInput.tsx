import { ChangeEvent, ComponentProps, forwardRef } from 'react';
import Input from '../Input/Input';
import { MASK_TYPE, applyInputMask } from '../../utils/brazilianFormatters';

type InputProps = ComponentProps<typeof Input>;

/**
 * Props do MaskedInput.
 *
 * Extende todas as props do `Input` adicionando o `mask` que identifica o
 * tipo de mascara a aplicar (CNPJ, CPF, Telefone ou CEP).
 */
export type MaskedInputProps = {
  /** Tipo da mascara a ser aplicada */
  mask: MASK_TYPE;
} & InputProps;

/**
 * MaskedInput - wrapper do Input com mascara progressiva aplicada
 * automaticamente no onChange.
 *
 * O valor recebido pelo consumidor no `onChange` ja vem com a mascara aplicada.
 * Alem disso, se um `value` controlado for passado "cru" (sem mascara), o
 * componente formata para exibicao. Como as mascaras sao idempotentes,
 * repassar o valor mascarado tambem funciona.
 *
 * @example
 * ```tsx
 * <MaskedInput
 *   label="CNPJ"
 *   mask={MASK_TYPE.CNPJ}
 *   variant="rounded"
 *   placeholder="00.000.000/0000-00"
 *   value={cnpj}
 *   onChange={(e) => setCnpj(e.target.value)}
 * />
 * ```
 */
const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value, onChange, ...rest }, ref) => {
    const maskedValue =
      typeof value === 'string' ? applyInputMask(value, mask) : value;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      event.target.value = applyInputMask(event.target.value, mask);
      onChange?.(event);
    };

    return (
      <Input ref={ref} value={maskedValue} onChange={handleChange} {...rest} />
    );
  }
);

MaskedInput.displayName = 'MaskedInput';

export default MaskedInput;
