import type { Story } from '@ladle/react';
import Input from './Input';
import {
  MagnifyingGlass,
  Eye,
  User,
  EnvelopeSimple,
  Phone,
} from 'phosphor-react';

const sizes = ['small', 'medium', 'large', 'extra-large'] as const;
const variants = ['outlined', 'underlined', 'rounded'] as const;

/**
 * Showcase principal: todas as variações possíveis do Input
 */
export const AllInputs: Story = () => (
  <div
    style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 800 }}
  >
    <h2 className="font-bold text-3xl text-text-900">Input</h2>
    <p className="text-text-700">
      Variações possíveis do componente <code>Input</code>:
    </p>

    {/* Tamanhos */}
    <div>
      <h3 className="font-bold text-2xl text-text-900 mb-4">Tamanhos:</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sizes.map((size) => (
          <Input
            key={size}
            size={size}
            label={`Tamanho ${size}`}
            placeholder={`Input ${size}`}
            helperText={`Exemplo do tamanho ${size}`}
          />
        ))}
      </div>
    </div>

    {/* Variantes */}
    <div>
      <h3 className="font-bold text-2xl text-text-900 mb-4">Variantes:</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {variants.map((variant) => (
          <Input
            key={variant}
            variant={variant}
            label={`Variante ${variant}`}
            placeholder={`Input ${variant}`}
            helperText={`Exemplo da variante ${variant}`}
          />
        ))}
      </div>
    </div>

    {/* Estados */}
    <div>
      <h3 className="font-bold text-2xl text-text-900 mb-4">Estados:</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Estado padrão"
          placeholder="Digite aqui..."
          helperText="Campo em estado normal"
        />
        <Input
          label="Estado de erro"
          placeholder="Digite aqui..."
          value="Valor inválido"
          helperText="Campo em estado de erro"
          errorMessage="Este valor não é válido"
        />
        <Input
          label="Estado desabilitado"
          placeholder="Campo desabilitado"
          disabled
          helperText="Este campo está desabilitado"
        />
        <Input
          label="Estado somente leitura"
          value="Valor fixo"
          readOnly
          helperText="Este campo é somente para leitura"
        />
      </div>
    </div>

    {/* Com ícones */}
    <div>
      <h3 className="font-bold text-2xl text-text-900 mb-4">Com Ícones:</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Ícone à esquerda"
          placeholder="Digite para buscar..."
          iconLeft={<MagnifyingGlass />}
          helperText="Use o ícone de busca"
        />
        <Input
          label="Ícone à direita"
          type="password"
          placeholder="Digite sua senha"
          iconRight={<Eye />}
          helperText="Clique no olho para mostrar/ocultar"
        />
        <Input
          label="Ícones em ambos os lados"
          placeholder="Digite seu nome de usuário"
          iconLeft={<User />}
          iconRight={<MagnifyingGlass />}
          helperText="Ícones em ambos os lados"
        />
      </div>
    </div>

    {/* Tipos de input */}
    <div>
      <h3 className="font-bold text-2xl text-text-900 mb-4">Tipos de Input:</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Email"
          type="email"
          placeholder="exemplo@email.com"
          iconLeft={<EnvelopeSimple />}
          helperText="Insira um endereço de email válido"
        />
        <Input
          label="Senha"
          type="password"
          placeholder="Digite sua senha"
          helperText="Mínimo 8 caracteres (clique no olho para mostrar/ocultar)"
        />
        <Input
          label="Número"
          type="number"
          placeholder="25"
          helperText="Digite sua idade em anos"
        />
        <Input
          label="Telefone"
          type="tel"
          placeholder="(11) 99999-9999"
          iconLeft={<Phone />}
          helperText="Formato: (XX) XXXXX-XXXX"
        />
      </div>
    </div>
  </div>
);

export const OutlinedVariant: Story = () => (
  <div className="flex flex-col gap-6 max-w-md">
    <Input
      variant="outlined"
      placeholder="Variante outlined"
      helperText="Input padrão"
    />
    <Input
      variant="outlined"
      placeholder="Variante outlined"
      helperText="Input com erro"
      state="error"
      errorMessage="Este valor não é válido"
    />
    <Input
      variant="outlined"
      placeholder="Variante outlined"
      helperText="Input desabilitado"
      disabled
    />
  </div>
);

export const UnderlinedVariant: Story = () => (
  <div className="flex flex-col gap-6 max-w-md">
    <Input
      variant="underlined"
      placeholder="Variante underlined"
      helperText="Input padrão"
    />
    <Input
      variant="underlined"
      placeholder="Variante underlined"
      helperText="Input com erro"
      state="error"
      errorMessage="Este valor não é válido"
    />
    <Input
      variant="underlined"
      placeholder="Variante underlined"
      helperText="Input desabilitado"
      disabled
    />
  </div>
);

export const RoundedVariant: Story = () => (
  <div className="flex flex-col gap-6 max-w-md">
    <Input
      variant="rounded"
      placeholder="Variante rounded"
      helperText="Input padrão"
    />
    <Input
      variant="rounded"
      placeholder="Variante rounded"
      helperText="Input com erro"
      state="error"
      errorMessage="Este valor não é válido"
    />
    <Input
      variant="rounded"
      placeholder="Variante rounded"
      helperText="Input desabilitado"
      disabled
    />
  </div>
);
