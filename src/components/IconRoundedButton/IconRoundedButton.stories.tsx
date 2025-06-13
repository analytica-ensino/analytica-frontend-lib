import type { Story } from '@ladle/react';
import { IconRoundedButton } from './IconRoundedButton';

// Ícones SVG para demonstração
const ChevronRightIcon = (
  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
    <path
      d="M6 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronLeftIcon = (
  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
    <path
      d="M10 4l-4 4 4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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

const EditIcon = (
  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
    <path
      d="M11.5 3.5l1 1-7 7H4v-1.5l7-7zM14 2.5a1 1 0 0 1 0 1.414L13.414 4.5l-1-1 .586-.586a1 1 0 0 1 1.414 0z"
      fill="currentColor"
    />
  </svg>
);

const CloseIcon = (
  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
    <path
      d="M4 4l8 8M12 4l-8 8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const PlayIcon = (
  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
    <path d="M5 3.5v9l6-4.5-6-4.5z" fill="currentColor" />
  </svg>
);

/**
 * Showcase principal: demonstração do IconRoundedButton
 */
export const AllIconRoundedButtons: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
    <h2 className="font-bold text-3xl text-text-900">IconRoundedButton</h2>
    <p className="text-text-700">
      Botão redondo simples para exibir apenas ícones. Ideal para navegação,
      controles e ações rápidas.
    </p>

    {/* Exemplos básicos */}
    <h3 className="font-bold text-2xl text-text-900">Exemplos de Uso</h3>
    <div className="flex flex-row gap-4 items-center">
      <IconRoundedButton icon={ChevronLeftIcon} />
      <IconRoundedButton icon={ChevronRightIcon} />
      <IconRoundedButton icon={PlusIcon} />
      <IconRoundedButton icon={EditIcon} />
      <IconRoundedButton icon={CloseIcon} />
      <IconRoundedButton icon={PlayIcon} />
    </div>

    <div className="flex flex-col gap-6">
      <div>
        <div className="font-medium text-text-900 mb-2">Navegação</div>
        <div className="flex flex-row gap-2 items-center">
          <IconRoundedButton icon={ChevronLeftIcon} title="Página anterior" />
          <span className="text-text-700 mx-2">Página 1 de 10</span>
          <IconRoundedButton icon={ChevronRightIcon} title="Próxima página" />
        </div>
      </div>
    </div>
  </div>
);
