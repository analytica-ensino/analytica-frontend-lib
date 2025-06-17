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
