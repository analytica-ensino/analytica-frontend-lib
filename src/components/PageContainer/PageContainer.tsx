import { ReactNode } from 'react';
import { cn } from '../../utils/utils';

export interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({
  children,
  className,
}: Readonly<PageContainerProps>) {
  return (
    <div
      className={cn(
        'flex flex-col w-full h-full relative justify-center items-center pb-5',
        className
      )}
    >
      <div className="flex flex-col w-full h-full max-w-[1000px] z-10 lg:px-0 px-4">
        {children}
      </div>
    </div>
  );
}

export default PageContainer;
