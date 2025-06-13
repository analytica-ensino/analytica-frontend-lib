import type { Story } from '@ladle/react';
import { CheckBox } from './CheckBox';

const sizes = ['small', 'medium', 'large'] as const;
const states = ['default', 'invalid', 'disabled'] as const;
const variants = ['primary', 'success', 'error', 'info', 'warning'] as const;

/**
 * Showcase principal: todas as combinações possíveis do CheckBox
 */
export const AllCheckBoxes: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
    <h2 className="font-bold text-3xl text-text-900">CheckBox</h2>
    <p className="text-text-700">
      Variações possíveis do componente <code>CheckBox</code>:
    </p>

    {/* Tamanhos e Estados */}
    <h3 className="font-bold text-2xl text-text-900">Tamanhos e Estados</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {sizes.map((size) => (
        <div key={size}>
          <div className="font-medium text-text-900 mb-4 capitalize">
            {size}
          </div>

          {/* Unchecked state */}
          <div className="mb-6">
            <div className="font-medium text-text-700 mb-2">Unchecked</div>
            <div className="flex flex-row gap-6 flex-wrap">
              {states.map((state) => (
                <CheckBox
                  key={`${size}-unchecked-${state}`}
                  size={size}
                  state={state}
                  label={`${state} unchecked`}
                  checked={false}
                  disabled={state === 'disabled'}
                />
              ))}
            </div>
          </div>

          {/* Checked state */}
          <div className="mb-6">
            <div className="font-medium text-text-700 mb-2">Checked</div>
            <div className="flex flex-row gap-6 flex-wrap">
              {states.map((state) => (
                <CheckBox
                  key={`${size}-checked-${state}`}
                  size={size}
                  state={state}
                  label={`${state} checked`}
                  checked={true}
                  disabled={state === 'disabled'}
                />
              ))}
            </div>
          </div>

          {/* Indeterminate state */}
          <div className="mb-6">
            <div className="font-medium text-text-700 mb-2">Indeterminate</div>
            <div className="flex flex-row gap-6 flex-wrap">
              {states.map((state) => (
                <CheckBox
                  key={`${size}-indeterminate-${state}`}
                  size={size}
                  state={state}
                  label={`${state} indeterminate`}
                  checked={false}
                  indeterminate={true}
                  disabled={state === 'disabled'}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Com mensagens de erro e ajuda */}
    <h3 className="font-bold text-2xl text-text-900">Com Mensagens</h3>
    <div className="flex flex-col gap-6">
      <div>
        <div className="font-medium text-text-900 mb-2">
          Com mensagem de erro
        </div>
        <CheckBox
          label="Aceito os termos e condições"
          state="invalid"
          errorMessage="Este campo é obrigatório"
        />
      </div>

      <div>
        <div className="font-medium text-text-900 mb-2">Com texto de ajuda</div>
        <CheckBox
          label="Receber notificações por email"
          helperText="Você pode alterar esta preferência a qualquer momento"
        />
      </div>
    </div>

    {/* Agrupamento */}
    <h3 className="font-bold text-2xl text-text-900">Agrupamento</h3>
    <div className="flex flex-col gap-4">
      <div>
        <div className="font-medium text-text-900 mb-3">
          Selecionar disciplinas:
        </div>
        <div className="flex flex-col gap-2 ml-4">
          <CheckBox label="Matemática" checked={true} />
          <CheckBox label="Português" checked={false} />
          <CheckBox label="História" checked={true} />
          <CheckBox label="Geografia" checked={false} />
        </div>
      </div>

      <div>
        <div className="font-medium text-text-900 mb-3">
          Seleção hierárquica:
        </div>
        <div className="flex flex-col gap-2">
          <CheckBox label="Selecionar todos" indeterminate={true} />
          <div className="flex flex-col gap-2 ml-6">
            <CheckBox label="Ensino Fundamental" checked={true} />
            <CheckBox label="Ensino Médio" checked={false} />
            <CheckBox label="Ensino Superior" checked={true} />
          </div>
        </div>
      </div>
    </div>

    {/* Variantes de cor */}
    <h3 className="font-bold text-2xl text-text-900">Variantes de Cor</h3>
    <div className="flex flex-col gap-4">
      <div>
        <div className="font-medium text-text-700 mb-2">Checked variants</div>
        <div className="flex flex-row gap-4 flex-wrap">
          {variants.map((variant) => (
            <CheckBox
              key={variant}
              variant={variant}
              label={`${variant} variant`}
              checked={true}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="font-medium text-text-700 mb-2">Unchecked variants</div>
        <div className="flex flex-row gap-4 flex-wrap">
          {variants.map((variant) => (
            <CheckBox
              key={variant}
              variant={variant}
              label={`${variant} variant`}
              checked={false}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="font-medium text-text-700 mb-2">
          Indeterminate variants
        </div>
        <div className="flex flex-row gap-4 flex-wrap">
          {variants.map((variant) => (
            <CheckBox
              key={variant}
              variant={variant}
              label={`${variant} indeterminate`}
              indeterminate={true}
            />
          ))}
        </div>
      </div>
    </div>

    {/* Sem rótulo */}
    <h3 className="font-bold text-2xl text-text-900">Sem Rótulo</h3>
    <div className="flex flex-row gap-4">
      <CheckBox checked={false} />
      <CheckBox checked={true} />
      <CheckBox indeterminate={true} />
    </div>
  </div>
);

/**
 * Tamanhos (modo não-controlado - clicáveis)
 */
export const Sizes: Story = () => (
  <div className="flex flex-row gap-6">
    {sizes.map((size) => (
      <CheckBox
        key={size}
        size={size}
        label={`${size.charAt(0).toUpperCase() + size.slice(1)} checkbox`}
      />
    ))}
  </div>
);

/**
 * Variantes de cor (modo não-controlado - clicáveis)
 */
export const ColorVariants: Story = () => (
  <div className="flex flex-col gap-6">
    <div>
      <h4 className="font-medium text-text-900 mb-3">
        Interactive variants (click to test)
      </h4>
      <div className="flex flex-row gap-4 flex-wrap">
        {variants.map((variant) => (
          <CheckBox
            key={variant}
            variant={variant}
            label={variant.charAt(0).toUpperCase() + variant.slice(1)}
          />
        ))}
      </div>
    </div>

    <div>
      <h4 className="font-medium text-text-900 mb-3">Pre-checked variants</h4>
      <div className="flex flex-row gap-4 flex-wrap">
        {variants.map((variant) => (
          <CheckBox
            key={`checked-${variant}`}
            variant={variant}
            label={variant.charAt(0).toUpperCase() + variant.slice(1)}
            checked={true}
            readOnly
          />
        ))}
      </div>
    </div>

    <div>
      <h4 className="font-medium text-text-900 mb-3">Indeterminate variants</h4>
      <div className="flex flex-row gap-4 flex-wrap">
        {variants.map((variant) => (
          <CheckBox
            key={`indeterminate-${variant}`}
            variant={variant}
            label={variant.charAt(0).toUpperCase() + variant.slice(1)}
            indeterminate={true}
            readOnly
          />
        ))}
      </div>
    </div>
  </div>
);

/**
 * Estados não marcados
 */
export const UncheckedStates: Story = () => (
  <div className="flex flex-col gap-4">
    {states.map((state) => (
      <CheckBox
        key={state}
        state={state}
        label={`${state.charAt(0).toUpperCase() + state.slice(1)} state`}
        checked={false}
        disabled={state === 'disabled'}
      />
    ))}
  </div>
);

/**
 * Estados marcados
 */
export const CheckedStates: Story = () => (
  <div className="flex flex-col gap-4">
    {states.map((state) => (
      <CheckBox
        key={state}
        state={state}
        label={`${state.charAt(0).toUpperCase() + state.slice(1)} state`}
        checked={true}
        disabled={state === 'disabled'}
      />
    ))}
  </div>
);

/**
 * Estados indeterminados
 */
export const IndeterminateStates: Story = () => (
  <div className="flex flex-col gap-4">
    {states.map((state) => (
      <CheckBox
        key={state}
        state={state}
        label={`${state.charAt(0).toUpperCase() + state.slice(1)} indeterminate`}
        checked={false}
        indeterminate={true}
        disabled={state === 'disabled'}
      />
    ))}
  </div>
);

/**
 * Com mensagens de erro
 */
export const WithErrorMessages: Story = () => (
  <div className="flex flex-col gap-4">
    <CheckBox
      label="Campo obrigatório"
      state="invalid"
      errorMessage="Este campo deve ser marcado"
    />
    <CheckBox
      label="Aceitar termos"
      state="invalid"
      errorMessage="Você deve aceitar os termos para continuar"
      checked={false}
    />
  </div>
);

/**
 * Com texto de ajuda
 */
export const WithHelperText: Story = () => (
  <div className="flex flex-col gap-4">
    <CheckBox
      label="Receber newsletter"
      helperText="Enviaremos atualizações semanais sobre novos cursos"
    />
    <CheckBox
      label="Habilitar notificações"
      helperText="Você pode alterar esta configuração no seu perfil"
      checked={true}
    />
  </div>
);

/**
 * Seleção hierárquica complexa
 */
export const HierarchicalSelection: Story = () => (
  <div className="flex flex-col gap-3">
    <div>
      <CheckBox label="Todas as matérias" indeterminate={true} />
      <div className="ml-6 mt-2 flex flex-col gap-2">
        <div>
          <CheckBox label="Ciências Exatas" checked={true} />
          <div className="ml-6 mt-1 flex flex-col gap-1">
            <CheckBox label="Matemática" checked={true} />
            <CheckBox label="Física" checked={true} />
            <CheckBox label="Química" checked={true} />
          </div>
        </div>
        <div>
          <CheckBox label="Ciências Humanas" indeterminate={true} />
          <div className="ml-6 mt-1 flex flex-col gap-1">
            <CheckBox label="História" checked={true} />
            <CheckBox label="Geografia" checked={false} />
            <CheckBox label="Filosofia" checked={false} />
          </div>
        </div>
        <div>
          <CheckBox label="Linguagens" checked={false} />
          <div className="ml-6 mt-1 flex flex-col gap-1">
            <CheckBox label="Português" checked={false} />
            <CheckBox label="Inglês" checked={false} />
            <CheckBox label="Literatura" checked={false} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Exemplo interativo simples
 */
export const InteractiveExample: Story = () => (
  <div className="flex flex-col gap-6">
    <div>
      <h4 className="font-medium text-text-900 mb-3">Clique para testar</h4>
      <p className="text-sm text-text-600 mb-4">
        Estes checkboxes são interativos - clique neles para ver a mudança de
        cor azul!
      </p>
      <div className="flex flex-col gap-3">
        <CheckBox label="Checkbox interativo 1" />
        <CheckBox label="Checkbox interativo 2" />
        <CheckBox label="Checkbox variant success" variant="success" />
        <CheckBox label="Checkbox variant error" variant="error" />
        <CheckBox label="Checkbox variant warning" variant="warning" />
      </div>
    </div>
  </div>
);

/**
 * Showcase de acessibilidade
 */
export const AccessibilityShowcase: Story = () => (
  <div className="flex flex-col gap-6">
    <div>
      <h4 className="font-medium text-text-900 mb-3">Navegação por teclado</h4>
      <p className="text-sm text-text-600 mb-4">
        Use Tab para navegar e Espaço para marcar/desmarcar
      </p>
      <div className="flex flex-col gap-2">
        <CheckBox label="Primeiro checkbox" />
        <CheckBox label="Segundo checkbox" />
        <CheckBox label="Terceiro checkbox" />
      </div>
    </div>

    <div>
      <h4 className="font-medium text-text-900 mb-3">Estados de foco</h4>
      <div className="flex flex-col gap-2">
        <CheckBox label="CheckBox normal" />
        <CheckBox label="CheckBox inválido" state="invalid" />
        <CheckBox label="CheckBox desabilitado" disabled />
      </div>
    </div>
  </div>
);
