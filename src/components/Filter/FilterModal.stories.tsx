import type { Story } from '@ladle/react';
import { useState } from 'react';
import { FilterModal } from './FilterModal';
import { useTableFilter } from './useTableFilter';
import type { FilterConfig } from './useTableFilter';
import Table, {
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  useTableSort,
} from '../Table/Table';
import Button from '../Button/Button';
import { Funnel } from 'phosphor-react';

// Mock data for activities table
type Activity = {
  id: string;
  titulo: string;
  materia: string;
  turma: string;
  serie: string;
  escola: string;
  tipo: string;
  status: string;
  prazo: string;
};

const mockEscolas = [
  { id: '1', name: 'Escola Municipal João de Barro' },
  { id: '2', name: 'Escola Estadual Monteiro Lobato' },
  { id: '3', name: 'Escola Pública José de Alencar' },
];

const mockSeries = [
  { id: '1', name: '1ª Série', escolaId: '1' },
  { id: '2', name: '2ª Série', escolaId: '1' },
  { id: '3', name: '3ª Série', escolaId: '1' },
  { id: '4', name: '1ª Série', escolaId: '2' },
  { id: '5', name: '2ª Série', escolaId: '2' },
  { id: '6', name: '1ª Série', escolaId: '3' },
];

const mockTurmas = [
  { id: '1', name: 'Turma A', escolaId: '1', serieId: '1' },
  { id: '2', name: 'Turma B', escolaId: '1', serieId: '1' },
  { id: '3', name: 'Turma A', escolaId: '1', serieId: '2' },
  { id: '4', name: 'Turma C', escolaId: '2', serieId: '4' },
  { id: '5', name: 'Turma D', escolaId: '2', serieId: '5' },
  { id: '6', name: 'Turma E', escolaId: '3', serieId: '6' },
];

const mockAlunos = [
  { id: '1', name: 'Ana Silva', turmaId: '1' },
  { id: '2', name: 'Bruno Costa', turmaId: '1' },
  { id: '3', name: 'Carlos Souza', turmaId: '2' },
  { id: '4', name: 'Diana Lima', turmaId: '3' },
  { id: '5', name: 'Eduardo Santos', turmaId: '4' },
  { id: '6', name: 'Fernanda Oliveira', turmaId: '5' },
];

const mockMaterias = [
  { id: '1', name: 'Matemática' },
  { id: '2', name: 'Português' },
  { id: '3', name: 'História' },
  { id: '4', name: 'Geografia' },
  { id: '5', name: 'Ciências' },
];

const mockTemas = [
  { id: '1', name: 'Álgebra', materiaId: '1' },
  { id: '2', name: 'Geometria', materiaId: '1' },
  { id: '3', name: 'Gramática', materiaId: '2' },
  { id: '4', name: 'Literatura', materiaId: '2' },
  { id: '5', name: 'Brasil Colonial', materiaId: '3' },
];

const mockActivities: Activity[] = [
  {
    id: '1',
    titulo: 'Exercícios de Álgebra',
    materia: 'Matemática',
    turma: 'Turma A',
    serie: '1ª Série',
    escola: 'Escola Municipal João de Barro',
    tipo: 'Exercício',
    status: 'Ativo',
    prazo: '2025-02-15',
  },
  {
    id: '2',
    titulo: 'Redação sobre Literatura Brasileira',
    materia: 'Português',
    turma: 'Turma B',
    serie: '1ª Série',
    escola: 'Escola Municipal João de Barro',
    tipo: 'Dissertação',
    status: 'Ativo',
    prazo: '2025-02-20',
  },
  {
    id: '3',
    titulo: 'Prova de História',
    materia: 'História',
    turma: 'Turma A',
    serie: '2ª Série',
    escola: 'Escola Municipal João de Barro',
    tipo: 'Prova',
    status: 'Finalizado',
    prazo: '2025-01-30',
  },
  {
    id: '4',
    titulo: 'Trabalho de Geografia',
    materia: 'Geografia',
    turma: 'Turma C',
    serie: '1ª Série',
    escola: 'Escola Estadual Monteiro Lobato',
    tipo: 'Trabalho',
    status: 'Ativo',
    prazo: '2025-02-25',
  },
  {
    id: '5',
    titulo: 'Experimento de Ciências',
    materia: 'Ciências',
    turma: 'Turma D',
    serie: '2ª Série',
    escola: 'Escola Estadual Monteiro Lobato',
    tipo: 'Prática',
    status: 'Ativo',
    prazo: '2025-03-01',
  },
  {
    id: '6',
    titulo: 'Quiz de Matemática',
    materia: 'Matemática',
    turma: 'Turma E',
    serie: '1ª Série',
    escola: 'Escola Pública José de Alencar',
    tipo: 'Quiz',
    status: 'Ativo',
    prazo: '2025-02-18',
  },
  {
    id: '7',
    titulo: 'Leitura de Português',
    materia: 'Português',
    turma: 'Turma A',
    serie: '1ª Série',
    escola: 'Escola Municipal João de Barro',
    tipo: 'Leitura',
    status: 'Rascunho',
    prazo: '2025-03-05',
  },
];

const initialFilterConfigs: FilterConfig[] = [
  {
    key: 'academic',
    label: 'DADOS ACADÊMICOS',
    categories: [
      {
        key: 'escola',
        label: 'Escola',
        selectedIds: [],
        itens: mockEscolas,
      },
      {
        key: 'serie',
        label: 'Série',
        selectedIds: [],
        dependsOn: ['escola'],
        itens: mockSeries,
        filteredBy: [{ key: 'escola', internalField: 'escolaId' }],
      },
      {
        key: 'turma',
        label: 'Turma',
        selectedIds: [],
        dependsOn: ['escola', 'serie'],
        itens: mockTurmas,
        filteredBy: [
          { key: 'escola', internalField: 'escolaId' },
          { key: 'serie', internalField: 'serieId' },
        ],
      },
      {
        key: 'alunos',
        label: 'Alunos',
        selectedIds: [],
        dependsOn: ['turma'],
        itens: mockAlunos,
        filteredBy: [{ key: 'turma', internalField: 'turmaId' }],
      },
    ],
  },
  {
    key: 'content',
    label: 'CONTEÚDO',
    categories: [
      {
        key: 'materia',
        label: 'Matéria',
        selectedIds: [],
        itens: mockMaterias,
      },
      {
        key: 'tema',
        label: 'Tema',
        selectedIds: [],
        dependsOn: ['materia'],
        itens: mockTemas,
        filteredBy: [{ key: 'materia', internalField: 'materiaId' }],
      },
    ],
  },
];

export const BasicFilterModal: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    filterConfigs,
    updateFilters,
    applyFilters,
    clearFilters,
    hasActiveFilters,
  } = useTableFilter(initialFilterConfigs, { syncWithUrl: false });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Basic Filter Modal</h2>
        <Button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2"
        >
          <Funnel size={20} weight={hasActiveFilters ? 'fill' : 'regular'} />
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-primary-500 text-white rounded-full">
              {
                Object.keys(
                  filterConfigs.reduce(
                    (acc, config) => {
                      config.categories.forEach((cat) => {
                        if (cat.selectedIds && cat.selectedIds.length > 0) {
                          acc[cat.key] = true;
                        }
                      });
                      return acc;
                    },
                    {} as Record<string, boolean>
                  )
                ).length
              }
            </span>
          )}
        </Button>
      </div>

      {hasActiveFilters && (
        <div className="p-4 bg-secondary-50 rounded-lg border border-border-200">
          <h3 className="font-semibold mb-2">Filtros Ativos:</h3>
          <div className="space-y-1">
            {filterConfigs.map((config) =>
              config.categories
                .filter((cat) => cat.selectedIds && cat.selectedIds.length > 0)
                .map((cat) => (
                  <div key={cat.key} className="text-sm">
                    <span className="font-medium">{cat.label}:</span>{' '}
                    {cat.selectedIds
                      ?.map(
                        (id) => cat.itens?.find((item) => item.id === id)?.name
                      )
                      .join(', ')}
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      <FilterModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        filterConfigs={filterConfigs}
        onFiltersChange={updateFilters}
        onApply={() => {
          applyFilters();
          setIsOpen(false);
        }}
        onClear={clearFilters}
      />
    </div>
  );
};

BasicFilterModal.storyName = 'Basic Modal';

export const WithTableIntegration: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    filterConfigs,
    updateFilters,
    applyFilters,
    clearFilters,
    hasActiveFilters,
    activeFilters,
  } = useTableFilter(initialFilterConfigs, { syncWithUrl: false });

  // Filter activities based on active filters
  const filteredActivities = mockActivities.filter((activity) => {
    // Check escola filter
    if (activeFilters.escola && activeFilters.escola.length > 0) {
      const escolaNome = mockEscolas.find((e) =>
        activeFilters.escola.includes(e.id)
      )?.name;
      if (escolaNome && activity.escola !== escolaNome) return false;
    }

    // Check serie filter
    if (activeFilters.serie && activeFilters.serie.length > 0) {
      const serieNome = mockSeries.find((s) =>
        activeFilters.serie.includes(s.id)
      )?.name;
      if (serieNome && activity.serie !== serieNome) return false;
    }

    // Check turma filter
    if (activeFilters.turma && activeFilters.turma.length > 0) {
      const turmaNome = mockTurmas.find((t) =>
        activeFilters.turma.includes(t.id)
      )?.name;
      if (turmaNome && activity.turma !== turmaNome) return false;
    }

    // Check materia filter
    if (activeFilters.materia && activeFilters.materia.length > 0) {
      const materiaNome = mockMaterias.find((m) =>
        activeFilters.materia.includes(m.id)
      )?.name;
      if (materiaNome && activity.materia !== materiaNome) return false;
    }

    return true;
  });

  const { sortedData, sortColumn, sortDirection, handleSort } = useTableSort(
    filteredActivities,
    {
      syncWithUrl: false,
    }
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Atividades</h2>
          <p className="text-sm text-text-400">
            Mostrando {sortedData.length} de {mockActivities.length} atividades
          </p>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2"
        >
          <Funnel size={20} weight={hasActiveFilters ? 'fill' : 'regular'} />
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-primary-500 text-white rounded-full">
              {Object.keys(activeFilters).length}
            </span>
          )}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              sortDirection={sortColumn === 'titulo' ? sortDirection : null}
              onSort={() => handleSort('titulo')}
            >
              Título
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'materia' ? sortDirection : null}
              onSort={() => handleSort('materia')}
            >
              Matéria
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'escola' ? sortDirection : null}
              onSort={() => handleSort('escola')}
            >
              Escola
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'serie' ? sortDirection : null}
              onSort={() => handleSort('serie')}
            >
              Série
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'turma' ? sortDirection : null}
              onSort={() => handleSort('turma')}
            >
              Turma
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'tipo' ? sortDirection : null}
              onSort={() => handleSort('tipo')}
            >
              Tipo
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'status' ? sortDirection : null}
              onSort={() => handleSort('status')}
            >
              Status
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'prazo' ? sortDirection : null}
              onSort={() => handleSort('prazo')}
            >
              Prazo
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-text-400">
                Nenhuma atividade encontrada com os filtros selecionados
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>{activity.titulo}</TableCell>
                <TableCell>{activity.materia}</TableCell>
                <TableCell>{activity.escola}</TableCell>
                <TableCell>{activity.serie}</TableCell>
                <TableCell>{activity.turma}</TableCell>
                <TableCell>{activity.tipo}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      activity.status === 'Ativo'
                        ? 'bg-green-100 text-green-700'
                        : activity.status === 'Finalizado'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {activity.status}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(activity.prazo).toLocaleDateString('pt-BR')}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <FilterModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        filterConfigs={filterConfigs}
        onFiltersChange={updateFilters}
        onApply={() => {
          applyFilters();
          setIsOpen(false);
        }}
        onClear={clearFilters}
      />
    </div>
  );
};

WithTableIntegration.storyName = 'With Table Integration';

export const WithURLSync: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    filterConfigs,
    updateFilters,
    applyFilters,
    clearFilters,
    hasActiveFilters,
    activeFilters,
  } = useTableFilter(initialFilterConfigs, { syncWithUrl: true });

  // Filter activities based on active filters
  const filteredActivities = mockActivities.filter((activity) => {
    if (activeFilters.escola && activeFilters.escola.length > 0) {
      const escolaNome = mockEscolas.find((e) =>
        activeFilters.escola.includes(e.id)
      )?.name;
      if (escolaNome && activity.escola !== escolaNome) return false;
    }

    if (activeFilters.serie && activeFilters.serie.length > 0) {
      const serieNome = mockSeries.find((s) =>
        activeFilters.serie.includes(s.id)
      )?.name;
      if (serieNome && activity.serie !== serieNome) return false;
    }

    if (activeFilters.turma && activeFilters.turma.length > 0) {
      const turmaNome = mockTurmas.find((t) =>
        activeFilters.turma.includes(t.id)
      )?.name;
      if (turmaNome && activity.turma !== turmaNome) return false;
    }

    if (activeFilters.materia && activeFilters.materia.length > 0) {
      const materiaNome = mockMaterias.find((m) =>
        activeFilters.materia.includes(m.id)
      )?.name;
      if (materiaNome && activity.materia !== materiaNome) return false;
    }

    return true;
  });

  const { sortedData, sortColumn, sortDirection, handleSort } = useTableSort(
    filteredActivities,
    {
      syncWithUrl: true,
    }
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Atividades com URL Sync</h2>
          <p className="text-sm text-text-400">
            Os filtros são sincronizados com a URL. Recarregue a página para ver
            a persistência.
          </p>
          <p className="text-sm text-text-400">
            Mostrando {sortedData.length} de {mockActivities.length} atividades
          </p>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2"
        >
          <Funnel size={20} weight={hasActiveFilters ? 'fill' : 'regular'} />
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-primary-500 text-white rounded-full">
              {Object.keys(activeFilters).length}
            </span>
          )}
        </Button>
      </div>

      {hasActiveFilters && (
        <div className="p-4 bg-secondary-50 rounded-lg border border-border-200">
          <h3 className="font-semibold mb-2">Filtros Ativos:</h3>
          <div className="space-y-1">
            {filterConfigs.map((config) =>
              config.categories
                .filter((cat) => cat.selectedIds && cat.selectedIds.length > 0)
                .map((cat) => (
                  <div key={cat.key} className="text-sm">
                    <span className="font-medium">{cat.label}:</span>{' '}
                    {cat.selectedIds
                      ?.map(
                        (id) => cat.itens?.find((item) => item.id === id)?.name
                      )
                      .join(', ')}
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      <Table variant="borderless">
        <TableHeader>
          <TableRow variant="borderless">
            <TableHead
              sortDirection={sortColumn === 'titulo' ? sortDirection : null}
              onSort={() => handleSort('titulo')}
            >
              Título
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'materia' ? sortDirection : null}
              onSort={() => handleSort('materia')}
            >
              Matéria
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'escola' ? sortDirection : null}
              onSort={() => handleSort('escola')}
            >
              Escola
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'serie' ? sortDirection : null}
              onSort={() => handleSort('serie')}
            >
              Série
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'turma' ? sortDirection : null}
              onSort={() => handleSort('turma')}
            >
              Turma
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'tipo' ? sortDirection : null}
              onSort={() => handleSort('tipo')}
            >
              Tipo
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'status' ? sortDirection : null}
              onSort={() => handleSort('status')}
            >
              Status
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'prazo' ? sortDirection : null}
              onSort={() => handleSort('prazo')}
            >
              Prazo
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-text-400">
                Nenhuma atividade encontrada com os filtros selecionados
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>{activity.titulo}</TableCell>
                <TableCell>{activity.materia}</TableCell>
                <TableCell>{activity.escola}</TableCell>
                <TableCell>{activity.serie}</TableCell>
                <TableCell>{activity.turma}</TableCell>
                <TableCell>{activity.tipo}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      activity.status === 'Ativo'
                        ? 'bg-green-100 text-green-700'
                        : activity.status === 'Finalizado'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {activity.status}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(activity.prazo).toLocaleDateString('pt-BR')}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <FilterModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        filterConfigs={filterConfigs}
        onFiltersChange={updateFilters}
        onApply={() => {
          applyFilters();
          setIsOpen(false);
        }}
        onClear={clearFilters}
      />
    </div>
  );
};

WithURLSync.storyName = 'With URL Synchronization';

export const CustomLabels: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { filterConfigs, updateFilters, applyFilters, clearFilters } =
    useTableFilter(initialFilterConfigs, { syncWithUrl: false });

  return (
    <div className="p-6">
      <Button onClick={() => setIsOpen(true)}>Open Custom Filter</Button>

      <FilterModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        filterConfigs={filterConfigs}
        onFiltersChange={updateFilters}
        onApply={applyFilters}
        onClear={clearFilters}
        title="Filtros Personalizados"
        applyLabel="Confirmar"
        clearLabel="Resetar Tudo"
        size="lg"
      />
    </div>
  );
};

CustomLabels.storyName = 'Custom Labels & Size';
