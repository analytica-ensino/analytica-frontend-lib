import type { Story } from '@ladle/react';
import { useState } from 'react';
import Tab, { TabItem } from './Tab';

/**
 * Sample tab data for stories
 */
const defaultTabs: TabItem[] = [
  { id: 'create', label: 'Criar Simulado', mobileLabel: 'Criar' },
  { id: 'history', label: 'Histórico', mobileLabel: 'Histórico' },
];

const threeTabs: TabItem[] = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'results', label: 'Resultados' },
  { id: 'analytics', label: 'Análises' },
];

const fourTabs: TabItem[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'simulados', label: 'Simulados' },
  { id: 'questoes', label: 'Questões' },
  { id: 'configuracoes', label: 'Configurações' },
];

const fiveTabsWithDisabled: TabItem[] = [
  { id: 'home', label: 'Início' },
  { id: 'simulados', label: 'Simulados' },
  { id: 'questoes', label: 'Questões' },
  { id: 'premium', label: 'Premium', disabled: true },
  { id: 'perfil', label: 'Perfil' },
];

/**
 * Complete showcase of all Tab variations
 */
export const AllTabsShowcase: Story = () => {
  const [activeTab1, setActiveTab1] = useState('create');
  const [activeTab2, setActiveTab2] = useState('overview');
  const [activeTab3, setActiveTab3] = useState('dashboard');
  const [activeTab4, setActiveTab4] = useState('home');

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-900 mb-4">
          Tab Components Library
        </h1>
        <p className="text-text-600 text-lg">
          Biblioteca completa de componentes Tab para a plataforma Analytica
        </p>
      </div>
      {/* ===== QUANTIDADE DE TABS ===== */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-900 mb-2">
            Diferentes Quantidades de Tabs
          </h2>
          <p className="text-text-600">
            O componente se adapta automaticamente ao número de tabs
          </p>
        </div>

        <div className="space-y-6">
          {/* 2 Tabs */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-900">2 Tabs</h3>
            <Tab
              tabs={defaultTabs}
              activeTab={activeTab1}
              onTabChange={setActiveTab1}
            />
          </div>

          {/* 3 Tabs */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-900">3 Tabs</h3>
            <Tab
              tabs={threeTabs}
              activeTab={activeTab2}
              onTabChange={setActiveTab2}
            />
          </div>

          {/* 4 Tabs */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-900">4 Tabs</h3>
            <Tab
              tabs={fourTabs}
              activeTab={activeTab3}
              onTabChange={setActiveTab3}
            />
          </div>

          {/* 5 Tabs com Disabled */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-900">
              5 Tabs (com Tab Desabilitada)
            </h3>
            <Tab
              tabs={fiveTabsWithDisabled}
              activeTab={activeTab4}
              onTabChange={setActiveTab4}
            />
          </div>
        </div>
      </section>

      {/* ===== RESPONSIVIDADE ===== */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-900 mb-2">
            Comportamento Responsivo
          </h2>
          <p className="text-text-600">
            Labels diferentes para mobile e desktop
          </p>
        </div>

        <div className="space-y-6">
          {/* Responsivo */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-900">
              Responsivo (redimensione a tela)
            </h3>
            <Tab
              tabs={defaultTabs}
              activeTab={activeTab1}
              onTabChange={setActiveTab1}
              responsive={true}
            />
            <p className="text-sm text-text-600">
              No mobile: "Criar" e "Histórico" | No desktop: "Criar Simulado" e
              "Histórico"
            </p>
          </div>

          {/* Não responsivo */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-900">
              Não Responsivo
            </h3>
            <Tab
              tabs={defaultTabs}
              activeTab={activeTab1}
              onTabChange={setActiveTab1}
              responsive={false}
            />
            <p className="text-sm text-text-600">
              Sempre mostra o label completo independente do tamanho da tela
            </p>
          </div>
        </div>
      </section>

      {/* ===== ESTADOS ===== */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-900 mb-2">
            Estados do Componente
          </h2>
          <p className="text-text-600">
            Diferentes estados visuais e funcionais
          </p>
        </div>

        <div className="space-y-6">
          {/* Normal */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-900">Normal</h3>
            <Tab
              tabs={defaultTabs}
              activeTab={activeTab1}
              onTabChange={setActiveTab1}
            />
          </div>

          {/* Com Tab Desabilitada */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-900">
              Com Tab Desabilitada
            </h3>
            <Tab
              tabs={fiveTabsWithDisabled}
              activeTab={activeTab4}
              onTabChange={setActiveTab4}
            />
            <p className="text-sm text-text-600">
              A tab "Premium" está desabilitada e não pode ser clicada
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

/**
 * Interactive Tab example with content switching
 */
export const InteractiveTabsWithContent: Story = () => {
  const [activeTab, setActiveTab] = useState('create');

  const tabContent = {
    create: {
      title: 'Criar Simulado',
      content:
        'Aqui você pode criar um novo simulado personalizado com questões específicas.',
    },
    history: {
      title: 'Histórico',
      content:
        'Visualize todos os simulados que você já realizou e seus resultados.',
    },
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-text-900 mb-4">
          Tab Interativo com Conteúdo
        </h2>
        <p className="text-text-600 text-lg">
          Exemplo funcional de navegação entre tabs
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Tab
          tabs={defaultTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="bg-background-50 p-6 rounded-lg min-h-[200px]">
          <h3 className="text-2xl font-bold text-text-900 mb-4">
            {tabContent[activeTab as keyof typeof tabContent].title}
          </h3>
          <p className="text-text-700 text-lg">
            {tabContent[activeTab as keyof typeof tabContent].content}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-background-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-text-900 mb-2">
          Recursos do Tab Component
        </h3>
        <ul className="space-y-2 text-text-700">
          <li>• Navegação por teclado (setas, Enter, Space)</li>
          <li>• Suporte completo a acessibilidade (ARIA)</li>
          <li>• Responsivo com labels diferentes para mobile/desktop</li>
          <li>• Estados hover, focus e disabled</li>
          <li>• Indicador visual para aba ativa</li>
          <li>• Múltiplos tamanhos (small, medium, large)</li>
          <li>• Largura adaptável baseada no número de tabs</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Responsive behavior demonstration
 */
export const ResponsiveDemo: Story = () => {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-text-900 mb-4">
          Demonstração Responsiva
        </h2>
        <p className="text-text-600 text-lg">
          Redimensione a janela para ver o comportamento responsivo
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div className="border-2 border-dashed border-border-200 p-4 rounded-lg">
          <Tab
            tabs={defaultTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            responsive={true}
          />
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-text-600">
            <strong>Mobile (&lt; 640px):</strong> "Criar" e "Histórico"
          </p>
          <p className="text-sm text-text-600">
            <strong>Desktop (≥ 640px):</strong> "Criar Simulado" e "Histórico"
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Keyboard navigation demonstration
 */
export const KeyboardNavigationDemo: Story = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-text-900 mb-4">
          Navegação por Teclado
        </h2>
        <p className="text-text-600 text-lg">
          Teste a navegação usando o teclado
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Tab
          tabs={threeTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="bg-background-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-text-900 mb-4">
            Instruções de Navegação
          </h3>
          <ul className="space-y-2 text-text-700">
            <li>
              <kbd className="px-2 py-1 bg-background-200 rounded text-xs">
                Tab
              </kbd>{' '}
              - Foca no componente
            </li>
            <li>
              <kbd className="px-2 py-1 bg-background-200 rounded text-xs">
                ←
              </kbd>{' '}
              <kbd className="px-2 py-1 bg-background-200 rounded text-xs">
                →
              </kbd>{' '}
              - Navega entre tabs
            </li>
            <li>
              <kbd className="px-2 py-1 bg-background-200 rounded text-xs">
                Enter
              </kbd>{' '}
              ou{' '}
              <kbd className="px-2 py-1 bg-background-200 rounded text-xs">
                Space
              </kbd>{' '}
              - Ativa a tab
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
