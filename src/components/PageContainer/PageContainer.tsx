import { ReactNode } from 'react';
import { cn } from '../../utils/utils';

export interface PageContainerProps {
  /** Conteudo da pagina renderizado dentro do container interno */
  children: ReactNode;
  /** Classes CSS adicionais aplicadas ao container externo (wrapper full-width) */
  className?: string;
  /**
   * Classes CSS adicionais aplicadas ao container interno (limita a largura).
   * Use para sobrescrever a `max-w-[1000px]` padrao em projetos que precisam
   * de uma largura diferente. Ex.: `innerClassName="max-w-[1150px]"`.
   * Tailwind-merge resolve o conflito mantendo apenas o ultimo `max-w-*`.
   */
  innerClassName?: string;
}

export function PageContainer({
  children,
  className,
  innerClassName,
}: Readonly<PageContainerProps>) {
  return (
    <div
      className={cn(
        'flex flex-col w-full min-h-full items-center pb-5 relative',
        className
      )}
    >
      <div
        className={cn(
          'flex flex-col w-full max-w-[1000px] lg:px-0 px-4',
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default PageContainer;
