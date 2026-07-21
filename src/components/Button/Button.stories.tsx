import type { Story } from '@ladle/react';
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';
import { SignInIcon } from '@phosphor-icons/react/dist/csr/SignIn';
import Button, { ButtonPapole } from './Button';

const sizes = [
  'extra-small',
  'small',
  'medium',
  'large',
  'extra-large',
] as const;
const variants = ['solid', 'outline', 'link'] as const;
const actions = ['primary', 'positive', 'negative'] as const;

/**
 * Showcase principal: todas as combinações possíveis do Button
 */
export const AllButtons: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
    <h2 className="font-bold text-3xl text-text-900">Button</h2>
    <p className="text-text-700">
      Variações possíveis do componente <code>Button</code>:
    </p>

    {/* Tamanhos + variantes + actions */}
    <h3 className="font-bold text-2xl text-text-900">
      Tamanhos, Variantes e Actions
    </h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {sizes.map((size) => (
        <div key={size}>
          <div className="font-medium text-text-900 mb-2">{size}</div>
          <div className="flex flex-row gap-4 flex-wrap">
            {variants.map((variant) =>
              actions.map((action) => (
                <Button
                  key={variant + action}
                  size={size}
                  variant={variant}
                  action={action}
                >
                  {variant} {action}
                </Button>
              ))
            )}
          </div>
        </div>
      ))}
    </div>

    {/* Ícones à esquerda, direita e ambos */}
    <h3 className="font-bold text-2xl text-text-900">Com Ícones</h3>
    <div className="flex flex-col gap-4">
      <div>
        <div className="font-medium text-text-900 mb-2">Ícone à esquerda</div>
        <div className="flex flex-row gap-4">
          {variants.map((variant) => (
            <Button
              key={variant}
              variant={variant}
              className="my-4"
              iconLeft={<PlusIcon size={16} />}
            >
              Button
            </Button>
          ))}
        </div>
      </div>
      <div>
        <div className="font-medium text-text-900 mb-2">Ícone à direita</div>
        <div className="flex flex-row gap-4">
          {variants.map((variant) => (
            <Button
              key={variant}
              variant={variant}
              className="my-4"
              iconRight={<PlusIcon size={16} />}
            >
              Button
            </Button>
          ))}
        </div>
      </div>
    </div>

    {/* Desabilitado */}
    <h3 className="font-bold text-2xl text-text-900">Desabilitado</h3>
    <div className="flex flex-row gap-4 flex-wrap">
      {variants.map((variant) => (
        <Button key={variant} variant={variant} disabled>
          Disabled
        </Button>
      ))}
    </div>
  </div>
);

// Stories individuais para referência rápida
export const Solid: Story = () => (
  <div className="flex flex-row gap-4">
    {actions.map((action) => (
      <Button key={action} variant="solid" action={action}>
        Solid Button
      </Button>
    ))}
  </div>
);
export const Outline: Story = () => (
  <div className="flex flex-row gap-4">
    {actions.map((action) => (
      <Button key={action} variant="outline" action={action}>
        Outline Button
      </Button>
    ))}
  </div>
);
export const Link: Story = () => (
  <div className="flex flex-row gap-4">
    {actions.map((action) => (
      <Button key={action} variant="link" action={action}>
        Link Button
      </Button>
    ))}
  </div>
);
export const IconLeft: Story = () => (
  <div className="flex flex-row gap-4">
    {variants.map((variant) => (
      <Button key={variant} variant={variant} iconLeft={<PlusIcon size={16} />}>
        Ícone à esquerda
      </Button>
    ))}
  </div>
);
export const IconRight: Story = () => (
  <div className="flex flex-row gap-4">
    {variants.map((variant) => (
      <Button
        key={variant}
        variant={variant}
        iconRight={<PlusIcon size={16} />}
      >
        Ícone à direita
      </Button>
    ))}
  </div>
);
export const Disabled: Story = () => (
  <div className="flex flex-row gap-4">
    {actions.map((action) => (
      <Button key={action} variant="solid" action={action} disabled>
        Desabilitado
      </Button>
    ))}
  </div>
);

/**
 * ButtonPapole — variante default (solid) do botão do Papolê.
 * Renderizado sob o tema papolê; os estados hover/pressed/foco são
 * interativos (passe o mouse, clique e segure, ou use Tab).
 */
export const ButtonPapoleShowcase: Story = () => (
  <div
    data-theme="papole-light"
    className="flex flex-col gap-8 p-8 bg-background"
  >
    <p className="text-sm text-text-700">
      Interaja para ver os estados (hover / pressed / foco via Tab). Cada
      variante segue os tokens do tema papolê.
    </p>

    <div className="flex flex-col gap-3">
      <p className="text-sm font-bold uppercase text-text-900">Solid</p>
      <div className="flex flex-wrap items-center gap-6">
        <ButtonPapole>Entrar</ButtonPapole>
        <ButtonPapole iconLeft={<SignInIcon weight="bold" />}>
          Entrar
        </ButtonPapole>
        <ButtonPapole disabled>Entrar</ButtonPapole>
      </div>
    </div>

    <div className="flex flex-col gap-3">
      <p className="text-sm font-bold uppercase text-text-900">Outline</p>
      <div className="flex flex-wrap items-center gap-6">
        <ButtonPapole variant="outline">Entrar</ButtonPapole>
        <ButtonPapole variant="outline" iconLeft={<SignInIcon weight="bold" />}>
          Entrar
        </ButtonPapole>
        <ButtonPapole variant="outline" disabled>
          Entrar
        </ButtonPapole>
      </div>
    </div>

    <div className="flex flex-col gap-3">
      <p className="text-sm font-bold uppercase text-text-900">Link</p>
      <div className="flex flex-wrap items-center gap-6">
        <ButtonPapole variant="link">Entrar</ButtonPapole>
        <ButtonPapole variant="link" iconLeft={<SignInIcon weight="bold" />}>
          Entrar
        </ButtonPapole>
        <ButtonPapole variant="link" disabled>
          Entrar
        </ButtonPapole>
      </div>
    </div>

    <div className="flex flex-col gap-3">
      <p className="text-sm font-bold uppercase text-text-900">
        Tamanhos (xl / medium)
      </p>
      <div className="flex flex-wrap items-center gap-6">
        <ButtonPapole size="xl" iconLeft={<SignInIcon weight="bold" />}>
          Entrar
        </ButtonPapole>
        <ButtonPapole size="medium" iconLeft={<SignInIcon weight="bold" />}>
          Entrar
        </ButtonPapole>
      </div>
    </div>
  </div>
);
