import type { Story } from '@ladle/react';
import {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
} from './Skeleton';

/**
 * Showcase principal: demonstração completa dos componentes Skeleton
 */
export const AllSkeletons: Story = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h2 className="font-bold text-3xl text-text-900">Skeleton</h2>
      <p className="text-text-700">
        Componentes de carregamento que simulam a estrutura do conteúdo enquanto
        os dados estão sendo carregados. Disponíveis em diferentes variantes e
        animações.
      </p>

      {/* Variantes básicas */}
      <h3 className="font-bold text-2xl text-text-900">Variantes Básicas:</h3>
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-medium text-text-900 mb-2">Texto</div>
          <Skeleton variant="text" width={200} height={20} />
        </div>
        <div>
          <div className="font-medium text-text-900 mb-2">Circular</div>
          <Skeleton variant="circular" width={50} height={50} />
        </div>
        <div>
          <div className="font-medium text-text-900 mb-2">Retangular</div>
          <Skeleton variant="rectangular" width={200} height={100} />
        </div>
        <div>
          <div className="font-medium text-text-900 mb-2">Arredondado</div>
          <Skeleton variant="rounded" width={200} height={100} />
        </div>
      </div>

      {/* Componentes específicos */}
      <h3 className="font-bold text-2xl text-text-900">
        Componentes Específicos:
      </h3>

      <div>
        <div className="font-medium text-text-900 mb-3">SkeletonCard</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard showAvatar={false} showActions={false} />
        </div>
      </div>

      <div>
        <div className="font-medium text-text-900 mb-3">SkeletonList</div>
        <SkeletonList items={3} />
      </div>

      <div>
        <div className="font-medium text-text-900 mb-3">SkeletonTable</div>
        <SkeletonTable rows={4} columns={3} />
      </div>

      {/* Exemplos de uso real */}
      <h3 className="font-bold text-2xl text-text-900">Exemplos de Uso:</h3>

      <div>
        <div className="font-medium text-text-900 mb-3">Perfil de Usuário</div>
        <div className="max-w-md p-4 border border-border-200 rounded-lg">
          <div className="flex items-center space-x-4 mb-4">
            <SkeletonCircle width={60} height={60} />
            <div className="flex-1">
              <SkeletonText width="70%" height={20} className="mb-2" />
              <SkeletonText width="50%" height={16} />
            </div>
          </div>
          <SkeletonText lines={3} spacing="small" />
        </div>
      </div>

      <div>
        <div className="font-medium text-text-900 mb-3">Dashboard</div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonTable rows={5} columns={4} />
        </div>
      </div>

      <div>
        <div className="font-medium text-text-900 mb-3">Feed de Conteúdo</div>
        <div className="max-w-2xl space-y-4">
          <SkeletonList items={3} />
        </div>
      </div>
    </div>
  );
};

/**
 * Estados básicos isolados
 */
export const BasicVariants: Story = () => (
  <div className="flex flex-col gap-4">
    <div>
      <div className="font-medium text-text-900 mb-2">Texto</div>
      <Skeleton variant="text" width={200} height={20} />
    </div>
    <div>
      <div className="font-medium text-text-900 mb-2">Circular</div>
      <Skeleton variant="circular" width={50} height={50} />
    </div>
    <div>
      <div className="font-medium text-text-900 mb-2">Retangular</div>
      <Skeleton variant="rectangular" width={200} height={100} />
    </div>
    <div>
      <div className="font-medium text-text-900 mb-2">Arredondado</div>
      <Skeleton variant="rounded" width={200} height={100} />
    </div>
  </div>
);

/**
 * Exemplo de SkeletonCard
 */
export const CardExamples: Story = () => (
  <div className="space-y-4">
    <div>
      <div className="font-medium text-text-900 mb-2">Card Completo</div>
      <SkeletonCard />
    </div>
    <div>
      <div className="font-medium text-text-900 mb-2">Card Sem Avatar</div>
      <SkeletonCard showAvatar={false} />
    </div>
    <div>
      <div className="font-medium text-text-900 mb-2">Card Sem Ações</div>
      <SkeletonCard showActions={false} />
    </div>
    <div>
      <div className="font-medium text-text-900 mb-2">Card Com Mais Linhas</div>
      <SkeletonCard lines={4} />
    </div>
  </div>
);

/**
 * Exemplo de SkeletonList
 */
export const ListExamples: Story = () => (
  <div className="space-y-4">
    <div>
      <div className="font-medium text-text-900 mb-2">Lista Padrão</div>
      <SkeletonList />
    </div>
    <div>
      <div className="font-medium text-text-900 mb-2">Lista Com Mais Itens</div>
      <SkeletonList items={5} />
    </div>
    <div>
      <div className="font-medium text-text-900 mb-2">Lista Sem Avatar</div>
      <SkeletonList showAvatar={false} />
    </div>
  </div>
);

/**
 * Exemplo de SkeletonTable
 */
export const TableExamples: Story = () => (
  <div className="space-y-4">
    <div>
      <div className="font-medium text-text-900 mb-2">Tabela Padrão</div>
      <SkeletonTable />
    </div>
    <div>
      <div className="font-medium text-text-900 mb-2">
        Tabela Com Mais Linhas
      </div>
      <SkeletonTable rows={8} />
    </div>
    <div>
      <div className="font-medium text-text-900 mb-2">
        Tabela Com Mais Colunas
      </div>
      <SkeletonTable columns={6} />
    </div>
  </div>
);

/**
 * Comparação de animações
 */
export const AnimationComparison: Story = () => (
  <div className="space-y-4">
    <div>
      <div className="font-medium text-text-900 mb-2">Animação Pulse</div>
      <Skeleton width={200} height={20} animation="pulse" />
    </div>
    <div>
      <div className="font-medium text-text-900 mb-2">Sem Animação</div>
      <Skeleton width={200} height={20} animation="none" />
    </div>
  </div>
);
