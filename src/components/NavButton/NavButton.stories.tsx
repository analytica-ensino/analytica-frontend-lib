import type { Story } from '@ladle/react';
import { useState } from 'react';
import { House, SquaresFour, Users, Gear, ChartBar } from 'phosphor-react';
import NavButton from './NavButton';

/**
 * Showcase principal: demonstração do NavButton para navegação
 */
export const AllNavButtons: Story = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activePage, setActivePage] = useState('home');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">NavButton</h2>
      <p className="text-text-700">
        Botão de navegação com ícone e texto para menus principais, sidebar e
        tabs. Ideal para navegação onde apenas uma opção pode estar ativa por
        vez.
      </p>

      {/* Estados básicos */}
      <h3 className="font-bold text-2xl text-text-900">Estados Básicos:</h3>
      <div className="flex flex-row gap-4 items-center">
        <NavButton icon={<House size={20} />} label="Default" />
        <NavButton
          icon={<House size={20} />}
          label="Selected"
          selected={true}
        />
      </div>

      {/* Exemplos de navegação */}
      <h3 className="font-bold text-2xl text-text-900">
        Exemplos de Navegação:
      </h3>

      <div className="flex flex-col gap-6">
        <div>
          <div className="font-medium text-text-900 mb-3">Menu Principal</div>
          <div className="flex flex-row gap-3 flex-wrap">
            <NavButton
              icon={<House size={20} />}
              label="Início"
              selected={activePage === 'home'}
              onClick={() => setActivePage('home')}
            />
            <NavButton
              icon={<SquaresFour size={20} />}
              label="Dashboard"
              selected={activePage === 'dashboard'}
              onClick={() => setActivePage('dashboard')}
            />
            <NavButton
              icon={<Users size={20} />}
              label="Usuários"
              selected={activePage === 'users'}
              onClick={() => setActivePage('users')}
            />
            <NavButton
              icon={<Gear size={20} />}
              label="Configurações"
              selected={activePage === 'settings'}
              onClick={() => setActivePage('settings')}
            />
          </div>
          <div className="text-sm text-text-600 mt-2">
            Página ativa: <strong>{activePage}</strong>
          </div>
        </div>

        <div>
          <div className="font-medium text-text-900 mb-3">Tabs de Seção</div>
          <div className="flex flex-row gap-3 flex-wrap">
            <NavButton
              icon={<SquaresFour size={20} />}
              label="Dashboard"
              selected={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
            />
            <NavButton
              icon={<ChartBar size={20} />}
              label="Analytics"
              selected={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
            />
            <NavButton
              icon={<Gear size={20} />}
              label="Relatórios"
              selected={activeTab === 'reports'}
              onClick={() => setActiveTab('reports')}
            />
          </div>
          <div className="text-sm text-text-600 mt-2">
            Tab ativa: <strong>{activeTab}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
