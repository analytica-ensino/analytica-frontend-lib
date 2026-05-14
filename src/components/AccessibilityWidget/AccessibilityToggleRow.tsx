import type { ReactNode } from 'react';
import Text from '../Text/Text';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import { cn } from '../../utils/utils';

export interface AccessibilityToggleRowProps {
  /** Conteúdo principal da linha (texto ou JSX, ex.: trecho em Comic Sans). */
  label: ReactNode;
  /** Aria-label do row quando `label` é JSX e não pode ser usado como texto. */
  ariaLabel?: string;
  /** Texto auxiliar abaixo do label. */
  description?: string;
  checked: boolean;
  onChange: () => void;
  /** Testid no wrapper interativo (toda a linha). */
  rowTestId?: string;
  /** Testid no `<ToggleSwitch>` interno — usado pelos testes que ainda
   *  clicam diretamente no botão de switch. */
  switchTestId?: string;
}

/**
 * Linha clicável "label à esquerda + ToggleSwitch à direita" usada nos
 * accordions de Animação, Navegação, Atalho, dislexia e leitor de texto.
 *
 * O wrapper inteiro responde a click/Enter/Space; o `ToggleSwitch` interno
 * é apenas decorativo (`tabIndex={-1}`, `aria-hidden`) pra que toda a área
 * vire alvo de clique sem dupla-ativação do switch.
 */
export default function AccessibilityToggleRow({
  label,
  ariaLabel,
  description,
  checked,
  onChange,
  rowTestId,
  switchTestId,
}: Readonly<AccessibilityToggleRowProps>) {
  const computedAriaLabel =
    ariaLabel ?? (typeof label === 'string' ? label : undefined);
  return (
    <div
      role="switch"
      tabIndex={0}
      aria-checked={checked}
      aria-label={computedAriaLabel}
      data-testid={rowTestId}
      className={cn(
        'flex items-center justify-between gap-3 rounded-md py-1.5',
        'cursor-pointer transition-colors duration-150 hover:bg-background-100',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-info-500'
      )}
      onClick={onChange}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onChange();
        }
      }}
    >
      <div className="flex flex-col">
        <Text size="sm" className="text-text-900">
          {label}
        </Text>
        {description && (
          <Text size="2xs" className="text-text-600">
            {description}
          </Text>
        )}
      </div>
      <ToggleSwitch
        checked={checked}
        onChange={() => undefined}
        checkedColor="bg-info-600"
        data-testid={switchTestId}
        tabIndex={-1}
        aria-hidden
      />
    </div>
  );
}
