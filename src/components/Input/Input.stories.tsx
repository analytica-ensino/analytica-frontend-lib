import type { Story } from '@ladle/react';
import { Input } from './Input';
import {
  MagnifyingGlass,
  Eye,
  User,
  EnvelopeSimple,
  Phone,
  Lock,
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
          iconRight={<Lock />}
          helperText="Mínimo 8 caracteres"
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

// Stories individuais para casos específicos
export const BasicInput: Story = () => (
  <div style={{ maxWidth: 400 }}>
    <Input placeholder="Digite aqui..." />
  </div>
);

export const WithLabel: Story = () => (
  <div style={{ maxWidth: 400 }}>
    <Input
      label="Nome completo"
      placeholder="Digite seu nome completo"
      helperText="Como você gostaria de ser chamado"
    />
  </div>
);

export const WithError: Story = () => (
  <div style={{ maxWidth: 400 }}>
    <Input
      label="Email"
      placeholder="Digite seu email"
      value="email-inválido"
      errorMessage="Por favor, insira um email válido"
    />
  </div>
);

export const SmallSize: Story = () => (
  <div style={{ maxWidth: 400 }}>
    <Input
      size="small"
      label="Input pequeno"
      placeholder="Texto pequeno"
      helperText="Exemplo de input pequeno"
    />
  </div>
);

export const LargeSize: Story = () => (
  <div style={{ maxWidth: 400 }}>
    <Input
      size="large"
      label="Input grande"
      placeholder="Texto grande"
      helperText="Exemplo de input grande"
    />
  </div>
);

export const ExtraLargeSize: Story = () => (
  <div style={{ maxWidth: 400 }}>
    <Input
      size="extra-large"
      label="Input extra grande"
      placeholder="Texto extra grande"
      helperText="Exemplo de input extra grande"
    />
  </div>
);

export const OutlinedVariant: Story = () => (
  <div style={{ maxWidth: 400 }}>
    <Input
      variant="outlined"
      label="Input com borda"
      placeholder="Variante outlined"
      helperText="Input com borda tradicional"
    />
  </div>
);

export const UnderlinedVariant: Story = () => (
  <div style={{ maxWidth: 400 }}>
    <Input
      variant="underlined"
      label="Input sublinhado"
      placeholder="Variante underlined"
      helperText="Input apenas com borda inferior"
    />
  </div>
);

export const RoundedVariant: Story = () => (
  <div style={{ maxWidth: 400 }}>
    <Input
      variant="rounded"
      label="Input arredondado"
      placeholder="Variante rounded"
      helperText="Input com bordas completamente arredondadas"
    />
  </div>
);

export const WithLeftIcon: Story = () => (
  <div style={{ maxWidth: 400 }}>
    <Input
      label="Buscar"
      placeholder="Digite para buscar..."
      iconLeft={<MagnifyingGlass />}
      helperText="Use o ícone de busca"
    />
  </div>
);

export const WithRightIcon: Story = () => (
  <div style={{ maxWidth: 400 }}>
    <Input
      label="Senha"
      type="password"
      placeholder="Digite sua senha"
      iconRight={<Eye />}
      helperText="Clique no olho para mostrar/ocultar"
    />
  </div>
);

export const DisabledInput: Story = () => (
  <div style={{ maxWidth: 400 }}>
    <Input
      label="Campo desabilitado"
      placeholder="Este campo está desabilitado"
      disabled
      helperText="Este campo não pode ser editado"
    />
  </div>
);

export const ReadOnlyInput: Story = () => (
  <div style={{ maxWidth: 400 }}>
    <Input
      label="Campo somente leitura"
      value="Valor fixo"
      readOnly
      helperText="Este campo é somente para leitura"
    />
  </div>
);

export const LoginForm: Story = () => (
  <div
    style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 16 }}
  >
    <h3 className="font-bold text-xl text-text-900 mb-2">
      Formulário de Login
    </h3>
    <Input
      label="Email"
      type="email"
      placeholder="Digite seu email"
      iconLeft={<EnvelopeSimple />}
      helperText="Use seu email institucional"
    />
    <Input
      label="Senha"
      type="password"
      placeholder="Digite sua senha"
      iconRight={<Lock />}
      helperText="Mínimo 8 caracteres"
    />
  </div>
);

export const FormWithValidation: Story = () => (
  <div
    style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 16 }}
  >
    <h3 className="font-bold text-xl text-text-900 mb-2">
      Formulário com Validação
    </h3>
    <Input
      label="Nome completo"
      placeholder="Digite seu nome completo"
      helperText="Como você gostaria de ser chamado"
    />
    <Input
      label="Email"
      type="email"
      placeholder="Digite seu email"
      value="email-inválido"
      errorMessage="Por favor, insira um email válido"
    />
    <Input
      label="Telefone"
      type="tel"
      placeholder="(11) 99999-9999"
      helperText="Formato: (XX) XXXXX-XXXX"
    />
    <Input
      label="Data de nascimento"
      type="date"
      readOnly
      value="1990-01-01"
      helperText="Campo preenchido automaticamente"
    />
  </div>
);
