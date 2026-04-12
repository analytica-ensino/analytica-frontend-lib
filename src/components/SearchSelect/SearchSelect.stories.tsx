import type { Story } from '@ladle/react';
import { useState, useCallback, useEffect } from 'react';
import { SearchSelect } from './SearchSelect';
import type {
  SearchSelectOption,
  SearchSelectPagination,
} from './SearchSelect';

const sizes = ['small', 'medium', 'large'] as const;
const variants = ['outlined', 'underlined', 'rounded'] as const;

// Mock data
const fruitOptions: SearchSelectOption[] = [
  { value: 'apple', label: 'Maçã' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Laranja' },
  { value: 'grape', label: 'Uva' },
  { value: 'strawberry', label: 'Morango' },
  { value: 'watermelon', label: 'Melancia' },
  { value: 'pineapple', label: 'Abacaxi' },
  { value: 'mango', label: 'Manga' },
];

const categoryOptions: SearchSelectOption[] = [
  { value: 'tech', label: 'Tecnologia' },
  { value: 'health', label: 'Saúde' },
  { value: 'education', label: 'Educação' },
  { value: 'finance', label: 'Finanças' },
  { value: 'sports', label: 'Esportes' },
];

// Mock large dataset for pagination demo
const generateLargeDataset = (count: number): SearchSelectOption[] => {
  return Array.from({ length: count }, (_, i) => ({
    value: `item-${i + 1}`,
    label: `Item ${i + 1} - Lorem ipsum dolor sit amet`,
  }));
};

/**
 * Showcase principal: todas as combinações possíveis do SearchSelect
 */
export const AllSearchSelects: Story = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">SearchSelect</h2>
      <p className="text-text-700">
        Componente <code>SearchSelect</code> com suporte a busca, paginação,
        infinite scroll, label, helper text e error message.
      </p>

      {/* Demonstração de Label, Helper Text e Error Message */}
      <h3 className="font-bold text-2xl text-text-900">Com Label e Textos</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 className="font-medium text-lg text-text-900 mb-4">Com Label</h4>
          <SearchSelect
            label="Categoria"
            options={categoryOptions}
            placeholder="Selecione uma categoria"
            size="medium"
          />
        </div>

        <div>
          <h4 className="font-medium text-lg text-text-900 mb-4">
            Com Helper Text
          </h4>
          <SearchSelect
            label="Fruta Favorita"
            helperText="Escolha sua fruta preferida"
            options={fruitOptions}
            placeholder="Selecione uma fruta"
            size="medium"
          />
        </div>

        <div>
          <h4 className="font-medium text-lg text-text-900 mb-4">
            Com Error Message
          </h4>
          <SearchSelect
            label="Campo Obrigatório"
            errorMessage="Este campo é obrigatório"
            options={categoryOptions}
            placeholder="Selecione uma opção"
            size="medium"
          />
        </div>
      </div>

      {/* Tamanhos + variantes */}
      <h3 className="font-bold text-2xl text-text-900">Tamanhos e Variantes</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {sizes.map((size) => (
          <div key={size}>
            <div className="font-medium text-text-900 mb-2">{size}</div>
            <div className="flex flex-row gap-4 flex-wrap">
              {variants.map((variant) => (
                <div
                  key={variant}
                  className="flex flex-col gap-2 min-w-[200px]"
                >
                  <span className="text-sm text-text-600">{variant}</span>
                  <SearchSelect
                    size={size}
                    variant={variant}
                    options={fruitOptions}
                    placeholder={`${variant} ${size}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comparação de Alturas */}
      <h3 className="font-bold text-2xl text-text-900">
        Comparação de Alturas
      </h3>
      <div className="flex flex-row gap-4 items-end flex-wrap">
        {sizes.map((size) => (
          <div key={size} className="flex flex-col gap-2 min-w-[180px]">
            <span className="text-sm text-text-600">{size}</span>
            <SearchSelect
              size={size}
              label={`Label ${size}`}
              options={categoryOptions}
              placeholder={`${size} select`}
            />
          </div>
        ))}
      </div>

      {/* Estados */}
      <h3 className="font-bold text-2xl text-text-900">Estados</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 className="font-medium text-lg text-text-900 mb-4">Normal</h4>
          <SearchSelect
            label="Estado Normal"
            options={fruitOptions}
            placeholder="Selecione..."
          />
        </div>

        <div>
          <h4 className="font-medium text-lg text-text-900 mb-4">Loading</h4>
          <SearchSelect
            label="Carregando"
            options={[]}
            loading={true}
            placeholder="Carregando..."
          />
        </div>

        <div>
          <h4 className="font-medium text-lg text-text-900 mb-4">
            Desabilitado
          </h4>
          <SearchSelect
            label="Desabilitado"
            options={fruitOptions}
            disabled={true}
            placeholder="Não disponível"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Busca Local (filterLocally=true)
 */
export const LocalSearch: Story = () => {
  const [value, setValue] = useState('');

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <h3 className="font-bold text-2xl text-text-900">Busca Local</h3>
      <p className="text-text-700">
        Com <code>filterLocally=true</code> (padrão), a filtragem é feita no
        cliente usando o texto digitado.
      </p>

      <SearchSelect
        label="Escolha uma fruta"
        value={value}
        onValueChange={setValue}
        options={fruitOptions}
        placeholder="Digite para buscar..."
        searchPlaceholder="Buscar fruta..."
        filterLocally={true}
        helperText="Tente digitar 'ma' para filtrar"
      />

      <div className="p-3 bg-background-50 rounded-lg text-sm">
        <strong>Valor selecionado:</strong> {value || 'Nenhum'}
      </div>
    </div>
  );
};

/**
 * Busca Async/Backend (filterLocally=false)
 */
export const AsyncSearch: Story = () => {
  const [value, setValue] = useState('');
  const [options, setOptions] = useState<SearchSelectOption[]>(fruitOptions);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setLoading(true);

    // Simula chamada de API
    setTimeout(() => {
      const filtered = fruitOptions.filter((opt) =>
        opt.label.toLowerCase().includes(query.toLowerCase())
      );
      setOptions(filtered);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <h3 className="font-bold text-2xl text-text-900">Busca Async/Backend</h3>
      <p className="text-text-700">
        Com <code>filterLocally=false</code>, a busca é feita via callback{' '}
        <code>onSearch</code> permitindo integração com API backend.
      </p>

      <SearchSelect
        label="Escolha uma fruta"
        value={value}
        onValueChange={setValue}
        options={options}
        placeholder="Digite para buscar..."
        searchPlaceholder="Buscar fruta..."
        filterLocally={false}
        onSearch={handleSearch}
        loading={loading}
        searchDebounce={300}
        helperText="Busca com debounce de 300ms"
      />

      <div className="p-3 bg-background-50 rounded-lg text-sm flex flex-col gap-2">
        <div>
          <strong>Query de busca:</strong> {searchQuery || '(vazio)'}
        </div>
        <div>
          <strong>Valor selecionado:</strong> {value || 'Nenhum'}
        </div>
        <div>
          <strong>Resultados:</strong> {options.length}
        </div>
      </div>
    </div>
  );
};

/**
 * Paginação e Infinite Scroll
 */
export const WithPagination: Story = () => {
  const ITEMS_PER_PAGE = 10;
  const allItems = generateLargeDataset(100);

  const [value, setValue] = useState('');
  const [page, setPage] = useState(1);
  const [options, setOptions] = useState<SearchSelectOption[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulação de carga inicial
  useEffect(() => {
    setTimeout(() => {
      setOptions(allItems.slice(0, ITEMS_PER_PAGE));
      setLoading(false);
    }, 500);
  }, []);

  const pagination: SearchSelectPagination = {
    page,
    limit: ITEMS_PER_PAGE,
    totalPages: Math.ceil(allItems.length / ITEMS_PER_PAGE),
    hasNext: page * ITEMS_PER_PAGE < allItems.length,
    hasPrev: page > 1,
    total: allItems.length,
  };

  const handleLoadMore = useCallback(() => {
    if (loadingMore) return;

    setLoadingMore(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const newItems = allItems.slice(0, nextPage * ITEMS_PER_PAGE);
      setOptions(newItems);
      setPage(nextPage);
      setLoadingMore(false);
    }, 500);
  }, [page, loadingMore, allItems]);

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <h3 className="font-bold text-2xl text-text-900">
        Paginação e Infinite Scroll
      </h3>
      <p className="text-text-700">
        Role até o final da lista para carregar mais itens automaticamente.
      </p>

      <SearchSelect
        label="Selecione um item"
        value={value}
        onValueChange={setValue}
        options={options}
        placeholder="Selecione..."
        searchPlaceholder="Buscar item..."
        loading={loading}
        loadingMore={loadingMore}
        pagination={pagination}
        onLoadMore={handleLoadMore}
        filterLocally={true}
        helperText={`${options.length} de ${allItems.length} itens carregados`}
      />

      <div className="p-3 bg-background-50 rounded-lg text-sm flex flex-col gap-2">
        <div>
          <strong>Página atual:</strong> {page}
        </div>
        <div>
          <strong>Total de páginas:</strong> {pagination.totalPages}
        </div>
        <div>
          <strong>Itens carregados:</strong> {options.length}
        </div>
        <div>
          <strong>Valor selecionado:</strong> {value || 'Nenhum'}
        </div>
      </div>
    </div>
  );
};

/**
 * Combinação: Backend Search + Pagination
 */
export const AsyncSearchWithPagination: Story = () => {
  const ITEMS_PER_PAGE = 10;
  const allItems = generateLargeDataset(100);

  const [value, setValue] = useState('');
  const [page, setPage] = useState(1);
  const [options, setOptions] = useState<SearchSelectOption[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtra e pagina os itens
  const getFilteredItems = useCallback(
    (query: string) => {
      if (!query) return allItems;
      return allItems.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      );
    },
    [allItems]
  );

  // Carga inicial
  useEffect(() => {
    setTimeout(() => {
      setOptions(allItems.slice(0, ITEMS_PER_PAGE));
      setLoading(false);
    }, 500);
  }, []);

  const filteredItems = getFilteredItems(searchQuery);
  const pagination: SearchSelectPagination = {
    page,
    limit: ITEMS_PER_PAGE,
    totalPages: Math.ceil(filteredItems.length / ITEMS_PER_PAGE),
    hasNext: page * ITEMS_PER_PAGE < filteredItems.length,
    hasPrev: page > 1,
    total: filteredItems.length,
  };

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setLoading(true);
      setPage(1);

      // Simula chamada de API
      setTimeout(() => {
        const filtered = getFilteredItems(query);
        setOptions(filtered.slice(0, ITEMS_PER_PAGE));
        setLoading(false);
      }, 500);
    },
    [getFilteredItems]
  );

  const handleLoadMore = useCallback(() => {
    if (loadingMore) return;

    setLoadingMore(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const filtered = getFilteredItems(searchQuery);
      const newItems = filtered.slice(0, nextPage * ITEMS_PER_PAGE);
      setOptions(newItems);
      setPage(nextPage);
      setLoadingMore(false);
    }, 500);
  }, [page, loadingMore, searchQuery, getFilteredItems]);

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <h3 className="font-bold text-2xl text-text-900">
        Backend Search + Paginação
      </h3>
      <p className="text-text-700">
        Combina busca assíncrona com infinite scroll. Digite para buscar e role
        para carregar mais.
      </p>

      <SearchSelect
        label="Selecione um item"
        value={value}
        onValueChange={setValue}
        options={options}
        placeholder="Selecione..."
        searchPlaceholder="Buscar item..."
        loading={loading}
        loadingMore={loadingMore}
        pagination={pagination}
        onLoadMore={handleLoadMore}
        onSearch={handleSearch}
        filterLocally={false}
        searchDebounce={300}
      />

      <div className="p-3 bg-background-50 rounded-lg text-sm flex flex-col gap-2">
        <div>
          <strong>Busca:</strong> {searchQuery || '(vazio)'}
        </div>
        <div>
          <strong>Resultados:</strong> {filteredItems.length}
        </div>
        <div>
          <strong>Carregados:</strong> {options.length}
        </div>
        <div>
          <strong>Valor:</strong> {value || 'Nenhum'}
        </div>
      </div>
    </div>
  );
};

/**
 * Opções Desabilitadas
 */
export const WithDisabledOptions: Story = () => {
  const [value, setValue] = useState('');

  const optionsWithDisabled: SearchSelectOption[] = [
    { value: 'active1', label: 'Opção Ativa 1' },
    { value: 'disabled1', label: 'Opção Desabilitada 1', disabled: true },
    { value: 'active2', label: 'Opção Ativa 2' },
    { value: 'disabled2', label: 'Opção Desabilitada 2', disabled: true },
    { value: 'active3', label: 'Opção Ativa 3' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <h3 className="font-bold text-2xl text-text-900">Opções Desabilitadas</h3>
      <p className="text-text-700">
        Algumas opções podem estar desabilitadas usando{' '}
        <code>disabled: true</code>.
      </p>

      <SearchSelect
        label="Escolha uma opção"
        value={value}
        onValueChange={setValue}
        options={optionsWithDisabled}
        placeholder="Selecione..."
        helperText="Opções cinzas não podem ser selecionadas"
      />

      <div className="p-3 bg-background-50 rounded-lg text-sm">
        <strong>Valor selecionado:</strong> {value || 'Nenhum'}
      </div>
    </div>
  );
};

/**
 * Controlado com onValueChange
 */
export const Controlled: Story = () => {
  const [value, setValue] = useState('');
  const [changeLog, setChangeLog] = useState<string[]>([]);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    const label = fruitOptions.find((o) => o.value === newValue)?.label;
    setChangeLog((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: Selecionado "${label}" (${newValue})`,
    ]);
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h3 className="font-bold text-2xl text-text-900">
        Componente Controlado
      </h3>
      <p className="text-text-700">
        Demonstração do callback <code>onValueChange</code> para gerenciar
        estado externo.
      </p>

      <SearchSelect
        label="Escolha uma fruta"
        value={value}
        onValueChange={handleValueChange}
        options={fruitOptions}
        placeholder="Selecione uma fruta"
        size="medium"
      />

      <div className="p-4 bg-background-50 rounded-lg border">
        <h4 className="font-medium text-lg text-text-900 mb-2">
          Valor Atual:{' '}
          <span className="text-primary-600 ml-2">
            {value
              ? fruitOptions.find((o) => o.value === value)?.label
              : 'Nenhum selecionado'}
          </span>
        </h4>

        <div className="mt-4">
          <h5 className="font-medium text-text-700 mb-2">Log de Mudanças:</h5>
          <div className="max-h-32 overflow-y-auto text-sm text-text-600">
            {changeLog.length === 0 ? (
              <p className="italic">Nenhuma mudança ainda...</p>
            ) : (
              changeLog.map((entry, idx) => (
                <div key={idx} className="mb-1">
                  {entry}
                </div>
              ))
            )}
          </div>
          {changeLog.length > 0 && (
            <button
              className="mt-2 text-sm text-primary-600 hover:text-primary-700"
              onClick={() => setChangeLog([])}
            >
              Limpar log
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Stories individuais para referência rápida
export const WithLabel: Story = () => (
  <SearchSelect
    label="Escolha uma opção"
    helperText="Esta é uma informação útil"
    options={categoryOptions}
    placeholder="Clique para selecionar"
  />
);

export const WithError: Story = () => (
  <SearchSelect
    label="Campo obrigatório"
    errorMessage="Por favor, selecione uma opção"
    options={categoryOptions}
    placeholder="Selecione uma opção"
  />
);

export const Small: Story = () => (
  <SearchSelect
    size="small"
    label="Small SearchSelect"
    options={fruitOptions}
    placeholder="Small select"
  />
);

export const Medium: Story = () => (
  <SearchSelect
    size="medium"
    label="Medium SearchSelect"
    options={fruitOptions}
    placeholder="Medium select"
  />
);

export const Large: Story = () => (
  <SearchSelect
    size="large"
    label="Large SearchSelect"
    options={fruitOptions}
    placeholder="Large select"
  />
);

export const Outlined: Story = () => (
  <SearchSelect
    variant="outlined"
    options={fruitOptions}
    placeholder="Outlined select"
  />
);

export const Underlined: Story = () => (
  <SearchSelect
    variant="underlined"
    options={fruitOptions}
    placeholder="Underlined select"
  />
);

export const Rounded: Story = () => (
  <SearchSelect
    variant="rounded"
    options={fruitOptions}
    placeholder="Rounded select"
  />
);

export const Loading: Story = () => (
  <SearchSelect
    label="Carregando dados"
    loading={true}
    options={[]}
    placeholder="Carregando..."
    loadingText="Buscando opções..."
  />
);

export const Disabled: Story = () => (
  <SearchSelect
    label="Select desabilitado"
    disabled={true}
    options={fruitOptions}
    placeholder="Não disponível"
  />
);

export const WithDefaultValue: Story = () => (
  <SearchSelect
    label="Com valor padrão"
    value="banana"
    options={fruitOptions}
    placeholder="Selecione..."
  />
);

export const EmptyState: Story = () => (
  <SearchSelect
    label="Lista vazia"
    options={[]}
    placeholder="Selecione..."
    emptyText="Nenhuma opção disponível"
  />
);
