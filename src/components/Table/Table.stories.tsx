import type { Story } from '@ladle/react';
import Table, {
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  useTableSort,
} from './Table';
import Badge from '../Badge/Badge';
import ProgressBar from '../ProgressBar/ProgressBar';
import { CaretRight, FileText } from 'phosphor-react';

// Definindo os estados para demonstração
const rowStates = ['default', 'selected', 'invalid', 'disabled'] as const;

/**
 * Showcase principal: todas as combinações possíveis da Table
 */
export const AllTables: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
    <h2 className="font-bold text-3xl text-text-900">Table</h2>
    <p className="text-text-700">
      Variações possíveis do componente <code>Table</code>:
    </p>

    {/* Tabela básica */}
    <h3 className="font-bold text-2xl text-text-900">Tabela Básica</h3>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>João Silva</TableCell>
          <TableCell>joao@exemplo.com</TableCell>
          <TableCell>Ativo</TableCell>
          <TableCell className="text-right">Editar</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Maria Souza</TableCell>
          <TableCell>maria@exemplo.com</TableCell>
          <TableCell>Inativo</TableCell>
          <TableCell className="text-right">Editar</TableCell>
        </TableRow>
      </TableBody>
    </Table>

    {/* Tabela com todos os componentes */}
    <h3 className="font-bold text-2xl text-text-900">Tabela Completa</h3>
    <Table>
      <TableCaption>Lista de usuários do sistema</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>1</TableCell>
          <TableCell>Ana Costa</TableCell>
          <TableCell>ana@exemplo.com</TableCell>
          <TableCell className="text-right">Ativo</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>2</TableCell>
          <TableCell>Carlos Pereira</TableCell>
          <TableCell>carlos@exemplo.com</TableCell>
          <TableCell className="text-right">Ativo</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>3</TableCell>
          <TableCell>Lucas Oliveira</TableCell>
          <TableCell>lucas@exemplo.com</TableCell>
          <TableCell className="text-right">Inativo</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">3 usuários</TableCell>
        </TableRow>
      </TableFooter>
    </Table>

    {/* Demonstração de estados das linhas */}
    <h3 className="font-bold text-2xl text-text-900">Estados das Linhas</h3>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Estado</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead className="text-right">Ação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rowStates.map((state) => (
          <TableRow key={state} state={state}>
            <TableCell className="capitalize">{state}</TableCell>
            <TableCell>
              {state === 'default' && 'Linha normal'}
              {state === 'selected' && 'Linha selecionada (destaque)'}
              {state === 'invalid' && 'Linha com erro/validação'}
              {state === 'disabled' && 'Linha desabilitada'}
            </TableCell>
            <TableCell className="text-right">
              {state === 'disabled' ? 'Ação bloqueada' : 'Ação disponível'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

// Stories individuais para referência rápida
export const BasicTable: Story = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Nome</TableHead>
        <TableHead>Idade</TableHead>
        <TableHead>Cidade</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>João</TableCell>
        <TableCell>25</TableCell>
        <TableCell>São Paulo</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Maria</TableCell>
        <TableCell>30</TableCell>
        <TableCell>Rio de Janeiro</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

export const WithFooter: Story = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Item</TableHead>
        <TableHead className="text-right">Quantidade</TableHead>
        <TableHead className="text-right">Preço</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Notebook</TableCell>
        <TableCell className="text-right">1</TableCell>
        <TableCell className="text-right">R$ 4.500,00</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Mouse</TableCell>
        <TableCell className="text-right">2</TableCell>
        <TableCell className="text-right">R$ 150,00</TableCell>
      </TableRow>
    </TableBody>
    <TableFooter>
      <TableRow>
        <TableCell colSpan={2}>Total</TableCell>
        <TableCell className="text-right">R$ 4.800,00</TableCell>
      </TableRow>
    </TableFooter>
  </Table>
);

export const WithCaption: Story = () => (
  <Table>
    <TableCaption>Lista de tarefas pendentes</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Tarefa</TableHead>
        <TableHead>Responsável</TableHead>
        <TableHead className="text-right">Prazo</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Desenvolver componente</TableCell>
        <TableCell>João</TableCell>
        <TableCell className="text-right">15/06</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Revisar código</TableCell>
        <TableCell>Maria</TableCell>
        <TableCell className="text-right">20/06</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

export const RowStates: Story = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Estado</TableHead>
        <TableHead>Visualização</TableHead>
        <TableHead>Descrição</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow state="default">
        <TableCell>default</TableCell>
        <TableCell>Normal</TableCell>
        <TableCell>Estado padrão da linha</TableCell>
      </TableRow>
      <TableRow state="selected">
        <TableCell>selected</TableCell>
        <TableCell>Selecionado</TableCell>
        <TableCell>Linha destacada como selecionada</TableCell>
      </TableRow>
      <TableRow state="invalid">
        <TableCell>invalid</TableCell>
        <TableCell>Inválido</TableCell>
        <TableCell>Linha com dados inválidos ou erro</TableCell>
      </TableRow>
      <TableRow state="disabled">
        <TableCell>disabled</TableCell>
        <TableCell>Desabilitado</TableCell>
        <TableCell>Linha desabilitada para interação</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

/**
 * Tabela de Atividades
 * Demonstra uma tabela completa de atividades escolares com badges de status,
 * barras de progresso, ícones, linhas clicáveis e ordenação por coluna.
 */
export const ActivityTable: Story = () => {
  // Dados das atividades
  const activitiesData = [
    {
      id: 1,
      inicio: '12/05',
      prazo: '12/05',
      titulo: 'Explorando a Fotossíntese: Atividade...',
      escola: 'Escola Estadual Professor J...',
      ano: '3° ano',
      materia: 'Biologia',
      materiaIcon: 'success',
      turma: 'A',
      status: 'VENCIDA',
      statusAction: 'error' as const,
      conclusao: 90,
    },
    {
      id: 2,
      inicio: '12/05',
      prazo: '12/05',
      titulo: 'Explorando a Fotossíntese: Atividade...',
      escola: 'Escola Estadual Professor J...',
      ano: '3° ano',
      materia: 'Biologia',
      materiaIcon: 'success',
      turma: 'A',
      status: 'VENCIDA',
      statusAction: 'error' as const,
      conclusao: 90,
    },
    {
      id: 3,
      inicio: '12/05',
      prazo: '12/05',
      titulo: 'Explorando a Fotossíntese: Atividade...',
      escola: 'Escola Estadual Professor J...',
      ano: '3° ano',
      materia: 'Biologia',
      materiaIcon: 'success',
      turma: 'A',
      status: 'VENCIDA',
      statusAction: 'error' as const,
      conclusao: 90,
    },
    {
      id: 4,
      inicio: '15/05',
      prazo: '20/05',
      titulo: 'Sistema Circulatório: Quiz Interativo',
      escola: 'Colégio Santa Maria',
      ano: '2° ano',
      materia: 'Biologia',
      materiaIcon: 'success',
      turma: 'B',
      status: 'ATIVA',
      statusAction: 'success' as const,
      conclusao: 65,
    },
    {
      id: 5,
      inicio: '18/05',
      prazo: '25/05',
      titulo: 'Equações do Segundo Grau',
      escola: 'Escola Estadual Dom Pedro II',
      ano: '1° ano',
      materia: 'Matemática',
      materiaIcon: 'primary',
      turma: 'C',
      status: 'ATIVA',
      statusAction: 'success' as const,
      conclusao: 45,
    },
    {
      id: 6,
      inicio: '20/05',
      prazo: '28/05',
      titulo: 'A Revolução Industrial e suas...',
      escola: 'Instituto Educacional São José',
      ano: '3° ano',
      materia: 'História',
      materiaIcon: 'warning',
      turma: 'A',
      status: 'ATIVA',
      statusAction: 'success' as const,
      conclusao: 30,
    },
    {
      id: 7,
      inicio: '22/05',
      prazo: '30/05',
      titulo: 'Leis de Newton: Exercícios Práticos',
      escola: 'Colégio Objetivo',
      ano: '1° ano',
      materia: 'Física',
      materiaIcon: 'info',
      turma: 'D',
      status: 'ATIVA',
      statusAction: 'success' as const,
      conclusao: 80,
    },
    {
      id: 8,
      inicio: '10/05',
      prazo: '18/05',
      titulo: 'Verbos Irregulares em Inglês',
      escola: 'Escola Internacional Anglo',
      ano: '2° ano',
      materia: 'Inglês',
      materiaIcon: 'error',
      turma: 'B',
      status: 'PRÓXIMA',
      statusAction: 'warning' as const,
      conclusao: 15,
    },
  ];

  // Hook personalizado para gerenciar a ordenação com sincronização de URL
  const {
    sortedData: sortedActivities,
    sortColumn,
    sortDirection,
    handleSort,
  } = useTableSort(activitiesData, { syncWithUrl: true });

  const handleRowClick = (activityId: number) => {
    alert(`Navegando para atividade #${activityId}`);
  };

  const getIconColor = (icon: string) => {
    const colors: Record<string, string> = {
      success: 'text-success-600',
      primary: 'text-primary-600',
      warning: 'text-warning-600',
      info: 'text-info-600',
      error: 'text-error-600',
    };
    return colors[icon] || 'text-text-600';
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 className="font-bold text-2xl text-text-900 mb-4">
        Tabela de Atividades
      </h2>
      <p className="text-text-700 mb-6">
        Exemplo de tabela de atividades escolares com badges de status, barras
        de progresso, linhas clicáveis e ordenação sincronizada com URL. Clique
        nos headers para ordenar - a URL será atualizada com os parâmetros de
        sortBy e sort (ASC/DESC). Copie e cole a URL para reproduzir o estado de
        ordenação.
      </p>

      <Table variant="borderless">
        <TableHeader>
          <TableRow variant="borderless">
            <TableHead
              sortDirection={sortColumn === 'inicio' ? sortDirection : null}
              onSort={() => handleSort('inicio')}
            >
              Início
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'prazo' ? sortDirection : null}
              onSort={() => handleSort('prazo')}
            >
              Prazo
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'titulo' ? sortDirection : null}
              onSort={() => handleSort('titulo')}
            >
              Título
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'escola' ? sortDirection : null}
              onSort={() => handleSort('escola')}
            >
              Escola
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'ano' ? sortDirection : null}
              onSort={() => handleSort('ano')}
            >
              Ano
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'materia' ? sortDirection : null}
              onSort={() => handleSort('materia')}
            >
              Matéria
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'turma' ? sortDirection : null}
              onSort={() => handleSort('turma')}
            >
              Turma
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'status' ? sortDirection : null}
              onSort={() => handleSort('status')}
            >
              Status
            </TableHead>
            <TableHead
              sortDirection={sortColumn === 'conclusao' ? sortDirection : null}
              onSort={() => handleSort('conclusao')}
            >
              Conclusão
            </TableHead>
            <TableHead sortable={false} className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedActivities.map((activity) => (
            <TableRow
              key={activity.id}
              clickable
              onClick={() => handleRowClick(activity.id)}
            >
              <TableCell>{activity.inicio}</TableCell>
              <TableCell>{activity.prazo}</TableCell>
              <TableCell>{activity.titulo}</TableCell>
              <TableCell>{activity.escola}</TableCell>
              <TableCell>{activity.ano}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileText
                    size={20}
                    className={getIconColor(activity.materiaIcon)}
                    weight="fill"
                  />
                  <span>{activity.materia}</span>
                </div>
              </TableCell>
              <TableCell>{activity.turma}</TableCell>
              <TableCell>
                <Badge
                  variant="solid"
                  action={activity.statusAction}
                  size="small"
                >
                  {activity.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <ProgressBar
                    value={activity.conclusao}
                    variant="blue"
                    size="medium"
                    layout="compact"
                    showPercentage
                    compactWidth="w-[100px]"
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <CaretRight size={20} className="text-text-600" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

/**
 * Empty State Without Search
 * Shows message and optional action button when table has no data
 */
export const EmptyState: Story = () => {
  const handleAddItem = () => {
    alert('Adicionar novo item');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">Empty State</h2>

      <div>
        <h3 className="font-bold text-xl mb-4">Com botão de ação</h3>
        <Table
          showEmpty
          emptyState={{
            onButtonClick: handleAddItem,
            buttonText: 'Adicionar Atividade',
          }}
        >
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Escola</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody />
        </Table>
      </div>

      <div>
        <h3 className="font-bold text-xl mb-4">Sem botão de ação</h3>
        <Table
          showEmpty
          emptyState={{
            message: 'Nenhuma atividade disponível',
          }}
        >
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Escola</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody />
        </Table>
      </div>

      <div>
        <h3 className="font-bold text-xl mb-4">Mensagem customizada</h3>
        <Table
          showEmpty
          emptyState={{
            message:
              'Você ainda não criou nenhuma turma. Comece criando sua primeira turma!',
            buttonText: 'Criar Turma',
            onButtonClick: handleAddItem,
          }}
        >
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>Alunos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody />
        </Table>
      </div>
    </div>
  );
};

/**
 * No Search Results
 * Shows illustration and message when search returns no results
 */
export const NoSearchResults: Story = () => {
  // Placeholder image for demonstration
  const noSearchImage = 'https://via.placeholder.com/288x288?text=No+Results';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">No Search Results</h2>

      <div>
        <h3 className="font-bold text-xl mb-4">Com props padrão</h3>
        <Table
          showNoSearchResult
          noSearchResultState={{
            image: noSearchImage,
          }}
        >
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody />
        </Table>
      </div>

      <div>
        <h3 className="font-bold text-xl mb-4">Com mensagens customizadas</h3>
        <Table
          showNoSearchResult
          noSearchResultState={{
            image: noSearchImage,
            title: 'Nenhum aluno encontrado',
            description:
              'Não encontramos nenhum aluno com esse nome. Verifique a ortografia ou tente usar outros filtros.',
          }}
        >
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Turma</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody />
        </Table>
      </div>
    </div>
  );
};

/**
 * Empty States Comparison
 * Shows both empty state scenarios side by side
 */
export const EmptyStatesComparison: Story = () => {
  const noSearchImage = 'https://via.placeholder.com/288x288?text=No+Results';
  const handleAddItem = () => alert('Add item');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      <h2 className="font-bold text-3xl text-text-900">
        Comparação de Empty States
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <h3 className="font-bold text-xl mb-4">Sem busca ativa</h3>
          <p className="text-text-600 mb-4">Mostra empty state com ação</p>
          <Table
            showEmpty
            emptyState={{
              message: 'Nenhuma atividade cadastrada',
              buttonText: 'Criar Atividade',
              onButtonClick: handleAddItem,
            }}
          >
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody />
          </Table>
        </div>

        <div>
          <h3 className="font-bold text-xl mb-4">Com busca ativa</h3>
          <p className="text-text-600 mb-4">Mostra no search result</p>
          <Table
            showNoSearchResult
            noSearchResultState={{
              image: noSearchImage,
            }}
          >
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody />
          </Table>
        </div>
      </div>
    </div>
  );
};
