import type { ReactNode } from 'react';
import Button from '../Button/Button';
import EmptyState from '../EmptyState/EmptyState';
import { SkeletonRounded } from '../Skeleton/Skeleton';
import Text from '../Text/Text';

/** The grid of a staff library screen: two columns on a phone, six on a computer. */
const SHELF_GRID =
  'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6';

export interface EbookShelfProps {
  loading: boolean;
  error: boolean;
  /** Nothing matches the filters */
  empty: boolean;
  onRetry: () => void;
  /** The cards (`<li>`), when there are books */
  children: ReactNode;
}

/**
 * The books of a staff library screen, or what stands in for them: the
 * skeletons while loading, the error with a retry, or "Nenhum livro
 * encontrado".
 */
export const EbookShelf = ({
  loading,
  error,
  empty,
  onRetry,
  children,
}: Readonly<EbookShelfProps>) => {
  if (error) {
    return (
      <div className="flex flex-col items-start gap-3" role="alert">
        <Text size="sm" className="text-error-600">
          Não foi possível carregar os livros.
        </Text>
        <Button variant="outline" size="small" onClick={onRetry}>
          Tentar novamente
        </Button>
      </div>
    );
  }
  if (loading) {
    return (
      <div className={SHELF_GRID} data-testid="ebook-shelf-loading">
        {Array.from({ length: 6 }, (_, index) => (
          <SkeletonRounded key={index} className="aspect-[2/3] w-full" />
        ))}
      </div>
    );
  }
  if (empty) {
    return (
      <EmptyState
        title="Nenhum livro encontrado"
        description="Tente outros filtros ou outra busca."
        size="compact"
      />
    );
  }
  return <ul className={SHELF_GRID}>{children}</ul>;
};
