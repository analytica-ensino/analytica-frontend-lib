import type { Story } from '@ladle/react';
import { Button } from './Button';
import React from 'react';

// Ícone SVG simples para demonstração
const PlusIcon = (
  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
    <path
      d="M8 3.5v9M3.5 8h9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const sizes = [
  'extra-small',
  'small',
  'medium',
  'large',
  'extra-large',
] as const;
const variants = ['solid', 'outline', 'link'] as const;
const actions = ['primary', 'positive', 'negative'] as const;

// Utilitário para exibir código formatado
const Code = ({ children }: { children: string }) => (
  <pre
    style={{
      background: '#f5f5f5',
      padding: 12,
      borderRadius: 8,
      fontSize: 13,
      overflowX: 'auto',
    }}
  >
    <code>{children}</code>
  </pre>
);

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
    <Code>{`<Button size="large" variant="solid" action="primary">Texto</Button>`}</Code>

    {/* Ícones à esquerda, direita e ambos */}
    <h3 className="font-bold text-2xl text-text-900">Com Ícones</h3>
    <div className="flex flex-col gap-4">
      <div>
        <div className="font-medium text-text-900 mb-2">Ícone à esquerda</div>
        <div className="flex flex-row gap-4">
          <Button variant="solid" className="my-4" iconLeft={PlusIcon}>
            Button
          </Button>
          <Button variant="outline" className="my-4" iconLeft={PlusIcon}>
            Button
          </Button>
          <Button variant="link" className="my-4" iconLeft={PlusIcon}>
            Button
          </Button>
        </div>
        <Code>{`<Button iconLeft={<PlusIcon />}>Button</Button>`}</Code>
      </div>
      <div>
        <div className="font-medium text-text-900 mb-2">Ícone à direita</div>
        <div className="flex flex-row gap-4">
          <Button variant="solid" className="my-4" iconRight={PlusIcon}>
            Button
          </Button>
          <Button variant="outline" className="my-4" iconRight={PlusIcon}>
            Button
          </Button>
          <Button variant="link" className="my-4" iconRight={PlusIcon}>
            Button
          </Button>
        </div>
        <Code>{`<Button iconRight={<PlusIcon />}>Button</Button>`}</Code>
      </div>
    </div>

    {/* Desabilitado */}
    <h3 className="font-bold text-2xl text-text-900">Desabilitado</h3>
    <div className="flex flex-row gap-4 flex-wrap">
      {variants.map((variant) => (
        <Button key={variant} variant={variant} disabled>
          {variant} disabled
        </Button>
      ))}
    </div>
    <Code>{`<Button variant="solid" disabled>Solid disabled</Button>`}</Code>
  </div>
);

// Stories individuais para referência rápida
export const Solid: Story = () => (
  <div className="flex flex-row gap-4">
    <Button variant="solid" action="primary">
      Solid Button
    </Button>
    <Button variant="solid" action="positive">
      Solid Button
    </Button>
    <Button variant="solid" action="negative">
      Solid Button
    </Button>
  </div>
);
export const Outline: Story = () => (
  <div className="flex flex-row gap-4">
    <Button variant="outline" action="primary">
      Outline Button
    </Button>
    <Button variant="outline" action="positive">
      Outline Button
    </Button>
    <Button variant="outline" action="negative">
      Outline Button
    </Button>
  </div>
);
export const Link: Story = () => (
  <div className="flex flex-row gap-4">
    <Button variant="link" action="primary">
      Link Button
    </Button>
    <Button variant="link" action="positive">
      Link Button
    </Button>
    <Button variant="link" action="negative">
      Link Button
    </Button>
  </div>
);
export const IconLeft: Story = () => (
  <div className="flex flex-row gap-4">
    <Button variant="solid" iconLeft={PlusIcon}>
      Ícone à esquerda
    </Button>
    <Button variant="outline" iconLeft={PlusIcon}>
      Ícone à esquerda
    </Button>
    <Button variant="link" iconLeft={PlusIcon}>
      Ícone à esquerda
    </Button>
  </div>
);
export const IconRight: Story = () => (
  <div className="flex flex-row gap-4">
    <Button variant="solid" iconRight={PlusIcon}>
      Ícone à direita
    </Button>
    <Button variant="outline" iconRight={PlusIcon}>
      Ícone à direita
    </Button>
    <Button variant="link" iconRight={PlusIcon}>
      Ícone à direita
    </Button>
  </div>
);
export const Disabled: Story = () => (
  <div className="flex flex-row gap-4">
    <Button variant="solid" action="primary" disabled>
      Desabilitado
    </Button>
    <Button variant="solid" action="positive" disabled>
      Desabilitado
    </Button>
    <Button variant="solid" action="negative" disabled>
      Desabilitado
    </Button>
  </div>
);
