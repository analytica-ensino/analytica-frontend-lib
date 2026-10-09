import type { Story } from '@ladle/react';
import { useState } from 'react';
import { SquaresFourIcon } from '@phosphor-icons/react/dist/csr/SquaresFour';
import { ChatCircleDotsIcon } from '@phosphor-icons/react/dist/csr/ChatCircleDots';
import { GearIcon } from '@phosphor-icons/react/dist/csr/Gear';
import { SidebarMenuItem } from './SidebarMenuItem';

/**
 * Showcase principal: as quatro combinações de Tipo × Estado do Figma
 * ("Componentes – Suporte" → Menu lateral / Item).
 */
export const AllSidebarMenuItems: Story = () => (
  <div className="flex flex-col gap-8 max-w-md">
    <div>
      <h2 className="font-bold text-3xl text-text-900">SidebarMenuItem</h2>
      <p className="text-text-700">
        Item do menu lateral do SAC. Tipo <code>main</code> leva ícone e pílula
        laranja de contagem; tipo <code>sub</code> é recuado e mostra a contagem
        como texto.
      </p>
    </div>

    <section className="flex flex-col gap-2 p-2 rounded-xl border border-border-200">
      <SidebarMenuItem
        icon={<SquaresFourIcon size={20} />}
        label="Dashboard"
        count={4}
      />
      <SidebarMenuItem
        icon={<SquaresFourIcon size={20} />}
        label="Dashboard"
        count={4}
        active
      />
      <SidebarMenuItem label="Dashboard" variant="sub" count={4} />
      <SidebarMenuItem label="Dashboard" variant="sub" count={4} active />
    </section>
  </div>
);

/**
 * `activeTone="theme"` (padrão) acompanha a cor primária do tema do cliente;
 * `activeTone="info"` trava o azul do Figma.
 */
export const ActiveTones: Story = () => (
  <div className="flex flex-col gap-6 max-w-md">
    <div className="flex flex-col gap-2">
      <h3 className="font-bold text-xl text-text-900">theme (padrão)</h3>
      <SidebarMenuItem
        icon={<SquaresFourIcon size={20} />}
        label="Dashboard"
        count={4}
        active
      />
      <SidebarMenuItem label="Meus chamados" variant="sub" count={4} active />
    </div>

    <div className="flex flex-col gap-2">
      <h3 className="font-bold text-xl text-text-900">info</h3>
      <SidebarMenuItem
        icon={<SquaresFourIcon size={20} />}
        label="Dashboard"
        count={4}
        active
        activeTone="info"
      />
      <SidebarMenuItem
        label="Meus chamados"
        variant="sub"
        count={4}
        active
        activeTone="info"
      />
    </div>
  </div>
);

/**
 * `md` (padrão) é o tamanho do Figma; `sm` é compacto. O recuo do sub
 * acompanha o tamanho, então os dois níveis continuam alinhados.
 */
export const Sizes: Story = () => (
  <div className="flex flex-row gap-8">
    {(['md', 'sm'] as const).map((size) => (
      <div key={size} className="flex flex-col gap-2 w-72">
        <h3 className="font-bold text-xl text-text-900">
          {size}
          {size === 'md' && ' (padrão)'}
        </h3>
        <SidebarMenuItem
          icon={<SquaresFourIcon size={20} />}
          label="Dashboard"
          count={4}
          size={size}
        />
        <SidebarMenuItem
          icon={<SquaresFourIcon size={20} />}
          label="Dashboard"
          count={4}
          size={size}
          active
        />
        <SidebarMenuItem
          label="Dashboard"
          variant="sub"
          count={4}
          size={size}
        />
        <SidebarMenuItem
          label="Dashboard"
          variant="sub"
          count={4}
          size={size}
          active
        />
      </div>
    ))}
  </div>
);

/** Sem contagem, contagem zero e item desabilitado. */
export const EdgeCases: Story = () => (
  <div className="flex flex-col gap-2 max-w-md">
    <SidebarMenuItem icon={<GearIcon size={20} />} label="Configurações" />
    <SidebarMenuItem
      icon={<ChatCircleDotsIcon size={20} />}
      label="Chamados"
      count={0}
    />
    <SidebarMenuItem
      icon={<ChatCircleDotsIcon size={20} />}
      label="Chamados arquivados"
      count={12}
      disabled
    />
    <SidebarMenuItem
      label="Rótulo bem longo que não cabe na largura do menu lateral"
      variant="sub"
      count={999}
    />
  </div>
);

const MENU = [
  { id: 'dashboard', label: 'Dashboard', icon: SquaresFourIcon, count: 4 },
  { id: 'chamados', label: 'Chamados', icon: ChatCircleDotsIcon, count: 12 },
  { id: 'config', label: 'Configurações', icon: GearIcon },
];

const SUBMENU = [
  { id: 'abertos', label: 'Abertos', count: 8 },
  { id: 'em-andamento', label: 'Em andamento', count: 3 },
  { id: 'resolvidos', label: 'Resolvidos', count: 1 },
];

/** Menu navegável: o consumidor controla o item ativo. */
export const Navegavel: Story = () => {
  const [selected, setSelected] = useState('abertos');

  return (
    <nav className="flex flex-col gap-1 p-2 w-72 rounded-xl bg-background border border-border-200">
      {MENU.map(({ id, label, icon: Icon, count }) => (
        <div key={id} className="flex flex-col gap-1">
          <SidebarMenuItem
            icon={<Icon size={20} />}
            label={label}
            count={count}
            active={selected === id}
            onClick={() => setSelected(id)}
          />
          {id === 'chamados' &&
            SUBMENU.map((sub) => (
              <SidebarMenuItem
                key={sub.id}
                variant="sub"
                label={sub.label}
                count={sub.count}
                active={selected === sub.id}
                onClick={() => setSelected(sub.id)}
              />
            ))}
        </div>
      ))}
    </nav>
  );
};
