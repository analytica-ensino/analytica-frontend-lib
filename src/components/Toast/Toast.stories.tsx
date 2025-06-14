import type { Story } from '@ladle/react';
import { Toast } from './Toast';

const variants = ['solid', 'outlined'] as const;
const actions = ['success', 'warning', 'info'] as const;

/**
 * Showcase principal: todas as combinações possíveis do Toast
 */
export const AllToasts: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
    <h2 className="font-bold text-3xl text-text-900">Toast</h2>
    <p className="text-text-700">
      Variações possíveis do componente <code>Toast</code>:
    </p>

    {/* Variantes + actions com descrição */}
    <h3 className="font-bold text-2xl text-text-900">Com descrição</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {variants.map((variant) => (
        <div key={variant}>
          <div className="font-medium text-text-900 mb-2">{variant}</div>
          <div className="flex flex-row gap-4 flex-wrap">
            {actions.map((action) => (
              <Toast
                key={variant + action}
                variant={variant}
                action={action}
                title={`Toast ${variant} ${action}`}
                description="Lorem ipsum dolor sit amet consectetur."
                onClose={() => console.log('close')}
              />
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* Variantes + actions sem descrição */}
    <h3 className="font-bold text-2xl text-text-900">Sem descrição</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {variants.map((variant) => (
        <div key={variant}>
          <div className="font-medium text-text-900 mb-2">{variant}</div>
          <div className="flex flex-row gap-4 flex-wrap">
            {actions.map((action) => (
              <Toast
                key={variant + action}
                variant={variant}
                action={action}
                title={`Toast ${variant} ${action}`}
                onClose={() => console.log('close')}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Stories individuais para referência rápida
export const SolidWithDescription: Story = () => (
  <div className="flex flex-col gap-4">
    {actions.map((action) => (
      <Toast
        key={action}
        variant="solid"
        action={action}
        title={`Solid ${action} Toast`}
        description="Esta é uma mensagem de descrição do toast."
        onClose={() => console.log('close')}
      />
    ))}
  </div>
);

export const SolidWithoutDescription: Story = () => (
  <div className="flex flex-col gap-4">
    {actions.map((action) => (
      <Toast
        key={action}
        variant="solid"
        action={action}
        title={`Solid ${action} Toast`}
        onClose={() => console.log('close')}
      />
    ))}
  </div>
);

export const OutlinedWithDescription: Story = () => (
  <div className="flex flex-col gap-4">
    {actions.map((action) => (
      <Toast
        key={action}
        variant="outlined"
        action={action}
        title={`Outlined ${action} Toast`}
        description="Esta é uma mensagem de descrição do toast."
        onClose={() => console.log('close')}
      />
    ))}
  </div>
);

export const OutlinedWithoutDescription: Story = () => (
  <div className="flex flex-col gap-4">
    {actions.map((action) => (
      <Toast
        key={action}
        variant="outlined"
        action={action}
        title={`Outlined ${action} Toast`}
        onClose={() => console.log('close')}
      />
    ))}
  </div>
);
