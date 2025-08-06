import React from 'react';
import type { Story } from '@ladle/react';
import Search from './Search';

/**
 * Showcase principal: todas as variações possíveis do Search
 */
export const AllSearchVariants: Story = () => {
  const [searchValue, setSearchValue] = React.useState('');
  const [searchValue2, setSearchValue2] = React.useState('Texto inicial');

  const materias = [
    'Filosofia',
    'Física',
    'Matemática',
    'Português',
    'História',
    'Geografia',
    'Química',
    'Biologia',
    'Inglês',
    'Educação Física',
    'Artes',
    'Literatura',
  ];

  return (
    <div className="flex flex-col gap-8 max-w-[600px]">
      <h2 className="font-bold text-3xl text-text-900">Search</h2>
      <p className="text-text-700">
        Variações possíveis do componente <code>Search</code>:
      </p>

      {/* Estado padrão (vazio) */}
      <div>
        <h3 className="font-bold text-lg text-text-900 mb-2">
          Estado padrão (vazio)
        </h3>
        <Search
          options={materias}
          placeholder="Buscar Matéria"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSelect={(item) => setSearchValue(item)}
        />
      </div>

      {/* Com texto (mostra botão limpar) */}
      <div>
        <h3 className="font-bold text-lg text-text-900 mb-2">
          Com texto (mostra botão limpar)
        </h3>
        <Search
          options={materias}
          placeholder="Buscar Matéria"
          value={searchValue2}
          onChange={(e) => setSearchValue2(e.target.value)}
          onSelect={(item) => setSearchValue2(item)}
        />
      </div>

      {/* Desabilitado */}
      <div>
        <h3 className="font-bold text-lg text-text-900 mb-2">Desabilitado</h3>
        <Search
          options={materias}
          placeholder="Buscar Matéria"
          disabled
          value="Busca desabilitada"
        />
      </div>

      {/* Somente leitura */}
      <div>
        <h3 className="font-bold text-lg text-text-900 mb-2">
          Somente leitura
        </h3>
        <Search
          options={materias}
          placeholder="Buscar Matéria"
          readOnly
          value="Valor fixo"
        />
      </div>

      {/* Com callback customizado onClear */}
      <div>
        <h3 className="font-bold text-lg text-text-900 mb-2">
          Com callback customizado onClear
        </h3>
        <Search
          options={materias}
          placeholder="Buscar com onClear customizado"
          value="Clique no X"
          onChange={() => {}}
          onClear={() => alert('Limpeza customizada!')}
        />
      </div>
    </div>
  );
};

export const SearchWithDropdown: Story = () => {
  const [searchValue, setSearchValue] = React.useState('');
  const [selectedItem, setSelectedItem] = React.useState('');

  const materias = [
    'Filosofia',
    'Física',
    'Matemática',
    'Português',
    'História',
    'Geografia',
    'Química',
    'Biologia',
    'Inglês',
    'Educação Física',
    'Artes',
    'Literatura',
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-bold text-lg text-text-900 mb-4">
          Busca Interativa com Dropdown
        </h3>
        <p className="text-sm text-text-600 mb-4">
          Digite para filtrar as matérias. Use as setas do teclado para navegar
          e Enter para selecionar.
        </p>
        <Search
          options={materias}
          placeholder="Digite 'Fi' para ver Filosofia e Física"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSelect={(item) => {
            setSelectedItem(item);
            setSearchValue(item);
          }}
          highlightMatch={true}
          noResultsText="Nenhuma matéria encontrada"
        />
        {selectedItem && (
          <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
            <p className="text-sm">
              <strong>Matéria selecionada:</strong> {selectedItem}
            </p>
          </div>
        )}
      </div>

      <div>
        <h3 className="font-bold text-lg text-text-900 mb-4">
          Busca com Highlight Desabilitado
        </h3>
        <Search
          options={materias.slice(0, 5)}
          placeholder="Buscar sem highlight"
          onSelect={(item) => alert(`Selecionado: ${item}`)}
          highlightMatch={false}
        />
      </div>

      <div>
        <h3 className="font-bold text-lg text-text-900 mb-4">
          Busca com Lista Vazia
        </h3>
        <Search
          options={[]}
          placeholder="Sem opções disponíveis"
          onSelect={(item) => alert(`Selecionado: ${item}`)}
        />
      </div>

      <div>
        <h3 className="font-bold text-lg text-text-900 mb-4">
          Busca com Altura Customizada do Dropdown
        </h3>
        <Search
          options={materias}
          placeholder="Dropdown com altura limitada"
          onSelect={(item) => alert(`Selecionado: ${item}`)}
          dropdownMaxHeight={120}
        />
      </div>
    </div>
  );
};

export const SearchDebug: Story = () => {
  const [searchValue, setSearchValue] = React.useState('');
  const [selectedItem, setSelectedItem] = React.useState('');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const materias = [
    'Filosofia',
    'Física',
    'Matemática',
    'Português',
    'História',
    'Geografia',
    'Química',
    'Biologia',
    'Inglês',
    'Educação Física',
    'Artes',
    'Literatura',
    'Sociologia',
    'Psicologia',
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">
        🔍 Debug: Dropdown de Busca
      </h3>

      {/* Estado Debug */}
      <div className="mb-6 p-4 bg-white rounded-lg border shadow-sm">
        <h4 className="font-semibold mb-3 text-lg text-gray-700">
          Estado do Componente:
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Valor Digitado:</strong>{' '}
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              "{searchValue}"
            </span>
          </div>
          <div>
            <strong>Dropdown Aberto:</strong>{' '}
            <span
              className={`font-bold ${isDropdownOpen ? 'text-green-600' : 'text-red-600'}`}
            >
              {isDropdownOpen ? '✅ Sim' : '❌ Não'}
            </span>
          </div>
          <div>
            <strong>Opções Filtradas:</strong>{' '}
            <span className="font-bold text-blue-600">
              {
                materias.filter((m) =>
                  m.toLowerCase().includes(searchValue.toLowerCase())
                ).length
              }
            </span>
          </div>
          <div>
            <strong>Item Selecionado:</strong>{' '}
            <span className="font-mono bg-blue-100 px-2 py-1 rounded">
              {selectedItem || 'Nenhum'}
            </span>
          </div>
        </div>
      </div>

      {/* Search com Debug */}
      <div className="mb-6 p-4 bg-white rounded-lg border shadow-sm">
        <h4 className="font-semibold mb-3 text-lg text-gray-700">
          Teste o Componente:
        </h4>
        <Search
          options={materias}
          placeholder="Digite 'Fi' para ver Filosofia e Física"
          value={searchValue}
          onChange={(e) => {
            console.log('🎯 Valor digitado:', e.target.value);
            setSearchValue(e.target.value);
          }}
          onSelect={(item) => {
            console.log('🎯 Item selecionado:', item);
            setSelectedItem(item);
            setSearchValue(item);
          }}
          onDropdownChange={(open) => {
            console.log('🎯 Dropdown mudou para:', open);
            setIsDropdownOpen(open);
          }}
          onSearch={(query) => {
            console.log('🔍 Pesquisando por:', query);
          }}
          highlightMatch={true}
          noResultsText="Nenhuma matéria encontrada"
        />
      </div>

      {/* Instruções e Opções Esperadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold mb-3 text-lg text-blue-800">
            📝 Como Testar:
          </h4>
          <ul className="list-disc list-inside text-sm space-y-1 text-blue-700">
            <li>Digite "Fi" para ver Filosofia e Física</li>
            <li>Digite "Ma" para ver Matemática</li>
            <li>Digite "xyz" para testar sem resultados</li>
            <li>Use ↑↓ para navegar, Enter para selecionar</li>
            <li>Pressione Escape para fechar</li>
          </ul>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold mb-3 text-lg text-green-800">
            📚 Todas as Matérias:
          </h4>
          <div className="grid grid-cols-2 gap-1 text-sm text-green-700">
            {materias.map((materia) => (
              <div
                key={materia}
                className={`px-2 py-1 rounded ${
                  materia.toLowerCase().includes(searchValue.toLowerCase()) &&
                  searchValue
                    ? 'bg-green-200 font-bold'
                    : 'bg-green-100'
                }`}
              >
                {materia}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Console Output */}
      <div className="mt-6 p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-xs">
        <h4 className="font-semibold mb-2 text-white">
          💻 Verifique o Console do Browser (F12):
        </h4>
        <p>Logs começando com 🔍 🎯 mostrarão o estado interno do componente</p>
      </div>
    </div>
  );
};

export const SearchAdvanced: Story = () => {
  const [searchValue, setSearchValue] = React.useState('');
  const [customOptions, setCustomOptions] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const allMaterias = [
    'Filosofia',
    'Física',
    'Matemática',
    'Português',
    'História',
    'Geografia',
    'Química',
    'Biologia',
    'Inglês',
    'Educação Física',
    'Artes',
    'Literatura',
    'Sociologia',
    'Psicologia',
    'Antropologia',
    'Economia',
  ];

  // Simulate API call with debounce
  React.useEffect(() => {
    if (!searchValue) {
      setCustomOptions([]);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      const filtered = allMaterias.filter((materia) =>
        materia.toLowerCase().includes(searchValue.toLowerCase())
      );
      setCustomOptions(filtered);
      setIsLoading(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <div>
        <h3 className="font-bold text-lg text-text-900 mb-4">
          Busca com Debounce (300ms)
        </h3>
        <p className="text-sm text-text-600 mb-4">
          Simula uma busca em API com debounce. Digite para ver o loading.
        </p>
        <Search
          options={isLoading ? [] : customOptions}
          placeholder="Digite para buscar com debounce..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSelect={(item) => setSearchValue(item)}
          noResultsText={
            isLoading ? 'Buscando...' : 'Nenhuma matéria encontrada'
          }
          className={isLoading ? 'opacity-75' : ''}
        />
        {isLoading && (
          <p className="text-xs text-gray-500 mt-2">🔄 Buscando...</p>
        )}
      </div>

      <div>
        <h3 className="font-bold text-lg text-text-900 mb-4">
          Busca Controlada Externamente
        </h3>
        <Search
          options={allMaterias}
          placeholder="Dropdown sempre aberto"
          showDropdown={true}
          value=""
          onSelect={(item) => alert(`Selecionado: ${item}`)}
        />
      </div>
    </div>
  );
};
