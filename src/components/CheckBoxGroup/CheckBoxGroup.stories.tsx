import type { Story } from '@ladle/react';
import { CheckboxGroup, type CategoryConfig, type Item } from './CheckBoxGroup';
import { useState } from 'react';

const mockEscolas: Item[] = [
  {
    id: 'escola-1',
    name: 'Escola São Paulo',
    cidade: 'São Paulo',
    tipo: 'Pública',
  },
  {
    id: 'escola-2',
    name: 'Colégio Marista',
    cidade: 'Curitiba',
    tipo: 'Privada',
  },
  {
    id: 'escola-3',
    name: 'Instituto Federal',
    cidade: 'Belo Horizonte',
    tipo: 'Federal',
  },
];

const mockSeries: Item[] = [
  // Escola 1
  { id: 'serie-1', name: '1ª Série', escolaId: 'escola-1' },
  { id: 'serie-2', name: '2ª Série', escolaId: 'escola-1' },
  // Escola 2
  { id: 'serie-3', name: '7º Ano', escolaId: 'escola-2' },
  { id: 'serie-4', name: '8º Ano', escolaId: 'escola-2' },
  { id: 'serie-5', name: '1º Médio', escolaId: 'escola-2' },
  // Escola 3
  { id: 'serie-6', name: 'Curso Técnico - Info', escolaId: 'escola-3' },
  { id: 'serie-7', name: 'Curso Técnico - Eletro', escolaId: 'escola-3' },
  { id: 'serie-8', name: 'Ensino Médio - 2º', escolaId: 'escola-3' },
  { id: 'serie-9', name: 'Ensino Médio - 3º', escolaId: 'escola-3' },
];

const mockTurmas: Item[] = [
  // Turmas para série 1/2 da escola 1
  {
    id: 'turma-1',
    name: 'A',
    serieId: 'serie-1',
    escolaId: 'escola-1',
    turno: 'Manhã',
  },
  {
    id: 'turma-2',
    name: 'B',
    serieId: 'serie-1',
    escolaId: 'escola-1',
    turno: 'Tarde',
  },
  {
    id: 'turma-3',
    name: 'Única',
    serieId: 'serie-2',
    escolaId: 'escola-1',
    turno: 'Manhã',
  },

  // Turmas para série 3/4/5 da escola 2
  {
    id: 'turma-4',
    name: 'A',
    serieId: 'serie-3',
    escolaId: 'escola-2',
    turno: 'Noite',
  },
  {
    id: 'turma-5',
    name: 'B',
    serieId: 'serie-4',
    escolaId: 'escola-2',
    turno: 'Manhã',
  },
  {
    id: 'turma-6',
    name: 'Integral',
    serieId: 'serie-5',
    escolaId: 'escola-2',
    turno: 'Integral',
  },

  // Turmas para as séries da escola 3
  {
    id: 'turma-7',
    name: 'Téc 1',
    serieId: 'serie-6',
    escolaId: 'escola-3',
    turno: 'Manhã',
  },
  {
    id: 'turma-8',
    name: 'Téc 2',
    serieId: 'serie-7',
    escolaId: 'escola-3',
    turno: 'Tarde',
  },
  {
    id: 'turma-9',
    name: 'Médio 2 - A',
    serieId: 'serie-8',
    escolaId: 'escola-3',
    turno: 'Noite',
  },
  {
    id: 'turma-10',
    name: 'Médio 3 - Único',
    serieId: 'serie-9',
    escolaId: 'escola-3',
    turno: 'Manhã',
  },
];

const mockAlunos: Item[] = [
  // Escola 1
  // Turma 1
  {
    id: 'aluno-1',
    name: 'Alice Souza',
    turmaId: 'turma-1',
    serieId: 'serie-1',
    escolaId: 'escola-1',
    genero: 'F',
  },
  {
    id: 'aluno-2',
    name: 'Bruno Lima',
    turmaId: 'turma-1',
    serieId: 'serie-1',
    escolaId: 'escola-1',
    genero: 'M',
  },
  // Turma 2
  {
    id: 'aluno-3',
    name: 'Carlos Silva',
    turmaId: 'turma-2',
    serieId: 'serie-1',
    escolaId: 'escola-1',
    genero: 'M',
  },
  {
    id: 'aluno-4',
    name: 'Diana Amaral',
    turmaId: 'turma-2',
    serieId: 'serie-1',
    escolaId: 'escola-1',
    genero: 'F',
  },
  // Turma 3
  {
    id: 'aluno-5',
    name: 'Eduardo Alves',
    turmaId: 'turma-3',
    serieId: 'serie-2',
    escolaId: 'escola-1',
    genero: 'M',
  },

  // Escola 2
  // Turma 4
  {
    id: 'aluno-6',
    name: 'Fernanda Costa',
    turmaId: 'turma-4',
    serieId: 'serie-3',
    escolaId: 'escola-2',
    genero: 'F',
  },
  {
    id: 'aluno-7',
    name: 'Gabriel Pinto',
    turmaId: 'turma-4',
    serieId: 'serie-3',
    escolaId: 'escola-2',
    genero: 'M',
  },
  {
    id: 'aluno-8',
    name: 'Helena Moura',
    turmaId: 'turma-4',
    serieId: 'serie-3',
    escolaId: 'escola-2',
    genero: 'F',
  },
  // Turma 5
  {
    id: 'aluno-9',
    name: 'Igor Souza',
    turmaId: 'turma-5',
    serieId: 'serie-4',
    escolaId: 'escola-2',
    genero: 'M',
  },
  {
    id: 'aluno-10',
    name: 'Júlia Martins',
    turmaId: 'turma-5',
    serieId: 'serie-4',
    escolaId: 'escola-2',
    genero: 'F',
  },
  // Turma 6
  {
    id: 'aluno-11',
    name: 'Kevin Duarte',
    turmaId: 'turma-6',
    serieId: 'serie-5',
    escolaId: 'escola-2',
    genero: 'M',
  },
  {
    id: 'aluno-12',
    name: 'Larissa Fernandes',
    turmaId: 'turma-6',
    serieId: 'serie-5',
    escolaId: 'escola-2',
    genero: 'F',
  },
  {
    id: 'aluno-13',
    name: 'Manuela Cardoso',
    turmaId: 'turma-6',
    serieId: 'serie-5',
    escolaId: 'escola-2',
    genero: 'F',
  },

  // Escola 3
  // Turma 7
  {
    id: 'aluno-14',
    name: 'Nicolas Barros',
    turmaId: 'turma-7',
    serieId: 'serie-6',
    escolaId: 'escola-3',
    genero: 'M',
    bolsista: true,
  },
  {
    id: 'aluno-15',
    name: 'Olívia Rocha',
    turmaId: 'turma-7',
    serieId: 'serie-6',
    escolaId: 'escola-3',
    genero: 'F',
    bolsista: false,
  },
  {
    id: 'aluno-16',
    name: 'Pedro Ramos',
    turmaId: 'turma-7',
    serieId: 'serie-6',
    escolaId: 'escola-3',
    genero: 'M',
    bolsista: true,
  },
  // Turma 8
  {
    id: 'aluno-17',
    name: 'Quésia Leme',
    turmaId: 'turma-8',
    serieId: 'serie-7',
    escolaId: 'escola-3',
    genero: 'F',
    bolsista: false,
  },
  {
    id: 'aluno-18',
    name: 'Rafael Teles',
    turmaId: 'turma-8',
    serieId: 'serie-7',
    escolaId: 'escola-3',
    genero: 'M',
    bolsista: true,
  },
  {
    id: 'aluno-19',
    name: 'Sara Vidal',
    turmaId: 'turma-8',
    serieId: 'serie-7',
    escolaId: 'escola-3',
    genero: 'F',
    bolsista: false,
  },
  {
    id: 'aluno-20',
    name: 'Tiago Sousa',
    turmaId: 'turma-8',
    serieId: 'serie-7',
    escolaId: 'escola-3',
    genero: 'M',
    bolsista: true,
  },
  // Turma 9
  {
    id: 'aluno-21',
    name: 'Ursula Queiroz',
    turmaId: 'turma-9',
    serieId: 'serie-8',
    escolaId: 'escola-3',
    genero: 'F',
    bolsista: false,
  },
  {
    id: 'aluno-22',
    name: 'Vinícius Lopes',
    turmaId: 'turma-9',
    serieId: 'serie-8',
    escolaId: 'escola-3',
    genero: 'M',
    bolsista: true,
  },
  {
    id: 'aluno-23',
    name: 'William Torres',
    turmaId: 'turma-9',
    serieId: 'serie-8',
    escolaId: 'escola-3',
    genero: 'M',
    bolsista: false,
  },
  {
    id: 'aluno-24',
    name: 'Xuxa Meneghel',
    turmaId: 'turma-9',
    serieId: 'serie-8',
    escolaId: 'escola-3',
    genero: 'F',
    bolsista: true,
  },
  {
    id: 'aluno-25',
    name: 'Yasmin Duarte',
    turmaId: 'turma-9',
    serieId: 'serie-8',
    escolaId: 'escola-3',
    genero: 'F',
    bolsista: false,
  },
  // Turma 10
  {
    id: 'aluno-26',
    name: 'Zeca Baleiro',
    turmaId: 'turma-10',
    serieId: 'serie-9',
    escolaId: 'escola-3',
    genero: 'M',
    bolsista: true,
  },
  {
    id: 'aluno-27',
    name: 'André Gomes',
    turmaId: 'turma-10',
    serieId: 'serie-9',
    escolaId: 'escola-3',
    genero: 'M',
    bolsista: false,
  },
  {
    id: 'aluno-28',
    name: 'Bianca Lopes',
    turmaId: 'turma-10',
    serieId: 'serie-9',
    escolaId: 'escola-3',
    genero: 'F',
    bolsista: false,
  },
  {
    id: 'aluno-29',
    name: 'Caio Chagas',
    turmaId: 'turma-10',
    serieId: 'serie-9',
    escolaId: 'escola-3',
    genero: 'M',
    bolsista: true,
  },
  {
    id: 'aluno-30',
    name: 'Debora Leite',
    turmaId: 'turma-10',
    serieId: 'serie-9',
    escolaId: 'escola-3',
    genero: 'F',
    bolsista: false,
  },
];

const categories = [
  {
    key: 'escola',
    label: 'Escola',
    itens: mockEscolas,
    selectedIds: [],
  },
  {
    key: 'serie',
    label: 'Série',
    dependsOn: ['escola'],
    itens: mockSeries,
    filteredBy: [{ key: 'escola', internalField: 'escolaId' }], // Dita oq ele precisa para filtrar
    selectedIds: [],
  },
  {
    key: 'turma',
    label: 'Turma',
    dependsOn: ['escola', 'serie'],
    itens: mockTurmas,
    filteredBy: [
      { key: 'escola', internalField: 'escolaId' },
      { key: 'serie', internalField: 'serieId' },
    ], // Dita oq ele precisa para filtrar
    selectedIds: [],
  },
  {
    key: 'aluno', // Dita a Pesquisa
    label: 'Aluno', // Dita a Label
    dependsOn: ['escola', 'serie', 'turma'], // Dita oq ele precisa para habilitar
    itens: mockAlunos, // Dita os Itens
    filteredBy: [
      { key: 'escola', internalField: 'escolaId' },
      { key: 'serie', internalField: 'serieId' },
      { key: 'turma', internalField: 'turmaId' },
    ], // Dita oq ele precisa para filtrar
    selectedIds: [],
  },
] as CategoryConfig[];

// Exemplo 1: Cenário completo com múltiplas escolas
export const FullCheckboxGroup: Story = () => {
  const [stateCategories, setStateCategories] =
    useState<CategoryConfig[]>(categories);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Checkbox Group Completo
      </h2>
      <p className="text-text-700">
        Grupo de checkboxes com hierarquia de dependência e desabilitação de
        itens filhos quando o pai não está selecionado
      </p>
      <CheckboxGroup
        categories={stateCategories}
        onCategoriesChange={setStateCategories}
      />
    </div>
  );
};

// Exemplo 2: Apenas uma escola (auto-seleção)
const singleSchoolData: Item[] = [
  {
    id: 'escola-1',
    name: 'Escola Municipal Central',
    cidade: 'São Paulo',
    tipo: 'Pública',
  },
];

const singleSchoolCategories: CategoryConfig[] = [
  {
    key: 'escola',
    label: 'Escola',
    itens: singleSchoolData,
    selectedIds: [],
  },
  {
    key: 'serie',
    label: 'Série',
    dependsOn: ['escola'],
    itens: mockSeries.filter((serie) => serie.escolaId === 'escola-1'),
    filteredBy: [{ key: 'escola', internalField: 'escolaId' }],
    selectedIds: [],
  },
  {
    key: 'turma',
    label: 'Turma',
    dependsOn: ['escola', 'serie'],
    itens: mockTurmas.filter((turma) => turma.escolaId === 'escola-1'),
    filteredBy: [
      { key: 'escola', internalField: 'escolaId' },
      { key: 'serie', internalField: 'serieId' },
    ],
    selectedIds: [],
  },
  {
    key: 'aluno',
    label: 'Aluno',
    dependsOn: ['escola', 'serie', 'turma'],
    itens: mockAlunos.filter((aluno) => aluno.escolaId === 'escola-1'),
    filteredBy: [
      { key: 'escola', internalField: 'escolaId' },
      { key: 'serie', internalField: 'serieId' },
      { key: 'turma', internalField: 'turmaId' },
    ],
    selectedIds: [],
  },
];

export const SingleSchoolExample: Story = () => {
  const [stateCategories, setStateCategories] = useState<CategoryConfig[]>(
    singleSchoolCategories
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">Escola Única</h2>
      <p className="text-text-700">
        Quando há apenas uma escola, ela é selecionada automaticamente e o
        accordion não é mostrado.
      </p>
      <CheckboxGroup
        categories={stateCategories}
        onCategoriesChange={setStateCategories}
      />
    </div>
  );
};

// Exemplo 3: Apenas escola e série (sem turma/aluno)
const schoolAndSeriesCategories: CategoryConfig[] = [
  {
    key: 'escola',
    label: 'Escola',
    itens: mockEscolas,
    selectedIds: [],
  },
  {
    key: 'serie',
    label: 'Série',
    dependsOn: ['escola'],
    itens: mockSeries,
    filteredBy: [{ key: 'escola', internalField: 'escolaId' }],
    selectedIds: [],
  },
];

export const SchoolAndSeriesOnly: Story = () => {
  const [stateCategories, setStateCategories] = useState<CategoryConfig[]>(
    schoolAndSeriesCategories
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Apenas Escola e Série
      </h2>
      <p className="text-text-700">
        Exemplo simplificado com apenas duas categorias hierárquicas.
      </p>
      <CheckboxGroup
        categories={stateCategories}
        onCategoriesChange={setStateCategories}
      />
    </div>
  );
};

// Exemplo 4: Cenário com apenas uma série (auto-seleção em cascata)
const singleSeriesData: Item[] = [
  {
    id: 'serie-unica',
    name: '6º Ano',
    escolaId: 'escola-1',
  },
];

const singleSeriesCategories: CategoryConfig[] = [
  {
    key: 'escola',
    label: 'Escola',
    itens: singleSchoolData,
    selectedIds: [],
  },
  {
    key: 'serie',
    label: 'Série',
    dependsOn: ['escola'],
    itens: singleSeriesData,
    filteredBy: [{ key: 'escola', internalField: 'escolaId' }],
    selectedIds: [],
  },
  {
    key: 'turma',
    label: 'Turma',
    dependsOn: ['escola', 'serie'],
    itens: [
      {
        id: 'turma-a',
        name: 'A',
        serieId: 'serie-unica',
        escolaId: 'escola-1',
        turno: 'Manhã',
      },
      {
        id: 'turma-b',
        name: 'B',
        serieId: 'serie-unica',
        escolaId: 'escola-1',
        turno: 'Tarde',
      },
    ],
    filteredBy: [
      { key: 'escola', internalField: 'escolaId' },
      { key: 'serie', internalField: 'serieId' },
    ],
    selectedIds: [],
  },
];

export const SingleSeriesExample: Story = () => {
  const [stateCategories, setStateCategories] = useState<CategoryConfig[]>(
    singleSeriesCategories
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">Série Única</h2>
      <p className="text-text-700">
        Exemplo com escola única e série única - ambos são auto-selecionados e
        ocultos.
      </p>
      <CheckboxGroup
        categories={stateCategories}
        onCategoriesChange={setStateCategories}
      />
    </div>
  );
};

// Exemplo 5: Sem dependências (categorias independentes)
const independentCategories: CategoryConfig[] = [
  {
    key: 'categoria',
    label: 'Categoria',
    itens: [
      { id: 'cat-1', name: 'Categoria A' },
      { id: 'cat-2', name: 'Categoria B' },
      { id: 'cat-3', name: 'Categoria C' },
    ],
    selectedIds: [],
  },
  {
    key: 'tipo',
    label: 'Tipo',
    itens: [
      { id: 'tipo-1', name: 'Tipo 1' },
      { id: 'tipo-2', name: 'Tipo 2' },
      { id: 'tipo-3', name: 'Tipo 3' },
    ],
    selectedIds: [],
  },
  {
    key: 'status',
    label: 'Status',
    itens: [
      { id: 'status-1', name: 'Ativo' },
      { id: 'status-2', name: 'Inativo' },
      { id: 'status-3', name: 'Pendente' },
    ],
    selectedIds: [],
  },
];

export const IndependentCategories: Story = () => {
  const [stateCategories, setStateCategories] = useState<CategoryConfig[]>(
    independentCategories
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Categorias Independentes
      </h2>
      <p className="text-text-700">
        Exemplo com categorias que não possuem dependências entre si.
      </p>
      <CheckboxGroup
        categories={stateCategories}
        onCategoriesChange={setStateCategories}
      />
    </div>
  );
};

// Exemplo 6: Categoria com item único
const singleItemCategory: CategoryConfig[] = [
  {
    key: 'regiao',
    label: 'Região',
    itens: [{ id: 'regiao-unica', name: 'Região Sul' }],
    selectedIds: [],
  },
  {
    key: 'cidade',
    label: 'Cidade',
    dependsOn: ['regiao'],
    itens: [
      { id: 'cidade-1', name: 'São Paulo', regiaoId: 'regiao-unica' },
      { id: 'cidade-2', name: 'Curitiba', regiaoId: 'regiao-unica' },
      { id: 'cidade-3', name: 'Porto Alegre', regiaoId: 'regiao-unica' },
    ],
    filteredBy: [{ key: 'regiao', internalField: 'regiaoId' }],
    selectedIds: [],
  },
];

export const SingleItemCategory: Story = () => {
  const [stateCategories, setStateCategories] =
    useState<CategoryConfig[]>(singleItemCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Categoria com Item Único
      </h2>
      <p className="text-text-700">
        Exemplo onde a primeira categoria tem apenas um item (auto-selecionado e
        oculto).
      </p>
      <CheckboxGroup
        categories={stateCategories}
        onCategoriesChange={setStateCategories}
      />
    </div>
  );
};

// Exemplo 7: Cenário com pré-seleção
const preSelectedCategories: CategoryConfig[] = [
  {
    key: 'escola',
    label: 'Escola',
    itens: mockEscolas,
    selectedIds: ['escola-1', 'escola-2'], // Pré-selecionado
  },
  {
    key: 'serie',
    label: 'Série',
    dependsOn: ['escola'],
    itens: mockSeries,
    filteredBy: [{ key: 'escola', internalField: 'escolaId' }],
    selectedIds: ['serie-1', 'serie-3'], // Pré-selecionado
  },
  {
    key: 'turma',
    label: 'Turma',
    dependsOn: ['escola', 'serie'],
    itens: mockTurmas,
    filteredBy: [
      { key: 'escola', internalField: 'escolaId' },
      { key: 'serie', internalField: 'serieId' },
    ],
    selectedIds: [],
  },
];

export const PreSelectedExample: Story = () => {
  const [stateCategories, setStateCategories] = useState<CategoryConfig[]>(
    preSelectedCategories
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">Com Pré-seleção</h2>
      <p className="text-text-700">
        Exemplo com alguns itens já pré-selecionados para demonstrar o estado
        inicial.
      </p>
      <CheckboxGroup
        categories={stateCategories}
        onCategoriesChange={setStateCategories}
      />
    </div>
  );
};
