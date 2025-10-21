import type { Story } from '@ladle/react';
import Table from './Table';
import {
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
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
              {state !== 'disabled' ? 'Ação disponível' : 'Ação bloqueada'}
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
 * barras de progresso, ícones e linhas clicáveis para navegação.
 */
export const ActivityTable: Story = () => {
  const handleRowClick = (activityId: number) => {
    alert(`Navegando para atividade #${activityId}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 className="font-bold text-2xl text-text-900 mb-4">
        Tabela de Atividades
      </h2>
      <p className="text-text-700 mb-6">
        Exemplo de tabela de atividades escolares com badges de status, barras
        de progresso e linhas clicáveis.
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Início</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Escola</TableHead>
            <TableHead>Ano</TableHead>
            <TableHead>Matéria</TableHead>
            <TableHead>Turma</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Conclusão</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow clickable onClick={() => handleRowClick(1)}>
            <TableCell>12/05</TableCell>
            <TableCell>12/05</TableCell>
            <TableCell>Explorando a Fotossíntese: Atividade...</TableCell>
            <TableCell>Escola Estadual Professor J...</TableCell>
            <TableCell>3° ano</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <FileText
                  size={20}
                  className="text-success-600"
                  weight="fill"
                />
                <span>Biologia</span>
              </div>
            </TableCell>
            <TableCell>A</TableCell>
            <TableCell>
              <Badge variant="solid" action="error" size="small">
                VENCIDA
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <ProgressBar
                  value={90}
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

          <TableRow clickable onClick={() => handleRowClick(2)}>
            <TableCell>12/05</TableCell>
            <TableCell>12/05</TableCell>
            <TableCell>Explorando a Fotossíntese: Atividade...</TableCell>
            <TableCell>Escola Estadual Professor J...</TableCell>
            <TableCell>3° ano</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <FileText
                  size={20}
                  className="text-success-600"
                  weight="fill"
                />
                <span>Biologia</span>
              </div>
            </TableCell>
            <TableCell>A</TableCell>
            <TableCell>
              <Badge variant="solid" action="error" size="small">
                VENCIDA
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <ProgressBar
                  value={90}
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

          <TableRow clickable onClick={() => handleRowClick(3)}>
            <TableCell>12/05</TableCell>
            <TableCell>12/05</TableCell>
            <TableCell>Explorando a Fotossíntese: Atividade...</TableCell>
            <TableCell>Escola Estadual Professor J...</TableCell>
            <TableCell>3° ano</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <FileText
                  size={20}
                  className="text-success-600"
                  weight="fill"
                />
                <span>Biologia</span>
              </div>
            </TableCell>
            <TableCell>A</TableCell>
            <TableCell>
              <Badge variant="solid" action="error" size="small">
                VENCIDA
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <ProgressBar
                  value={90}
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
        </TableBody>
      </Table>
    </div>
  );
};
