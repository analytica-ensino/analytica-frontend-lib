import type { Story } from '@ladle/react';
import { ThemeToggle } from './ThemeToggle';

const sizes = ['sm', 'md', 'lg'] as const;
const variants = ['simple', 'detailed', 'buttons'] as const;

/**
 * Showcase principal: demonstração do ThemeToggle para alternância de temas
 */
export const AllThemeToggles: Story = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">ThemeToggle</h2>
      <p className="text-text-700">
        Componente para alternar entre temas light, dark e system. Oferece
        diferentes variantes de exibição e tamanhos. Integra com o hook useTheme
        para gerenciamento de estado.
      </p>

      {/* Variantes */}
      <section>
        <h3 className="font-bold text-2xl text-text-900 mb-4">Variantes:</h3>
        <div className="flex flex-col gap-6">
          <div>
            <h4 className="font-medium text-lg text-text-900 mb-2">Simple</h4>
            <p className="text-text-600 mb-3">
              Botão simples que alterna entre light e dark com um clique.
            </p>
            <ThemeToggle variant="simple" />
          </div>

          <div>
            <h4 className="font-medium text-lg text-text-900 mb-2">Detailed</h4>
            <p className="text-text-600 mb-3">
              Mostra o tema atual e permite seleção específica entre light, dark
              e system.
            </p>
            <ThemeToggle variant="detailed" />
          </div>

          <div>
            <h4 className="font-medium text-lg text-text-900 mb-2">Buttons</h4>
            <p className="text-text-600 mb-3">
              Três botões separados para seleção direta do tema.
            </p>
            <ThemeToggle variant="buttons" />
          </div>
        </div>
      </section>

      {/* Tamanhos */}
      <section>
        <h3 className="font-bold text-2xl text-text-900 mb-4">Tamanhos:</h3>
        <div className="flex flex-col gap-6">
          {sizes.map((size) => (
            <div key={size}>
              <h4 className="font-medium text-lg text-text-900 mb-2 capitalize">
                {size} (
                {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'})
              </h4>
              <div className="flex flex-row gap-4 flex-wrap">
                <ThemeToggle variant="simple" size={size} />
                <ThemeToggle variant="detailed" size={size} />
                <ThemeToggle variant="buttons" size={size} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customizações */}
      <section>
        <h3 className="font-bold text-2xl text-text-900 mb-4">
          Customizações:
        </h3>
        <div className="flex flex-col gap-6">
          <div>
            <h4 className="font-medium text-lg text-text-900 mb-2">
              Sem Ícones
            </h4>
            <div className="flex flex-row gap-4 flex-wrap">
              <ThemeToggle variant="simple" showIcons={false} />
              <ThemeToggle variant="detailed" showIcons={false} />
              <ThemeToggle variant="buttons" showIcons={false} />
            </div>
          </div>

          <div>
            <h4 className="font-medium text-lg text-text-900 mb-2">
              Sem Labels
            </h4>
            <div className="flex flex-row gap-4 flex-wrap">
              <ThemeToggle variant="simple" showLabels={false} />
              <ThemeToggle variant="detailed" showLabels={false} />
              <ThemeToggle variant="buttons" showLabels={false} />
            </div>
          </div>

          <div>
            <h4 className="font-medium text-lg text-text-900 mb-2">
              Conteúdo Customizado
            </h4>
            <div className="flex flex-row gap-4 flex-wrap">
              <ThemeToggle variant="simple">
                <span className="flex items-center gap-2">
                  <span>🎨</span>
                  <span>Alternar Tema</span>
                </span>
              </ThemeToggle>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/**
 * Demonstração básica do ThemeToggle
 */
export const Default: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-4 text-text-950">Basic Usage</h3>
      <div className="flex flex-col gap-4">
        <ThemeToggle variant="simple" />
        <ThemeToggle variant="detailed" />
        <ThemeToggle variant="buttons" />
      </div>
    </div>
  </div>
);

/**
 * Demonstração de tamanhos
 */
export const Sizes: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-6 text-text-950">
        ThemeToggle Sizes
      </h3>

      {sizes.map((size) => (
        <div key={size} className="mb-6">
          <h4 className="font-medium text-md mb-3 text-text-950 capitalize">
            {size} (
            {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'})
          </h4>
          <div className="flex items-center gap-6">
            <ThemeToggle variant="simple" size={size} />
            <ThemeToggle variant="detailed" size={size} />
            <ThemeToggle variant="buttons" size={size} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Demonstração de variantes
 */
export const Variants: Story = () => (
  <div className="flex flex-col gap-8 p-8">
    <div>
      <h3 className="text-lg font-semibold mb-6 text-text-950">
        ThemeToggle Variants
      </h3>

      {variants.map((variant) => (
        <div key={variant} className="mb-6">
          <h4 className="font-medium text-md mb-3 text-text-950 capitalize">
            {variant}
          </h4>
          <div className="flex items-center gap-6">
            <ThemeToggle variant={variant} size="sm" />
            <ThemeToggle variant={variant} size="md" />
            <ThemeToggle variant={variant} size="lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
