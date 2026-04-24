import type { Story } from '@ladle/react';
import { ChangeEvent, ReactNode, useState } from 'react';
import { Buildings, IdentificationCard, MapPin, Phone } from 'phosphor-react';
import MaskedInput from './MaskedInput';
import { MASK_TYPE } from '../../utils/brazilianFormatters';

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="font-bold text-2xl text-text-900 mb-4">{children}</h3>
);

/**
 * Showcase principal: demonstra as 4 mascaras do MaskedInput + estados
 * e variantes reusados do Input subjacente.
 */
export const AllMaskedInputs: Story = () => {
  const [cnpj, setCnpj] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');

  const onChange =
    (setter: (value: string) => void) =>
    (event: ChangeEvent<HTMLInputElement>) =>
      setter(event.target.value);

  return (
    <div className="flex flex-col gap-8 max-w-[800px]">
      <div>
        <h2 className="font-bold text-3xl text-text-900">MaskedInput</h2>
        <p className="text-text-700 mt-2">
          Wrapper do <code>Input</code> com mascara progressiva aplicada
          automaticamente no <code>onChange</code>. Repassa todas as props
          visuais do Input.
        </p>
      </div>

      {/* Os 4 tipos de mascara interativos */}
      <div>
        <SectionTitle>
          Playground interativo — digite para ver a máscara
        </SectionTitle>
        <div className="flex flex-col gap-4">
          <MaskedInput
            label="CNPJ"
            mask={MASK_TYPE.CNPJ}
            placeholder="00.000.000/0000-00"
            helperText="Cap em 14 dígitos"
            value={cnpj}
            onChange={onChange(setCnpj)}
          />
          <MaskedInput
            label="CPF"
            mask={MASK_TYPE.CPF}
            placeholder="000.000.000-00"
            helperText="Cap em 11 dígitos"
            value={cpf}
            onChange={onChange(setCpf)}
          />
          <MaskedInput
            label="Telefone"
            mask={MASK_TYPE.PHONE}
            placeholder="(00) 00000-0000"
            helperText="Formato muda entre fixo (10) e celular (11 dígitos)"
            value={phone}
            onChange={onChange(setPhone)}
          />
          <MaskedInput
            label="CEP"
            mask={MASK_TYPE.CEP}
            placeholder="00000-000"
            helperText="Cap em 8 dígitos"
            value={cep}
            onChange={onChange(setCep)}
          />
        </div>
      </div>

      {/* Valores pre-preenchidos (demonstra idempotencia) */}
      <div>
        <SectionTitle>Valores pré-preenchidos (idempotência)</SectionTitle>
        <p className="text-text-700 mb-4">
          Passar o valor <em>cru</em> ou <em>já mascarado</em> produz o mesmo
          resultado — pode armazenar qualquer um no estado.
        </p>
        <div className="flex flex-col gap-4">
          <MaskedInput
            label="CNPJ (valor cru no state)"
            mask={MASK_TYPE.CNPJ}
            value="12345678000199"
            onChange={() => {}}
          />
          <MaskedInput
            label="CNPJ (valor já mascarado no state)"
            mask={MASK_TYPE.CNPJ}
            value="12.345.678/0001-99"
            onChange={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * As 4 mascaras exibidas lado a lado com valores ja preenchidos.
 */
export const AllMasksFilled: Story = () => (
  <div className="flex flex-col gap-4 max-w-md">
    <MaskedInput
      label="CNPJ"
      mask={MASK_TYPE.CNPJ}
      value="12345678000199"
      onChange={() => {}}
    />
    <MaskedInput
      label="CPF"
      mask={MASK_TYPE.CPF}
      value="12345678909"
      onChange={() => {}}
    />
    <MaskedInput
      label="Telefone (celular)"
      mask={MASK_TYPE.PHONE}
      value="11987654321"
      onChange={() => {}}
    />
    <MaskedInput
      label="Telefone (fixo)"
      mask={MASK_TYPE.PHONE}
      value="1133334444"
      onChange={() => {}}
    />
    <MaskedInput
      label="CEP"
      mask={MASK_TYPE.CEP}
      value="01310100"
      onChange={() => {}}
    />
  </div>
);

/**
 * Variantes do Input subjacente continuam funcionando.
 */
export const Variants: Story = () => (
  <div className="flex flex-col gap-6 max-w-md">
    <MaskedInput
      label="Outlined (default)"
      mask={MASK_TYPE.CNPJ}
      variant="outlined"
      placeholder="00.000.000/0000-00"
    />
    <MaskedInput
      label="Underlined"
      mask={MASK_TYPE.CNPJ}
      variant="underlined"
      placeholder="00.000.000/0000-00"
    />
    <MaskedInput
      label="Rounded"
      mask={MASK_TYPE.CNPJ}
      variant="rounded"
      placeholder="00.000.000/0000-00"
    />
  </div>
);

/**
 * Tamanhos.
 */
export const Sizes: Story = () => (
  <div className="flex flex-col gap-4 max-w-md">
    <MaskedInput
      label="Small"
      mask={MASK_TYPE.CPF}
      size="small"
      placeholder="000.000.000-00"
    />
    <MaskedInput
      label="Medium"
      mask={MASK_TYPE.CPF}
      size="medium"
      placeholder="000.000.000-00"
    />
    <MaskedInput
      label="Large"
      mask={MASK_TYPE.CPF}
      size="large"
      placeholder="000.000.000-00"
    />
    <MaskedInput
      label="Extra-large"
      mask={MASK_TYPE.CPF}
      size="extra-large"
      placeholder="000.000.000-00"
    />
  </div>
);

/**
 * Com icones a esquerda (util para identificar visualmente o tipo de dado).
 */
export const WithIcons: Story = () => (
  <div className="flex flex-col gap-4 max-w-md">
    <MaskedInput
      label="CNPJ"
      mask={MASK_TYPE.CNPJ}
      iconLeft={<Buildings />}
      placeholder="00.000.000/0000-00"
    />
    <MaskedInput
      label="CPF"
      mask={MASK_TYPE.CPF}
      iconLeft={<IdentificationCard />}
      placeholder="000.000.000-00"
    />
    <MaskedInput
      label="Telefone"
      mask={MASK_TYPE.PHONE}
      iconLeft={<Phone />}
      placeholder="(00) 00000-0000"
    />
    <MaskedInput
      label="CEP"
      mask={MASK_TYPE.CEP}
      iconLeft={<MapPin />}
      placeholder="00000-000"
    />
  </div>
);

/**
 * Estado de erro com mensagem.
 */
export const WithError: Story = () => (
  <div className="flex flex-col gap-4 max-w-md">
    <MaskedInput
      label="CNPJ"
      mask={MASK_TYPE.CNPJ}
      value="12345"
      errorMessage="CNPJ incompleto"
      onChange={() => {}}
    />
    <MaskedInput
      label="CPF"
      mask={MASK_TYPE.CPF}
      value="12345678900"
      errorMessage="CPF inválido"
      onChange={() => {}}
    />
  </div>
);

/**
 * Estados desabilitado e somente leitura com valores pre-preenchidos.
 */
export const DisabledAndReadOnly: Story = () => (
  <div className="flex flex-col gap-4 max-w-md">
    <MaskedInput
      label="Disabled — CNPJ"
      mask={MASK_TYPE.CNPJ}
      value="12345678000199"
      disabled
      onChange={() => {}}
    />
    <MaskedInput
      label="Read-only — CPF"
      mask={MASK_TYPE.CPF}
      value="12345678909"
      readOnly
      onChange={() => {}}
    />
  </div>
);
