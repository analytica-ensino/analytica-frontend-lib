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
    <Code>{`<IconRoundedButton icon={<ChevronRightIcon />} />`}</Code>

    {/* Com handlers */}
    <h3 className="font-bold text-2xl text-text-900">Com Eventos</h3>
    <div className="flex flex-row gap-4 items-center">
      <IconRoundedButton
        icon={ChevronLeftIcon}
        onClick={() => alert('Anterior')}
        title="Anterior"
      />
      <IconRoundedButton
        icon={ChevronRightIcon}
        onClick={() => alert('Próximo')}
        title="Próximo"
      />
      <IconRoundedButton
        icon={PlusIcon}
        onClick={() => alert('Adicionar')}
        title="Adicionar"
      />
      <IconRoundedButton
        icon={EditIcon}
        onClick={() => alert('Editar')}
        title="Editar"
      />
    </div>
    <Code>{`<IconRoundedButton 
  icon={<ChevronRightIcon />} 
  onClick={() => alert('Próximo')}
  title="Próximo"
/>`}</Code>

    {/* Estados */}
    <h3 className="font-bold text-2xl text-text-900">Estados</h3>
    <div className="flex flex-col gap-4">
      <div>
        <div className="font-medium text-text-900 mb-2">Normal</div>
        <div className="flex flex-row gap-4">
          <IconRoundedButton icon={ChevronRightIcon} />
          <IconRoundedButton icon={PlusIcon} />
          <IconRoundedButton icon={EditIcon} />
        </div>
      </div>
      <div>
        <div className="font-medium text-text-900 mb-2">Desabilitado</div>
        <div className="flex flex-row gap-4">
          <IconRoundedButton icon={ChevronRightIcon} disabled />
          <IconRoundedButton icon={PlusIcon} disabled />
          <IconRoundedButton icon={EditIcon} disabled />
        </div>
      </div>
    </div>
    <Code>{`<IconRoundedButton icon={<ChevronRightIcon />} disabled />`}</Code>

    {/* Casos de uso */}
    <h3 className="font-bold text-2xl text-text-900">Casos de Uso</h3>
    <div className="flex flex-col gap-6">
      <div>
        <div className="font-medium text-text-900 mb-2">Navegação</div>
        <div className="flex flex-row gap-2 items-center">
          <IconRoundedButton icon={ChevronLeftIcon} title="Página anterior" />
          <span className="text-text-700 mx-2">Página 1 de 10</span>
          <IconRoundedButton icon={ChevronRightIcon} title="Próxima página" />
        </div>
      </div>
      <div>
        <div className="font-medium text-text-900 mb-2">Controles de Mídia</div>
        <div className="flex flex-row gap-2 items-center">
          <IconRoundedButton icon={PlayIcon} title="Reproduzir" />
          <IconRoundedButton icon={PlusIcon} title="Adicionar à playlist" />
        </div>
      </div>
      <div>
        <div className="font-medium text-text-900 mb-2">Ações Rápidas</div>
        <div className="flex flex-row gap-2 items-center">
          <IconRoundedButton icon={EditIcon} title="Editar" />
          <IconRoundedButton icon={CloseIcon} title="Fechar" />
        </div>
      </div>
    </div>
  </div>
);

// Stories individuais para referência rápida
export const Navigation: Story = () => (
  <div className="flex flex-row gap-2 items-center">
    <IconRoundedButton
      icon={ChevronLeftIcon}
      onClick={() => alert('Anterior')}
    />
    <span className="text-text-700 mx-2">Página 1 de 10</span>
    <IconRoundedButton
      icon={ChevronRightIcon}
      onClick={() => alert('Próximo')}
    />
  </div>
);

export const Actions: Story = () => (
  <div className="flex flex-row gap-4">
    <IconRoundedButton icon={PlusIcon} onClick={() => alert('Adicionar')} />
    <IconRoundedButton icon={EditIcon} onClick={() => alert('Editar')} />
    <IconRoundedButton icon={CloseIcon} onClick={() => alert('Fechar')} />
  </div>
);

export const MediaControls: Story = () => (
  <div className="flex flex-row gap-2 items-center">
    <IconRoundedButton icon={PlayIcon} onClick={() => alert('Play')} />
    <IconRoundedButton icon={PlusIcon} onClick={() => alert('Adicionar')} />
  </div>
);

export const Disabled: Story = () => (
  <div className="flex flex-row gap-4">
    <IconRoundedButton icon={ChevronLeftIcon} disabled />
    <IconRoundedButton icon={ChevronRightIcon} disabled />
    <IconRoundedButton icon={PlusIcon} disabled />
    <IconRoundedButton icon={EditIcon} disabled />
  </div>
);
