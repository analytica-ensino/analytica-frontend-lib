import type { Story } from '@ladle/react';
import { useState } from 'react';
import { AreaKnowledgeSelector } from './AreaKnowledgeSelector';
import { ESSAY_AREA_ID } from './types';
import type { AreaKnowledgePerformance } from '../GeneralOverviewSection/types';

/**
 * Mock areas data for stories
 */
const mockAreas: AreaKnowledgePerformance[] = [
  {
    id: 'linguagens',
    name: 'Linguagens e Códigos',
    urlCover: null,
    percentage: 75,
    questionsTotal: 100,
    questionsCorrect: 75,
  },
  {
    id: 'humanas',
    name: 'Ciências Humanas e Sociais',
    urlCover: null,
    percentage: 80,
    questionsTotal: 100,
    questionsCorrect: 80,
  },
  {
    id: 'natureza',
    name: 'Ciências da Natureza',
    urlCover: null,
    percentage: 65,
    questionsTotal: 100,
    questionsCorrect: 65,
  },
  {
    id: 'matematica',
    name: 'Matemática e suas Tecnologias',
    urlCover: null,
    percentage: 70,
    questionsTotal: 100,
    questionsCorrect: 70,
  },
];

/**
 * Showcase principal: todas as variações do AreaKnowledgeSelector
 */
export const AllAreaKnowledgeSelectorShowcase: Story = () => {
  const [selectedArea1, setSelectedArea1] = useState<string | null>(null);
  const [selectedArea2, setSelectedArea2] = useState<string | null>('humanas');
  const [selectedArea3, setSelectedArea3] = useState<string | null>(
    ESSAY_AREA_ID
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-900 mb-4">
          Area Knowledge Selector
        </h1>
        <p className="text-text-600 text-lg">
          Seletor de Área de Conhecimento para filtrar dados de simulados
        </p>
      </div>

      <div className="space-y-8">
        {/* Exemplos Básicos */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2">
            Exemplos Básicos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Default - Nenhuma seleção */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-800">
                Padrão (Sem seleção)
              </h3>
              <p className="text-text-600 text-sm">
                Estado inicial com "Todos" selecionado
              </p>
              <AreaKnowledgeSelector
                areas={mockAreas}
                selectedAreaId={selectedArea1}
                onAreaChange={(id) => {
                  setSelectedArea1(id);
                  console.log('Área selecionada:', id);
                }}
              />
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Valor:</strong> {selectedArea1 ?? 'null (Todos)'}
                </p>
              </div>
            </div>

            {/* Com área pré-selecionada */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-800">
                Com Área Selecionada
              </h3>
              <p className="text-text-600 text-sm">
                Ciências Humanas pré-selecionada
              </p>
              <AreaKnowledgeSelector
                areas={mockAreas}
                selectedAreaId={selectedArea2}
                onAreaChange={(id) => {
                  setSelectedArea2(id);
                  console.log('Área selecionada:', id);
                }}
              />
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Valor:</strong> {selectedArea2 ?? 'null (Todos)'}
                </p>
              </div>
            </div>

            {/* Com Redação selecionada */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-800">
                Redação Selecionada
              </h3>
              <p className="text-text-600 text-sm">
                Opção de Redação selecionada
              </p>
              <AreaKnowledgeSelector
                areas={mockAreas}
                selectedAreaId={selectedArea3}
                onAreaChange={(id) => {
                  setSelectedArea3(id);
                  console.log('Área selecionada:', id);
                }}
              />
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Valor:</strong> {selectedArea3 ?? 'null (Todos)'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Variações de Props */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2">
            Variações de Props
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Label personalizada */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-800">
                Label Personalizada
              </h3>
              <p className="text-text-600 text-sm">
                Usando prop{' '}
                <code className="bg-gray-100 px-1 rounded">label</code>
              </p>
              <AreaKnowledgeSelector
                areas={mockAreas}
                selectedAreaId={null}
                onAreaChange={() => {}}
                label="Filtrar por área de conhecimento"
              />
            </div>

            {/* Sem opção de Redação */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-800">
                Sem Opção de Redação
              </h3>
              <p className="text-text-600 text-sm">
                Usando{' '}
                <code className="bg-gray-100 px-1 rounded">
                  includeEssay=false
                </code>
              </p>
              <AreaKnowledgeSelector
                areas={mockAreas}
                selectedAreaId={null}
                onAreaChange={() => {}}
                includeEssay={false}
              />
            </div>
          </div>
        </section>

        {/* Estados */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2">
            Estados
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Estado de Loading */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-800">
                Estado de Carregamento
              </h3>
              <p className="text-text-600 text-sm">
                Usando prop{' '}
                <code className="bg-gray-100 px-1 rounded">loading=true</code>
              </p>
              <AreaKnowledgeSelector
                areas={mockAreas}
                selectedAreaId={null}
                onAreaChange={() => {}}
                loading={true}
              />
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                <p className="text-yellow-800 text-sm">
                  O select fica com opacidade reduzida e desabilitado
                </p>
              </div>
            </div>

            {/* Lista vazia */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-800">
                Lista de Áreas Vazia
              </h3>
              <p className="text-text-600 text-sm">
                Quando não há áreas disponíveis
              </p>
              <AreaKnowledgeSelector
                areas={[]}
                selectedAreaId={null}
                onAreaChange={() => {}}
              />
              <div className="bg-gray-50 border-l-4 border-gray-400 p-3">
                <p className="text-gray-800 text-sm">
                  Ainda exibe "Todos" e "Redação" (se includeEssay=true)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Caso de Uso Real */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2">
            Caso de Uso Real
          </h2>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-800">
              Filtros de Simulado ENEM
            </h3>
            <p className="text-text-600 text-sm">
              Exemplo de uso em um contexto real de filtros de desempenho
            </p>

            <div className="bg-white border border-border-100 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border-50 pb-4">
                <h4 className="text-lg font-semibold text-text-900">
                  Desempenho por Área
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AreaKnowledgeSelector
                  areas={mockAreas}
                  selectedAreaId={null}
                  onAreaChange={(id) => console.log('Área:', id)}
                  label="Área de conhecimento"
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-700">
                    Período
                  </label>
                  <select className="w-full px-3 py-2 border border-border-200 rounded-md">
                    <option>Último mês</option>
                    <option>Últimos 3 meses</option>
                    <option>Último ano</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-700">
                    Turma
                  </label>
                  <select className="w-full px-3 py-2 border border-border-200 rounded-md">
                    <option>Todas as turmas</option>
                    <option>3º Ano A</option>
                    <option>3º Ano B</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-border-50">
                <p className="text-text-500 text-sm">
                  Selecione uma área de conhecimento para filtrar os dados de
                  desempenho dos alunos nos simulados ENEM.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cores por Área */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-text-900 border-b border-border-100 pb-2">
            Cores por Área
          </h2>

          <div className="space-y-4">
            <p className="text-text-600">
              O componente aplica cores automaticamente baseado no nome da área:
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#3B82F6' }}
                />
                <span className="text-sm text-text-700">Linguagens</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#F59E0B' }}
                />
                <span className="text-sm text-text-700">Humanas</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#22C55E' }}
                />
                <span className="text-sm text-text-700">Natureza</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#8B5CF6' }}
                />
                <span className="text-sm text-text-700">Matemática</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-rose-50 rounded-lg">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#F43F5E' }}
                />
                <span className="text-sm text-text-700">Redação</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

/**
 * Story com estado controlado interativo
 */
export const InteractiveControlled: Story = () => {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const getAreaName = (id: string | null): string => {
    if (id === null) return 'Todos';
    if (id === ESSAY_AREA_ID) return 'Redação';
    const area = mockAreas.find((a) => a.id === id);
    return area?.name || id;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text-900">
        Exemplo Interativo Controlado
      </h2>

      <div className="max-w-md">
        <AreaKnowledgeSelector
          areas={mockAreas}
          selectedAreaId={selectedArea}
          onAreaChange={setSelectedArea}
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <h3 className="font-semibold text-text-900">Estado Atual:</h3>
        <p className="text-text-700">
          <strong>ID:</strong>{' '}
          <code className="bg-gray-200 px-2 py-1 rounded">
            {selectedArea === null ? 'null' : `"${selectedArea}"`}
          </code>
        </p>
        <p className="text-text-700">
          <strong>Nome:</strong> {getAreaName(selectedArea)}
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedArea(null)}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
        >
          Selecionar Todos
        </button>
        {mockAreas.map((area) => (
          <button
            key={area.id}
            onClick={() => setSelectedArea(area.id)}
            className="px-3 py-1 bg-blue-100 rounded hover:bg-blue-200 text-sm"
          >
            {area.name}
          </button>
        ))}
        <button
          onClick={() => setSelectedArea(ESSAY_AREA_ID)}
          className="px-3 py-1 bg-rose-100 rounded hover:bg-rose-200 text-sm"
        >
          Redação
        </button>
      </div>
    </div>
  );
};

/**
 * Story com loading state
 */
export const LoadingState: Story = () => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text-900">
        Estado de Carregamento
      </h2>

      <div className="max-w-md">
        <AreaKnowledgeSelector
          areas={mockAreas}
          selectedAreaId={null}
          onAreaChange={() => {}}
          loading={loading}
        />
      </div>

      <button
        onClick={() => setLoading(!loading)}
        className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
      >
        {loading ? 'Desabilitar Loading' : 'Habilitar Loading'}
      </button>
    </div>
  );
};

/**
 * Story sem opção de redação
 */
export const WithoutEssayOption: Story = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text-900">Sem Opção de Redação</h2>
      <p className="text-text-600">
        Para simulados que não incluem redação, use{' '}
        <code className="bg-gray-100 px-1 rounded">includeEssay=false</code>
      </p>

      <div className="max-w-md">
        <AreaKnowledgeSelector
          areas={mockAreas}
          selectedAreaId={null}
          onAreaChange={() => {}}
          includeEssay={false}
        />
      </div>
    </div>
  );
};

/**
 * Story com diferentes labels
 */
export const CustomLabels: Story = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text-900">
        Labels Personalizadas
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
        <AreaKnowledgeSelector
          areas={mockAreas}
          selectedAreaId={null}
          onAreaChange={() => {}}
          label="Área de conhecimento"
        />

        <AreaKnowledgeSelector
          areas={mockAreas}
          selectedAreaId={null}
          onAreaChange={() => {}}
          label="Filtrar por área"
        />

        <AreaKnowledgeSelector
          areas={mockAreas}
          selectedAreaId={null}
          onAreaChange={() => {}}
          label="Selecione a área"
        />

        <AreaKnowledgeSelector
          areas={mockAreas}
          selectedAreaId={null}
          onAreaChange={() => {}}
          label="Área ENEM"
        />
      </div>
    </div>
  );
};
